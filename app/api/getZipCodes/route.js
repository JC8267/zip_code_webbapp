import { NextResponse } from 'next/server';
import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';

let zipCodeGeoJSON = null;

const loadZipCodeData = () => {
  if (!zipCodeGeoJSON) {
    try {
      // Load GeoJSON data from file
      const filePath = path.join(process.cwd(), 'data', 'us-zip-code-boundaries.json');
      const fileData = fs.readFileSync(filePath, 'utf-8');
      zipCodeGeoJSON = JSON.parse(fileData);
      console.log('ZIP Code GeoJSON data loaded successfully.');
    } catch (error) {
      console.error('Error loading ZIP Code GeoJSON data:', error);
      throw new Error('Failed to load ZIP Code data.');
    }
  }
};

export async function POST(request) {
  try {
    const data = await request.json();
    const { isolineGeometry } = data;

    // Validate isolineGeometry input
    if (!isolineGeometry || !Array.isArray(isolineGeometry) || isolineGeometry.length < 3) {
      return NextResponse.json(
        { error: 'Invalid request: isolineGeometry should be an array of at least 3 [lng, lat] pairs.' },
        { status: 400 }
      );
    }

    // Load ZIP code data from file
    loadZipCodeData();

    // Create a polygon from isolineGeometry
    const isolinePolygon = turf.polygon([isolineGeometry]);

    // Simplify the polygon to avoid including unnecessary vertices
    const simplifiedIsolinePolygon = turf.simplify(isolinePolygon, { tolerance: 0.01, highQuality: false });

    // Process each ZIP code feature and check if its centroid is within the isoline polygon
    const zipCodesWithinIsoline = zipCodeGeoJSON.features
      .filter(feature => {
        if (!feature.geometry) {
          return false;
        }
        const zipCodeCentroid = turf.centroid(feature);
        return turf.booleanPointInPolygon(zipCodeCentroid, simplifiedIsolinePolygon);
      })
      .map(feature => feature.properties?.ZCTA5CE20 || feature.properties?.ZCTA5CE10)
      .filter(zipCode => zipCode !== undefined);

    // Remove duplicate ZIP codes
    const uniqueZipcodes = [...new Set(zipCodesWithinIsoline)];

    if (uniqueZipcodes.length === 0) {
      return NextResponse.json({ message: 'No ZIP codes found within the given area.' }, { status: 200 });
    }

    return NextResponse.json({ zipcodes: uniqueZipcodes }, { status: 200 });
  } catch (error) {
    console.error('Error in getZipCodes API:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}