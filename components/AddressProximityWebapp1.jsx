'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import {
  MapPin,
  Hash,
  Copy,
  Download,
  Table2,
  EyeOff,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
mapboxgl.accessToken = MAPBOX_TOKEN;
const MAX_ADDRESSES = 100;
const API_DELAY_MS = 140;
const IKEA_SOURCE_ID = 'ikea-locations';
const IKEA_DOT_LAYER_ID = 'ikea-location-dots';
const IKEA_LABEL_LAYER_ID = 'ikea-location-labels';

const TIME_RANGES = [
  { time: 20, label: '0-20', color: '#f97316', bg: 'rgba(249,115,22,0.12)', text: '#fb923c' },
  { time: 30, label: '20-30', color: '#facc15', bg: 'rgba(250,204,21,0.12)', text: '#fde047' },
  { time: 40, label: '30-40', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', text: '#38bdf8' },
  { time: 60, label: '40-60', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
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

/* ─── Time-range badge component ─── */
const TimeBadge = ({ label }) => {
  const range = TIME_RANGES.find((r) => r.label === label);
  if (!range) return <span>{label}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: range.bg, color: range.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: range.color }}
      />
      {label} min
    </span>
  );
};

const AddressProximityWebapp = () => {
  const [addressesInput, setAddressesInput] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [allZipcodes, setAllZipcodes] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showZipcodes, setShowZipcodes] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const geocodeCacheRef = useRef(new Map());
  const isochroneCacheRef = useRef(new Map());

  /* ─── Auto-dismiss messages ─── */
  useEffect(() => {
    if (!copyMessage) return;
    const t = setTimeout(() => setCopyMessage(''), 4000);
    return () => clearTimeout(t);
  }, [copyMessage]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(t);
  }, [error]);

  /* ─── Map init ─── */
  useEffect(() => {
    if (map.current || !mapContainer.current || !MAPBOX_TOKEN) {
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95.7129, 37.0902],
      zoom: 3,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      if (!mapInstance.getSource(IKEA_SOURCE_ID)) {
        mapInstance.addSource(IKEA_SOURCE_ID, {
          type: 'geojson',
          data: ikeaLocations,
        });
      }

      if (!mapInstance.getLayer(IKEA_DOT_LAYER_ID)) {
        mapInstance.addLayer({
          id: IKEA_DOT_LAYER_ID,
          type: 'circle',
          source: IKEA_SOURCE_ID,
          paint: {
            'circle-radius': 5.5,
            'circle-color': '#f59e0b',
            'circle-stroke-color': '#111827',
            'circle-stroke-width': 1.2,
          },
        });
      }

      if (!mapInstance.getLayer(IKEA_LABEL_LAYER_ID)) {
        mapInstance.addLayer({
          id: IKEA_LABEL_LAYER_ID,
          type: 'symbol',
          source: IKEA_SOURCE_ID,
          layout: {
            'text-field': ['get', 'name'],
            'text-offset': [0, 1.35],
            'text-anchor': 'top',
            'text-size': 10.5,
          },
          paint: {
            'text-color': '#e2e8f0',
            'text-halo-color': '#020617',
            'text-halo-width': 1.1,
          },
        });
      }

      const handleIkeaClick = (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = feature.geometry.coordinates.slice();
        const { name } = feature.properties;
        new mapboxgl.Popup().setLngLat(coordinates).setHTML(`<h3>${name}</h3>`).addTo(mapInstance);
      };

      mapInstance.on('click', IKEA_DOT_LAYER_ID, handleIkeaClick);
      mapInstance.on('click', IKEA_LABEL_LAYER_ID, handleIkeaClick);

      mapInstance.on('mouseenter', IKEA_DOT_LAYER_ID, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseenter', IKEA_LABEL_LAYER_ID, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', IKEA_DOT_LAYER_ID, () => {
        mapInstance.getCanvas().style.cursor = '';
      });
      mapInstance.on('mouseleave', IKEA_LABEL_LAYER_ID, () => {
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
    if (!map.current) return;
    const style = map.current.getStyle();
    if (!style) return;

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
      const ring = isolineData?.features?.[0]?.geometry?.coordinates?.[0];
      if (!Array.isArray(ring)) return [];

      const response = await fetch('/api/getZipCodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isolineGeometry: ring }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || `Error fetching ZIP codes for the ${label} range.`);
        return [];
      }

      return Array.isArray(data.zipcodes) ? data.zipcodes : [];
    } catch {
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
    setLoadingProgress(0);
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
    setLoadingProgress(0);
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
    const totalSteps = dedupedAddresses.length * (TIME_RANGES.length + 1);
    let completedSteps = 0;

    try {
      if (dedupedAddresses.length !== addresses.length) {
        warnings.push(`Removed ${addresses.length - dedupedAddresses.length} duplicate addresses before processing.`);
      }

      for (const [index, address] of dedupedAddresses.entries()) {
        setLoadingMessage(`Processing address ${index + 1} of ${dedupedAddresses.length}`);

        if (index > 0) await delay(API_DELAY_MS);

        const geocodePoint = await getGeocodeCoordinates(address);
        completedSteps++;
        setLoadingProgress(Math.round((completedSteps / totalSteps) * 100));

        if (!geocodePoint) {
          warnings.push(`Geocoding failed for: ${address}`);
          continue;
        }

        const { lng, lat } = geocodePoint;

        const marker = new mapboxgl.Marker({ color: '#38bdf8' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(address))
          .addTo(map.current);
        markers.current.push(marker);

        const zipcodesForAddress = emptyRangeSets();

        for (const { time, label, color } of TIME_RANGES) {
          await delay(API_DELAY_MS);

          const isochroneData = await getIsochroneData(lng, lat, time);
          completedSteps++;
          setLoadingProgress(Math.round((completedSteps / totalSteps) * 100));

          if (!isochroneData) {
            warnings.push(`Isochrone failed for ${address} at ${label} minutes.`);
            continue;
          }

          const sourceId = `isochrone-${label}-${index}`;

          if (map.current.getLayer(sourceId)) map.current.removeLayer(sourceId);
          if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

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
          if (map.current.getLayer(IKEA_DOT_LAYER_ID)) {
            map.current.moveLayer(IKEA_DOT_LAYER_ID);
          }
          if (map.current.getLayer(IKEA_LABEL_LAYER_ID)) {
            map.current.moveLayer(IKEA_LABEL_LAYER_ID);
          }

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
      setLoadingProgress(0);
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
    <div className="mesh-bg min-h-screen text-slate-200">
      {/* ─── Progress bar ─── */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800/50">
          <div
            className="progress-bar h-full transition-all duration-500 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ─── Top bar ─── */}
        <header className="flex items-center justify-between border-b border-slate-700/50 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">Zip Reach Studio</h1>
              <p className="hidden text-[11px] text-slate-400 sm:block">Drive-time ZIP coverage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {TIME_RANGES.map((range) => (
              <div
                key={range.label}
                className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex"
                style={{ backgroundColor: range.bg, color: range.text }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: range.color }}
                />
                {range.label}m
              </div>
            ))}
          </div>
        </header>

        {/* ─── Main layout ─── */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* ─── Sidebar ─── */}
          <aside className="custom-scrollbar w-full shrink-0 overflow-y-auto border-b border-slate-700/50 p-4 sm:p-5 lg:w-[360px] lg:border-b-0 lg:border-r">
            <div className="space-y-4">
              {/* Label */}
              <label
                htmlFor="addresses-input"
                className="mono-label text-slate-400"
              >
                Addresses (one per line)
              </label>

              {/* Textarea */}
              <div className="group relative">
                <textarea
                  id="addresses-input"
                  aria-label="Addresses"
                  placeholder={"1 Market St, San Francisco, CA\n420 W 14th St, New York, NY"}
                  value={addressesInput}
                  onChange={handleAddressesChange}
                  className="h-44 w-full resize-y rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-slate-800/70 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] focus:ring-1 focus:ring-cyan-500/30"
                />
                {addresses.length > 0 && (
                  <span className="absolute bottom-2 right-3 rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400">
                    {addresses.length} address{addresses.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>

              {/* Primary button */}
              <button
                onClick={getProximityIsochrones}
                disabled={loading}
                className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingMessage || 'Loading...'}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find ZIP Coverage
                  </>
                )}
              </button>

              {/* Demo button */}
              {!MAPBOX_TOKEN && (
                <button
                  onClick={loadDemoScenario}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                >
                  <Sparkles className="h-4 w-4" />
                  Load Demo (3 Random Addresses)
                </button>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-light rounded-xl p-3.5 transition-all duration-300 hover:border-slate-600/30">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs">Addresses</span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">{addresses.length}</p>
                </div>
                <div className="glass-light rounded-xl p-3.5 transition-all duration-300 hover:border-slate-600/30">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-xs">Unique ZIPs</span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">{uniqueZipCount}</p>
                </div>
              </div>

              {/* Drive bands legend (mobile) */}
              <div className="flex flex-wrap gap-2 sm:hidden">
                {TIME_RANGES.map((range) => (
                  <div
                    key={range.label}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ backgroundColor: range.bg, color: range.text }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: range.color }}
                    />
                    {range.label}m
                  </div>
                ))}
              </div>

              {/* Toast messages */}
              {error && (
                <div className="toast-enter flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{error}</span>
                </div>
              )}

              {copyMessage && (
                <div className="toast-enter flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{copyMessage}</span>
                </div>
              )}

              {/* Action buttons */}
              {zipcodeRows.length > 0 && (
                <div className="animate-fade-in-up space-y-2">
                  <button
                    onClick={toggleShowZipcodes}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/50"
                  >
                    {showZipcodes ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide ZIP Table
                      </>
                    ) : (
                      <>
                        <Table2 className="h-4 w-4" />
                        Show ZIP Table
                      </>
                    )}
                  </button>
                  <button
                    onClick={copyZipcodesToClipboard}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy ZIPs to Clipboard
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/50"
                  >
                    <Download className="h-4 w-4" />
                    Export ZIPs to CSV
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ─── Main content ─── */}
          <main className="flex flex-1 flex-col p-3 sm:p-4">
            {/* Map */}
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-700/40 shadow-2xl shadow-black/30">
              {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/30 bg-slate-900/80 px-8 py-6 backdrop-blur-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <p className="text-sm font-medium text-slate-200">{loadingMessage}</p>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="progress-bar h-full rounded-full transition-all duration-500"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{loadingProgress}% complete</p>
                  </div>
                </div>
              )}

              {MAPBOX_TOKEN ? (
                <div ref={mapContainer} className="h-full min-h-[420px] w-full" />
              ) : (
                <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                  <div className="max-w-md rounded-2xl border border-slate-700/40 bg-slate-800/60 p-8 text-center backdrop-blur-xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
                      <MapPin className="h-7 w-7 text-cyan-400" />
                    </div>
                    <p className="mono-label text-slate-500">Map Preview Disabled</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Demo mode is ready</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Click{' '}
                      <button
                        onClick={loadDemoScenario}
                        className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        Load Demo
                      </button>{' '}
                      to generate sample ZIP coverage without API keys.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ZIP table */}
            {showZipcodes && zipcodeRows.length > 0 && (
              <div className="animate-fade-in-up mt-4 max-h-[50vh] overflow-auto rounded-2xl border border-slate-700/40 custom-scrollbar">
                <table className="zip-table min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/90 text-left text-xs text-slate-400">
                      <th className="mono-label px-4 py-3">Address</th>
                      <th className="mono-label px-4 py-3">Time Range</th>
                      <th className="mono-label px-4 py-3">ZIP Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {zipcodeRows.map((row, i) => (
                      <tr
                        key={`${row.addressLabel}-${row.timeRange}-${row.zipcode}`}
                        className="animate-fade-in-up bg-slate-900/40 text-slate-300"
                        style={{ animationDelay: `${Math.min(i * 20, 500)}ms` }}
                      >
                        <td className="px-4 py-2.5 text-slate-200">{row.addressLabel}</td>
                        <td className="px-4 py-2.5">
                          <TimeBadge label={row.timeRange} />
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="rounded-md bg-slate-800/60 px-2 py-0.5 font-mono text-xs font-semibold text-white">
                            {row.zipcode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AddressProximityWebapp;
