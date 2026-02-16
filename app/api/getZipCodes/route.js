import { NextResponse } from 'next/server';
import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let zipCodeGeoJSON = null;
let zipFeatureIndex = null;
let zipDataLoadPromise = null;
const resultCache = new Map();
const MAX_CACHE_ENTRIES = 300;

const bboxesOverlap = (a, b) => {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
};

const normalizeRing = (ring) => {
  if (!Array.isArray(ring) || ring.length < 3) {
    return null;
  }

  const normalized = ring.filter(
    (pair) =>
      Array.isArray(pair) &&
      pair.length === 2 &&
      Number.isFinite(pair[0]) &&
      Number.isFinite(pair[1])
  );

  if (normalized.length < 3) {
    return null;
  }

  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    normalized.push([...first]);
  }

  return normalized.length >= 4 ? normalized : null;
};

const buildIsolinePolygon = (isolineGeometry) => {
  if (!isolineGeometry) {
    return null;
  }

  if (Array.isArray(isolineGeometry)) {
    const ring = normalizeRing(isolineGeometry);
    if (!ring) {
      return null;
    }

    return turf.polygon([ring]);
  }

  if (typeof isolineGeometry === 'object' && Array.isArray(isolineGeometry.coordinates)) {
    if (isolineGeometry.type === 'Polygon') {
      const [outerRing, ...holes] = isolineGeometry.coordinates;
      const normalizedOuter = normalizeRing(outerRing);
      if (!normalizedOuter) {
        return null;
      }

      const normalizedHoles = holes
        .map((ring) => normalizeRing(ring))
        .filter(Boolean);

      return turf.polygon([normalizedOuter, ...normalizedHoles]);
    }

    if (isolineGeometry.type === 'MultiPolygon') {
      const coordinates = isolineGeometry.coordinates
        .map((polygonRings) => {
          if (!Array.isArray(polygonRings) || polygonRings.length === 0) {
            return null;
          }

          const [outerRing, ...holes] = polygonRings;
          const normalizedOuter = normalizeRing(outerRing);
          if (!normalizedOuter) {
            return null;
          }

          const normalizedHoles = holes
            .map((ring) => normalizeRing(ring))
            .filter(Boolean);

          return [normalizedOuter, ...normalizedHoles];
        })
        .filter(Boolean);

      if (coordinates.length === 0) {
        return null;
      }

      return turf.multiPolygon(coordinates);
    }
  }

  return null;
};

const getCacheKey = (isolineFeature, matchMode) => {
  const geometry = turf.getGeom(isolineFeature);
  const payload = JSON.stringify({ matchMode, geometry });
  return crypto.createHash('sha1').update(payload).digest('hex');
};

const loadZipCodeData = async () => {
  if (zipFeatureIndex) {
    return;
  }

  if (zipDataLoadPromise) {
    await zipDataLoadPromise;
    return;
  }

  zipDataLoadPromise = (async () => {
    try {
      const filePath = path.join(process.cwd(), 'data', 'us-zip-code-boundaries.json');
      const fileData = fs.readFileSync(filePath, 'utf-8');
      zipCodeGeoJSON = JSON.parse(fileData);

      zipFeatureIndex = zipCodeGeoJSON.features
        .map((feature) => {
          if (!feature?.geometry) {
            return null;
          }

          const zipCode = feature.properties?.ZCTA5CE20 || feature.properties?.ZCTA5CE10;
          if (!zipCode) {
            return null;
          }

          try {
            const bbox = turf.bbox(feature);
            const lon = Number.parseFloat(feature.properties?.INTPTLON20);
            const lat = Number.parseFloat(feature.properties?.INTPTLAT20);
            const centroid =
              Number.isFinite(lon) && Number.isFinite(lat)
                ? turf.point([lon, lat])
                : turf.centroid(feature);

            return {
              zipCode,
              feature,
              bbox,
              centroid,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      console.log(`ZIP Code GeoJSON loaded: ${zipFeatureIndex.length} features indexed.`);
    } catch (error) {
      console.error('Error loading ZIP Code GeoJSON data:', error);
      throw new Error('Failed to load ZIP Code data.');
    }
  })();

  await zipDataLoadPromise;
};

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const data = await request.json();
    const { isolineGeometry, matchMode = 'intersects' } = data;

    if (!['intersects', 'centroid'].includes(matchMode)) {
      return NextResponse.json(
        { error: 'Invalid request: matchMode must be "intersects" or "centroid".' },
        { status: 400 }
      );
    }

    const isolineFeature = buildIsolinePolygon(isolineGeometry);
    if (!isolineFeature) {
      return NextResponse.json(
        {
          error:
            'Invalid request: isolineGeometry must be a valid Polygon/MultiPolygon geometry object or an array of [lng, lat] points.',
        },
        { status: 400 }
      );
    }

    await loadZipCodeData();

    const cacheKey = getCacheKey(isolineFeature, matchMode);
    if (resultCache.has(cacheKey)) {
      return NextResponse.json({ zipcodes: resultCache.get(cacheKey), cached: true }, { status: 200 });
    }

    const isolineBbox = turf.bbox(isolineFeature);

    const candidates = zipFeatureIndex.filter((entry) => bboxesOverlap(entry.bbox, isolineBbox));
    const matches = new Set();

    for (const candidate of candidates) {
      if (matchMode === 'centroid') {
        if (turf.booleanPointInPolygon(candidate.centroid, isolineFeature)) {
          matches.add(candidate.zipCode);
        }
        continue;
      }

      if (turf.booleanPointInPolygon(candidate.centroid, isolineFeature)) {
        matches.add(candidate.zipCode);
        continue;
      }

      try {
        if (turf.booleanIntersects(candidate.feature, isolineFeature)) {
          matches.add(candidate.zipCode);
        }
      } catch {
        continue;
      }
    }

    const uniqueZipcodes = Array.from(matches).sort();

    resultCache.set(cacheKey, uniqueZipcodes);
    if (resultCache.size > MAX_CACHE_ENTRIES) {
      const firstKey = resultCache.keys().next().value;
      if (firstKey) {
        resultCache.delete(firstKey);
      }
    }

    return NextResponse.json(
      {
        zipcodes: uniqueZipcodes,
        candidates: candidates.length,
        cached: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in getZipCodes API:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
