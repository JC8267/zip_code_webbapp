'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
mapboxgl.accessToken = MAPBOX_TOKEN;
const MAX_ADDRESSES = 100;
const API_DELAY_MS = 140;
const MATCH_MODE = 'intersects';

const TIME_RANGES = [
  { time: 20, label: '0-20', color: '#f97316' },
  { time: 30, label: '20-30', color: '#facc15' },
  { time: 40, label: '30-40', color: '#0ea5e9' },
  { time: 60, label: '40-60', color: '#22c55e' },
];

const DEMO_ADDRESS_POOL = [
  '742 Evergreen Terrace, Springfield, IL',
  '1600 Amphitheatre Parkway, Mountain View, CA',
  '233 S Wacker Dr, Chicago, IL',
  '700 Exposition Park Dr, Los Angeles, CA',
  '405 Lexington Ave, New York, NY',
  '1201 3rd Ave, Seattle, WA',
  '100 Legends Way, Boston, MA',
  '600 Montgomery St, San Francisco, CA',
  '1100 Congress Ave, Austin, TX',
  '401 Biscayne Blvd, Miami, FL',
];

const ikeaLocations = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-84.4054, 33.7889] }, properties: { name: 'Atlanta' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.4619, 39.3755] }, properties: { name: 'Baltimore' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-93.2443, 44.8588] }, properties: { name: 'Bloomington' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-88.0378, 41.7277] }, properties: { name: 'Bolingbrook' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.010738, 40.673687] }, properties: { name: 'Brooklyn' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-118.303206, 34.17453] }, properties: { name: 'Burbank' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-83.4525, 42.3231] }, properties: { name: 'Canton' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-118.26, 33.8419] }, properties: { name: 'Carson' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-104.875166, 39.572178] }, properties: { name: 'Centennial' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-80.7639, 35.2934] }, properties: { name: 'Charlotte' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.9285, 39.0207] }, properties: { name: 'College Park' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-82.966764, 40.149911] }, properties: { name: 'Columbus' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.3073, 40.0948] }, properties: { name: 'Conshohocken' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-117.916, 33.6909] }, properties: { name: 'Costa Mesa' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-117.879, 34.0743] }, properties: { name: 'Covina' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-111.893, 40.5093] }, properties: { name: 'Draper' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.139, 37.4613] }, properties: { name: 'East Palo Alto' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.1697, 40.6752] }, properties: { name: 'Elizabeth' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.292, 37.8314] }, properties: { name: 'Emeryville' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-86.007331, 39.953597] }, properties: { name: 'Fishers' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-96.8214, 33.0928] }, properties: { name: 'Frisco' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-97.022229, 32.69033] }, properties: { name: 'Grand Praire' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-95.4722, 29.7853] }, properties: { name: 'Houston' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-81.516394, 30.237952] }, properties: { name: 'Jacksonville' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-115.280804, 36.068904] }, properties: { name: 'Las Vegas' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-98.337762, 29.566514] }, properties: { name: 'Live Oak' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-73.5313, 40.7746] }, properties: { name: 'Long Island' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-89.798875, 35.190257] }, properties: { name: 'Memphis' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-94.690829, 39.109555] }, properties: { name: 'Merriam' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-80.38369, 25.79157] }, properties: { name: 'Miami' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-72.9196, 41.296] }, properties: { name: 'New Haven' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.200947, 36.875875] }, properties: { name: 'Norfolk' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-87.935364, 42.907535] }, properties: { name: 'Oak Crek' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-81.442024, 28.475548] }, properties: { name: 'Orlando' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-74.0761, 40.9227] }, properties: { name: 'Paramus' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.1418, 39.9171] }, properties: { name: 'Philadelphia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-80.1682, 40.4516] }, properties: { name: 'Pittsburgh' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.554, 45.5714] }, properties: { name: 'Portland' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.226, 47.4425] }, properties: { name: 'Renton' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-97.6892, 30.5585] }, properties: { name: 'Round Rock' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-117.126, 32.7801] }, properties: { name: 'San Diego' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-88.0362, 42.0568] }, properties: { name: 'Schaumburg' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-90.244974, 38.633823] }, properties: { name: 'St. Louis' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-71.0685, 42.1378] }, properties: { name: 'Stoughton' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-80.328264, 26.121519] }, properties: { name: 'Sunrise' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-82.4334, 27.9549] }, properties: { name: 'Tampa' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-111.971, 33.3409] }, properties: { name: 'Tempe' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-84.433665, 39.31813] }, properties: { name: 'West Chester' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-121.553, 38.5872] }, properties: { name: 'West Sacramento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.2892, 38.6431] }, properties: { name: 'Woodbridge' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.4088, 37.7828] }, properties: { name: 'Market_Street' } },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const emptyRangeSets = () => ({
  '0-20': new Set(),
  '20-30': new Set(),
  '30-40': new Set(),
  '40-60': new Set(),
});

const getRandomAddresses = (count) => {
  const shuffled = [...DEMO_ADDRESS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randomZip = () => String(10000 + Math.floor(Math.random() * 90000));

const takeUniqueZips = (count, used) => {
  const picks = [];

  while (picks.length < count) {
    const zip = randomZip();
    if (!used.has(zip)) {
      used.add(zip);
      picks.push(zip);
    }
  }

  return picks;
};

const buildDemoZipCoverage = (selectedAddresses) => {
  const coverage = {};

  selectedAddresses.forEach((address, index) => {
    const used = new Set();
    const stableAddressLabel = `${index + 1}. ${address}`;

    coverage[stableAddressLabel] = {
      '0-20': takeUniqueZips(8, used),
      '20-30': takeUniqueZips(7, used),
      '30-40': takeUniqueZips(6, used),
      '40-60': takeUniqueZips(5, used),
    };
  });

  return coverage;
};

const AddressProximityWebapp = () => {
  const [addressesInput, setAddressesInput] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [allZipcodes, setAllZipcodes] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [showZipcodes, setShowZipcodes] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const geocodeCacheRef = useRef(new Map());
  const isochroneCacheRef = useRef(new Map());

  useEffect(() => {
    if (map.current || !mapContainer.current || !MAPBOX_TOKEN) {
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902],
      zoom: 3,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      if (!mapInstance.getSource('ikea-locations')) {
        mapInstance.addSource('ikea-locations', {
          type: 'geojson',
          data: ikeaLocations,
        });
      }

      if (!mapInstance.getLayer('ikea-locations')) {
        mapInstance.addLayer({
          id: 'ikea-locations',
          type: 'symbol',
          source: 'ikea-locations',
          layout: {
            'icon-image': 'shop-15',
            'icon-size': 1.2,
            'text-field': ['get', 'name'],
            'text-offset': [0, 1.1],
            'text-anchor': 'top',
            'text-size': 11,
          },
          paint: {
            'text-color': '#0f172a',
          },
        });
      }

      mapInstance.on('click', 'ikea-locations', (event) => {
        const feature = event.features?.[0];
        if (!feature) {
          return;
        }

        const coordinates = feature.geometry.coordinates.slice();
        const { name } = feature.properties;

        new mapboxgl.Popup().setLngLat(coordinates).setHTML(`<h3>${name}</h3>`).addTo(mapInstance);
      });

      mapInstance.on('mouseenter', 'ikea-locations', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'ikea-locations', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    });

    map.current = mapInstance;

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  const zipcodeRows = useMemo(() => {
    const rows = [];

    Object.entries(allZipcodes).forEach(([addressLabel, timeRanges]) => {
      Object.entries(timeRanges).forEach(([timeRange, zipcodes]) => {
        zipcodes.forEach((zipcode) => {
          rows.push({ addressLabel, timeRange, zipcode });
        });
      });
    });

    return rows;
  }, [allZipcodes]);

  const uniqueZipCount = useMemo(() => {
    const unique = new Set(zipcodeRows.map((row) => row.zipcode));
    return unique.size;
  }, [zipcodeRows]);

  const handleAddressesChange = (event) => {
    const input = event.target.value;
    setAddressesInput(input);

    const parsedAddresses = input
      .split('\n')
      .map((address) => address.trim())
      .filter(Boolean);

    setAddresses(parsedAddresses);
  };

  const removeAllIsochroneLayersAndSources = () => {
    if (!map.current) {
      return;
    }

    const style = map.current.getStyle();
    if (!style) {
      return;
    }

    const layers = style.layers || [];
    layers.forEach((layer) => {
      if (layer.id.startsWith('isochrone-') && map.current.getLayer(layer.id)) {
        map.current.removeLayer(layer.id);
      }
    });

    const sources = Object.keys(style.sources || {});
    sources.forEach((source) => {
      if (source.startsWith('isochrone-') && map.current.getSource(source)) {
        map.current.removeSource(source);
      }
    });
  };

  const fetchZipCodes = async (isolineData, label) => {
    try {
      const geometry = isolineData?.features?.[0]?.geometry;
      if (!geometry) {
        return [];
      }

      const response = await fetch('/api/getZipCodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isolineGeometry: geometry, matchMode: MATCH_MODE }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || `ZIP lookup failed for ${label} minutes.`);
        return [];
      }

      if (Array.isArray(data.zipcodes)) {
        return data.zipcodes;
      }

      return [];
    } catch (fetchError) {
      setError(`Error fetching ZIP codes for the ${label} range.`);
      return [];
    }
  };

  const getGeocodeCoordinates = async (address) => {
    const cacheKey = address.toLowerCase();
    if (geocodeCacheRef.current.has(cacheKey)) {
      return geocodeCacheRef.current.get(cacheKey);
    }

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeResponse.ok || !Array.isArray(geocodeData.features) || geocodeData.features.length === 0) {
      return null;
    }

    const [lng, lat] = geocodeData.features[0].center;
    const value = { lng, lat };
    geocodeCacheRef.current.set(cacheKey, value);
    return value;
  };

  const getIsochroneData = async (lng, lat, time) => {
    const cacheKey = `${lng.toFixed(5)},${lat.toFixed(5)}:${time}`;
    if (isochroneCacheRef.current.has(cacheKey)) {
      return isochroneCacheRef.current.get(cacheKey);
    }

    const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=${time}&polygons=true&access_token=${MAPBOX_TOKEN}`;
    const isochroneResponse = await fetch(isochroneUrl);
    const isochroneData = await isochroneResponse.json();

    if (!isochroneResponse.ok || !Array.isArray(isochroneData.features) || isochroneData.features.length === 0) {
      return null;
    }

    isochroneCacheRef.current.set(cacheKey, isochroneData);
    return isochroneData;
  };

  const loadDemoScenario = () => {
    const demoAddresses = getRandomAddresses(3);
    const demoCoverage = buildDemoZipCoverage(demoAddresses);

    setAddressesInput(demoAddresses.join('\n'));
    setAddresses(demoAddresses);
    setAllZipcodes(demoCoverage);
    setShowZipcodes(true);
    setLoading(false);
    setLoadingMessage('');
    setError('Demo mode active: using sample ZIP coverage because NEXT_PUBLIC_MAPBOX_API_KEY is not set.');
    setCopyMessage('Loaded 3 random demo addresses.');
  };

  const getProximityIsochrones = async () => {
    if (!MAPBOX_TOKEN) {
      loadDemoScenario();
      return;
    }

    if (!map.current) {
      setError('Map is not ready yet. Please wait a moment and try again.');
      return;
    }

    const dedupedAddresses = Array.from(
      new Set(
        addresses
          .map((address) => address.trim())
          .filter(Boolean)
      )
    );

    if (dedupedAddresses.length === 0) {
      setError('Please enter at least one valid address.');
      return;
    }

    if (dedupedAddresses.length > MAX_ADDRESSES) {
      setError(`Please limit your input to ${MAX_ADDRESSES} addresses at a time.`);
      return;
    }

    setLoading(true);
    setLoadingMessage('Preparing requests...');
    setError(null);
    setAllZipcodes({});
    setShowZipcodes(false);
    setCopyMessage('');

    if (markers.current.length > 0) {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
    }

    removeAllIsochroneLayersAndSources();

    const collectedZipcodes = {};
    const warnings = [];

    try {
      if (dedupedAddresses.length !== addresses.length) {
        warnings.push(`Removed ${addresses.length - dedupedAddresses.length} duplicate addresses before processing.`);
      }

      for (const [index, address] of dedupedAddresses.entries()) {
        setLoadingMessage(`Processing address ${index + 1} of ${dedupedAddresses.length}`);

        if (index > 0) {
          await delay(API_DELAY_MS);
        }

        const geocodePoint = await getGeocodeCoordinates(address);
        if (!geocodePoint) {
          warnings.push(`Geocoding failed for: ${address}`);
          continue;
        }

        const { lng, lat } = geocodePoint;

        const marker = new mapboxgl.Marker({ color: '#0f172a' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(address))
          .addTo(map.current);
        markers.current.push(marker);

        const zipcodesForAddress = emptyRangeSets();

        for (const { time, label, color } of TIME_RANGES) {
          await delay(API_DELAY_MS);

          const isochroneData = await getIsochroneData(lng, lat, time);
          if (!isochroneData) {
            warnings.push(`Isochrone failed for ${address} at ${label} minutes.`);
            continue;
          }

          const sourceId = `isochrone-${label}-${index}`;

          if (map.current.getLayer(sourceId)) {
            map.current.removeLayer(sourceId);
          }

          if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }

          map.current.addSource(sourceId, {
            type: 'geojson',
            data: isochroneData,
          });

          map.current.addLayer({
            id: sourceId,
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
              'fill-color': color,
              'fill-opacity': 0.18,
              'fill-outline-color': color,
            },
          });

          const fetchedZipCodes = await fetchZipCodes(isochroneData, label);
          fetchedZipCodes.forEach((zip) => zipcodesForAddress[label].add(zip));
        }

        const zip0to20 = Array.from(zipcodesForAddress['0-20']);
        const zip20to30 = Array.from(zipcodesForAddress['20-30']).filter((zip) => !zip0to20.includes(zip));
        const zip30to40 = Array.from(zipcodesForAddress['30-40']).filter(
          (zip) => !zip0to20.includes(zip) && !zip20to30.includes(zip)
        );
        const zip40to60 = Array.from(zipcodesForAddress['40-60']).filter(
          (zip) => !zip0to20.includes(zip) && !zip20to30.includes(zip) && !zip30to40.includes(zip)
        );

        const stableAddressLabel = `${index + 1}. ${address}`;

        collectedZipcodes[stableAddressLabel] = {
          '0-20': zip0to20,
          '20-30': zip20to30,
          '30-40': zip30to40,
          '40-60': zip40to60,
        };
      }

      setAllZipcodes(collectedZipcodes);

      if (markers.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.current.forEach((marker) => bounds.extend(marker.getLngLat()));
        map.current.fitBounds(bounds, { padding: 70, maxZoom: 11 });
      }

      if (warnings.length > 0) {
        const remainingCount = warnings.length - 1;
        const extraMessage = remainingCount > 0 ? ` (+${remainingCount} more warnings)` : '';
        setError(`${warnings[0]}${extraMessage}`);
      }
    } catch (processingError) {
      setError(`An error occurred: ${processingError.message}. Please try again.`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const exportToCSV = () => {
    const csvData = [['Address', 'Time Range', 'ZIP Code']];
    zipcodeRows.forEach((row) => {
      csvData.push([row.addressLabel, row.timeRange, row.zipcode]);
    });

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'proximity_zipcodes.csv');
  };

  const toggleShowZipcodes = () => {
    setShowZipcodes((previous) => !previous);
    setCopyMessage('');
  };

  const copyZipcodesToClipboard = async () => {
    const rows = [['Address', 'Time Range', 'ZIP Code']];
    zipcodeRows.forEach((row) => {
      rows.push([row.addressLabel, row.timeRange, row.zipcode]);
    });

    const textToCopy = rows.map((row) => row.join('\t')).join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyMessage('ZIP codes copied to clipboard.');
    } catch {
      setError('Failed to copy ZIP codes to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_40%,_#ecfeff_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1400px]">
        <Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 text-white">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-cyan-200">
              Zip Reach Studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Zip Code Finder</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-base">
              Paste addresses, generate drive-time rings, and export segmented ZIP lists for rapid territory planning.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 bg-slate-50/80 p-5 lg:border-b-0 lg:border-r">
                <div className="space-y-4">
                  <label
                    htmlFor="addresses-input"
                    className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-slate-600"
                  >
                    Addresses (one per line)
                  </label>
                  <textarea
                    id="addresses-input"
                    aria-label="Addresses"
                    placeholder="1 Market St, San Francisco, CA\n420 W 14th St, New York, NY"
                    value={addressesInput}
                    onChange={handleAddressesChange}
                    className="h-48 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  />

                  <Button
                    onClick={getProximityIsochrones}
                    disabled={loading}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {loading ? loadingMessage || 'Loading...' : 'Find ZIP Coverage'}
                  </Button>

                  {!MAPBOX_TOKEN && (
                    <Button onClick={loadDemoScenario} variant="outline" className="w-full border-cyan-300 text-cyan-900">
                      Load Demo (3 Random Addresses)
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">Addresses</p>
                      <p className="text-lg font-semibold text-slate-900">{addresses.length}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">Unique ZIPs</p>
                      <p className="text-lg font-semibold text-slate-900">{uniqueZipCount}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>
                  )}

                  {copyMessage && (
                    <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
                      {copyMessage}
                    </div>
                  )}

                  {zipcodeRows.length > 0 && (
                    <div className="grid gap-2">
                      <Button onClick={toggleShowZipcodes} variant="secondary" className="w-full">
                        {showZipcodes ? 'Hide ZIP Table' : 'Show ZIP Table'}
                      </Button>
                      <Button onClick={copyZipcodesToClipboard} variant="outline" className="w-full">
                        Copy ZIPs to Clipboard
                      </Button>
                      <Button onClick={exportToCSV} variant="outline" className="w-full">
                        Export ZIPs to CSV
                      </Button>
                    </div>
                  )}
                </div>
              </aside>

              <section className="bg-white p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <span className="font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.2em] text-slate-600">
                    Drive Bands
                  </span>
                  {TIME_RANGES.map((range) => (
                    <div key={range.label} className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: range.color }} />
                      <span>{range.label} min</span>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                  {MAPBOX_TOKEN ? (
                    <div ref={mapContainer} className="h-[58vh] min-h-[420px] w-full" />
                  ) : (
                    <div className="flex h-[58vh] min-h-[420px] w-full items-center justify-center bg-[linear-gradient(135deg,#e2e8f0_0%,#bae6fd_45%,#f0f9ff_100%)] p-6">
                      <div className="max-w-xl rounded-xl border border-slate-200 bg-white/85 p-6 text-center shadow-lg backdrop-blur-sm">
                        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-slate-500">
                          Map Preview Disabled
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Demo mode is ready</h3>
                        <p className="mt-3 text-sm text-slate-700">
                          Click <span className="font-semibold">Load Demo (3 Random Addresses)</span> to generate sample ZIP
                          coverage without API keys.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {showZipcodes && zipcodeRows.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.14em] text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Address</th>
                          <th className="px-3 py-2">Time Range</th>
                          <th className="px-3 py-2">ZIP Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                        {zipcodeRows.map((row) => (
                          <tr key={`${row.addressLabel}-${row.timeRange}-${row.zipcode}`}>
                            <td className="px-3 py-2">{row.addressLabel}</td>
                            <td className="px-3 py-2">{row.timeRange}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{row.zipcode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressProximityWebapp;
