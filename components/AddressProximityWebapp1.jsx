'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const ikeaLocations = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-84.4054, 33.7889] }, "properties": { "name": "Atlanta" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-76.4619, 39.3755] }, "properties": { "name": "Baltimore" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-93.2443, 44.8588] }, "properties": { "name": "Bloomington" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-88.0378, 41.7277] }, "properties": { "name": "Bolingbrook" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.010738, 40.673687] }, "properties": { "name": "Brooklyn" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-118.303206, 34.17453] }, "properties": { "name": "Burbank" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-83.4525, 42.3231] }, "properties": { "name": "Canton" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-118.26, 33.8419] }, "properties": { "name": "Carson" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-104.875166, 39.572178] }, "properties": { "name": "Centennial" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-80.7639, 35.2934] }, "properties": { "name": "Charlotte" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-76.9285, 39.0207] }, "properties": { "name": "College Park" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-82.966764, 40.149911] }, "properties": { "name": "Columbus" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-75.3073, 40.0948] }, "properties": { "name": "Conshohocken" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-117.916, 33.6909] }, "properties": { "name": "Costa Mesa" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-117.879, 34.0743] }, "properties": { "name": "Covina" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-111.893, 40.5093] }, "properties": { "name": "Draper" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.139, 37.4613] }, "properties": { "name": "East Palo Alto" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.1697, 40.6752] }, "properties": { "name": "Elizabeth" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.292, 37.8314] }, "properties": { "name": "Emeryville" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-86.007331, 39.953597] }, "properties": { "name": "Fishers" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-96.8214, 33.0928] }, "properties": { "name": "Frisco" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-97.022229, 32.69033] }, "properties": { "name": "Grand Praire" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-95.4722, 29.7853] }, "properties": { "name": "Houston" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-81.516394, 30.237952] }, "properties": { "name": "Jacksonville" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-115.280804, 36.068904] }, "properties": { "name": "Las Vegas" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-98.337762, 29.566514] }, "properties": { "name": "Live Oak" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.5313, 40.7746] }, "properties": { "name": "Long Island" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-89.798875, 35.190257] }, "properties": { "name": "Memphis" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-94.690829, 39.109555] }, "properties": { "name": "Merriam" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-80.38369, 25.79157] }, "properties": { "name": "Miami" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-72.9196, 41.296] }, "properties": { "name": "New Haven" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-76.200947, 36.875875] }, "properties": { "name": "Norfolk" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-87.935364, 42.907535] }, "properties": { "name": "Oak Crek" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-81.442024, 28.475548] }, "properties": { "name": "Orlando" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0761, 40.9227] }, "properties": { "name": "Paramus" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-75.1418, 39.9171] }, "properties": { "name": "Philadelphia" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-80.1682, 40.4516] }, "properties": { "name": "Pittsburgh" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.554, 45.5714] }, "properties": { "name": "Portland" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.226, 47.4425] }, "properties": { "name": "Renton" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-97.6892, 30.5585] }, "properties": { "name": "Round Rock" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-117.126, 32.7801] }, "properties": { "name": "San Diego" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-88.0362, 42.0568] }, "properties": { "name": "Schaumburg" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-90.244974, 38.633823] }, "properties": { "name": "St. Louis" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-71.0685, 42.1378] }, "properties": { "name": "Stoughton" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-80.328264, 26.121519] }, "properties": { "name": "Sunrise" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-82.4334, 27.9549] }, "properties": { "name": "Tampa" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-111.971, 33.3409] }, "properties": { "name": "Tempe" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-84.433665, 39.31813] }, "properties": { "name": "West Chester" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-121.553, 38.5872] }, "properties": { "name": "West Sacramento" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-77.2892, 38.6431] }, "properties": { "name": "Woodbridge" }},
    { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.4088, 37.7828] }, "properties": { "name": "Market_Street" }}
  ]
};

const AddressProximityWebapp = () => {
  const [address, setAddress] = useState('');
  const [zipcodes, setZipcodes] = useState({
    '0-20': [],
    '20-40': [],
    '40-60': [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showZipcodes, setShowZipcodes] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [lng, setLng] = useState(-75.1652);
  const [lat, setLat] = useState(39.9526);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 12,
    });

    map.current.on('load', () => {
      map.current.addSource('ikea-locations', {
        type: 'geojson',
        data: ikeaLocations,
      });

      map.current.addLayer({
        id: 'ikea-locations',
        type: 'symbol',
        source: 'ikea-locations',
        layout: {
          'icon-image': 'shop-15',
          'icon-size': 1.5,
          'text-field': ['get', 'name'],
          'text-offset': [0, 1.25],
          'text-anchor': 'top',
        },
      });

      map.current.on('click', 'ikea-locations', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name } = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${name}</h3>`)
          .addTo(map.current);
      });

      map.current.on('mouseenter', 'ikea-locations', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'ikea-locations', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });
  }, [lat, lng]);

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const removeIsochroneLayersAndSources = (timeRanges) => {
    timeRanges.forEach(({ label }) => {
      if (map.current.getLayer(`isochrone-${label}`)) {
        map.current.removeLayer(`isochrone-${label}`);
      }
      if (map.current.getSource(`isochrone-${label}`)) {
        map.current.removeSource(`isochrone-${label}`);
      }
    });
  };

  const getProximityIsochrones = async () => {
    if (!address.trim()) {
      setError('Please enter a valid address.');
      return;
    }

    setLoading(true);
    setError(null);
    setZipcodes({ '0-20': [], '20-40': [], '40-60': [] });
    setShowZipcodes(false);
    setCopyMessage('');

    try {
      // Geocode the address
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${mapboxgl.accessToken}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      const [lng, lat] = geocodeData.features[0].center;
      setLng(lng);
      setLat(lat);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true,
      });

      const timeRanges = [
        { time: 20, label: '0-20', color: '#FF0000' },
        { time: 40, label: '20-40', color: '#0000FF' },
        { time: 60, label: '40-60', color: '#11ff00' },
      ];

      removeIsochroneLayersAndSources(timeRanges);

      const zipcodesForAllRanges = { '0-20': [], '20-40': [], '40-60': [] };

      for (const { time, label, color } of timeRanges) {
        const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=${time}&polygons=true&access_token=${mapboxgl.accessToken}`;
        const isochroneResponse = await fetch(isochroneUrl);
        const isochroneData = await isochroneResponse.json();

        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
        }

        map.current.addSource(`isochrone-${label}`, {
          type: 'geojson',
          data: isochroneData,
        });

        map.current.addLayer({
          id: `isochrone-${label}`,
          type: 'fill',
          source: `isochrone-${label}`,
          layout: {},
          paint: {
            'fill-color': color,
            'fill-opacity': 0.4,
          },
        });

        // Fetch ZIP codes for the current isochrone
        const fetchedZipCodes = await fetchZipCodes(isochroneData, label);

        // Remove duplicates within the current range
        const uniqueFetchedZipCodes = [...new Set(fetchedZipCodes)];

        // Assign the unique ZIP codes to the current time range
        zipcodesForAllRanges[label] = uniqueFetchedZipCodes;
      }

      // De-duplicate '20-40' min range with respect to '0-20' min range
      const uniqueZipcodes20to40 = zipcodesForAllRanges['20-40'].filter(
        (zip) => !zipcodesForAllRanges['0-20'].includes(zip)
      );
      zipcodesForAllRanges['20-40'] = uniqueZipcodes20to40;

      // De-duplicate '40-60' min range with respect to '0-20' and '20-40' min ranges
      const uniqueZipcodes40to60 = zipcodesForAllRanges['40-60'].filter(
        (zip) =>
          !zipcodesForAllRanges['0-20'].includes(zip) &&
          !zipcodesForAllRanges['20-40'].includes(zip)
      );
      zipcodesForAllRanges['40-60'] = uniqueZipcodes40to60;

      // Update state with de-duplicated ZIP codes
      setZipcodes(zipcodesForAllRanges);
    } catch (error) {
      setError(`An error occurred: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchZipCodes = async (isolineData, label) => {
    try {
      const response = await fetch('/api/getZipCodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isolineGeometry: isolineData.features[0].geometry.coordinates[0] }),
      });

      const data = await response.json();
      if (data.zipcodes) {
        return data.zipcodes;
      } else {
        setError(`No ZIP codes found within the ${label} isochrone.`);
        return [];
      }
    } catch (error) {
      setError(`Error fetching ZIP codes for the ${label} range.`);
      return [];
    }
  };

  const exportToCSV = () => {
    const { '0-20': zip0to20, '20-40': zip20to40, '40-60': zip40to60 } = zipcodes;
    const maxLength = Math.max(zip0to20.length, zip20to40.length, zip40to60.length);
    const csvData = [
      ['ZIP Codes (0-20 min)', 'ZIP Codes (20-40 min)', 'ZIP Codes (40-60 min)'],
      ...Array.from({ length: maxLength }, (_, i) => [
        zip0to20[i] || '',
        zip20to40[i] || '',
        zip40to60[i] || '',
      ]),
    ];

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'proximity_zipcodes.csv');
  };

  const toggleShowZipcodes = () => {
    setShowZipcodes((prev) => !prev);
    setCopyMessage('');
  };

  const copyZipcodesToClipboard = () => {
    const { '0-20': zip0to20, '20-40': zip20to40, '40-60': zip40to60 } = zipcodes;
    const maxLength = Math.max(zip0to20.length, zip20to40.length, zip40to60.length);

    const tableRows = [
      ['ZIP Codes (0-20 min)', 'ZIP Codes (20-40 min)', 'ZIP Codes (40-60 min)'],
      ...Array.from({ length: maxLength }, (_, i) => [
        zip0to20[i] || '',
        zip20to40[i] || '',
        zip40to60[i] || '',
      ]),
    ];

    // Convert tableRows to tab-separated values for Excel
    const textToCopy = tableRows.map((row) => row.join('\t')).join('\n');

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopyMessage('ZIP codes copied to clipboard!');
      },
      (err) => {
        setError('Failed to copy ZIP codes to clipboard.');
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <h2>Zip Code Finder</h2>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input
            placeholder="Enter an address"
            value={address}
            onChange={handleAddressChange}
            style={{ flex: 1 }}
          />
          <Button onClick={getProximityIsochrones} disabled={loading}>
            {loading ? 'Loading...' : 'Find Zips'}
          </Button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Buttons to Show ZIP codes, Copy to Clipboard, and Export */}
        {(zipcodes['0-20'].length > 0 ||
          zipcodes['20-40'].length > 0 ||
          zipcodes['40-60'].length > 0) && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <Button onClick={toggleShowZipcodes}>
              {showZipcodes ? 'Hide ZIP Codes' : 'Show ZIP Codes'}
            </Button>
            <Button onClick={copyZipcodesToClipboard}>Copy ZIP Codes to Clipboard</Button>
            <Button onClick={exportToCSV}>Export ZIP Codes to CSV</Button>
          </div>
        )}

        {copyMessage && <p style={{ color: 'green' }}>{copyMessage}</p>}

        {/* Display ZIP codes in a table */}
        {showZipcodes && (
          <div style={{ marginTop: '20px' }}>
            <table border="1" cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>ZIP Codes (0-20 min)</th>
                  <th>ZIP Codes (20-40 min)</th>
                  <th>ZIP Codes (40-60 min)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const { '0-20': zip0to20, '20-40': zip20to40, '40-60': zip40to60 } = zipcodes;
                  const maxLength = Math.max(
                    zip0to20.length,
                    zip20to40.length,
                    zip40to60.length
                  );

                  return Array.from({ length: maxLength }, (_, i) => (
                    <tr key={i}>
                      <td>{zip0to20[i] || ''}</td>
                      <td>{zip20to40[i] || ''}</td>
                      <td>{zip40to60[i] || ''}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* Map container */}
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '80vh',
            marginTop: '20px',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AddressProximityWebapp;