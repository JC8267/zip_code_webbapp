'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [lng] = useState(-75.1652);
  const [lat] = useState(39.9526);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const handleAddressesChange = (event) => {
    const input = event.target.value;
    setAddressesInput(input);
    const addressList = input.split('\n').map(addr => addr.trim()).filter(addr => addr !== '');
    setAddresses(addressList);
  };

  const removeAllIsochroneLayersAndSources = () => {
    const layers = map.current.getStyle().layers;
    if (layers) {
      layers.forEach(layer => {
        if (layer.id.startsWith('isochrone-')) {
          map.current.removeLayer(layer.id);
        }
      });
    }

    const sources = Object.keys(map.current.getStyle().sources);
    sources.forEach(source => {
      if (source.startsWith('isochrone-')) {
        map.current.removeSource(source);
      }
    });
  };

  const getProximityIsochrones = async () => {
    if (addresses.length === 0) {
      setError('Please enter at least one valid address.');
      return;
    }

    // Set a maximum number of addresses to process at once (optional)
    const MAX_ADDRESSES = 10;
    if (addresses.length > MAX_ADDRESSES) {
      setError(`Please limit your input to ${MAX_ADDRESSES} addresses at a time.`);
      return;
    }

    setLoading(true);
    setLoadingMessage('');
    setError(null);
    setAllZipcodes({});
    setShowZipcodes(false);
    setCopyMessage('');

    // Clear existing markers and layers
    if (markers.current.length > 0) {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    }
    removeAllIsochroneLayersAndSources();

    const allZipcodes = {};

    try {
      for (const [index, address] of addresses.entries()) {
        setLoadingMessage(`Processing address ${index + 1} of ${addresses.length}`);

        // Introduce a delay before processing each address to avoid exceeding rate limits
        if (index > 0) {
          await delay(200); // Delay of 200 milliseconds between addresses
        }

        // Geocode the address
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${mapboxgl.accessToken}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        // Check if geocoding was successful
        if (!geocodeData.features || geocodeData.features.length === 0) {
          setError(`Geocoding failed for address: ${address}`);
          continue; // Skip to the next address
        }

        const [lng, lat] = geocodeData.features[0].center;

        // Add marker for the address
        const newMarker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(address))
          .addTo(map.current);
        markers.current.push(newMarker);

        // UPDATED timeRanges for 4 isochrones
        const timeRanges = [
          { time: 20, label: '0-20',   color: '#FF0000' },
          { time: 30, label: '20-30',  color: '#FFA500' },
          { time: 40, label: '30-40',  color: '#0000FF' },
          { time: 60, label: '40-60',  color: '#11ff00' },
        ];

        // Generate address label
        const addressLabel = address.substring(0, 10).replace(/\s+/g, '_');

        // UPDATED: Initialize 4 sets for zipcodes
        const zipcodesForAddress = {
          '0-20': new Set(),
          '20-30': new Set(),
          '30-40': new Set(),
          '40-60': new Set(),
        };

        for (const { time, label, color } of timeRanges) {
          // Introduce a delay before each isochrone API call to manage rate limits
          await delay(200); // Delay of 200 milliseconds between API calls

          const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=${time}&polygons=true&access_token=${mapboxgl.accessToken}`;
          const isochroneResponse = await fetch(isochroneUrl);
          const isochroneData = await isochroneResponse.json();

          // Check if isochrone data was returned
          if (!isochroneData.features || isochroneData.features.length === 0) {
            setError(`Isochrone API failed for address: ${address} at ${label} minutes`);
            continue; // Skip to the next time range
          }

          map.current.addSource(`isochrone-${label}-${index}`, {
            type: 'geojson',
            data: isochroneData,
          });

          map.current.addLayer({
            id: `isochrone-${label}-${index}`,
            type: 'fill',
            source: `isochrone-${label}-${index}`,
            layout: {},
            paint: {
              'fill-color': color,
              'fill-opacity': 0.2,
            },
          });

          // Fetch ZIP codes for the current isochrone
          const fetchedZipCodes = await fetchZipCodes(isochroneData, label);

          // Add unique ZIP codes to the set for this address and time range
          fetchedZipCodes.forEach(zip => zipcodesForAddress[label].add(zip));
        }

        // De-duplicate ZIP codes across the 4 time ranges
        const zip0to20 = Array.from(zipcodesForAddress['0-20']);
        const zip20to30 = Array.from(zipcodesForAddress['20-30']).filter(
          (zip) => !zip0to20.includes(zip)
        );
        const zip30to40 = Array.from(zipcodesForAddress['30-40']).filter(
          (zip) => !zip0to20.includes(zip) && !zip20to30.includes(zip)
        );
        const zip40to60 = Array.from(zipcodesForAddress['40-60']).filter(
          (zip) => !zip0to20.includes(zip) && !zip20to30.includes(zip) && !zip30to40.includes(zip)
        );

        // Store in allZipcodes with address label
        allZipcodes[addressLabel] = {
          '0-20': zip0to20,
          '20-30': zip20to30,
          '30-40': zip30to40,
          '40-60': zip40to60,
        };
      }

      setAllZipcodes(allZipcodes);

      // Adjust the map view to fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => bounds.extend(marker.getLngLat()));
      map.current.fitBounds(bounds, { padding: 50 });
    } catch (error) {
      setError(`An error occurred: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
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
    const csvData = [];

    // Header row
    csvData.push(['Address', 'Time Range', 'ZIP Code']);

    for (const [addressLabel, timeRanges] of Object.entries(allZipcodes)) {
      for (const [timeRange, zipcodes] of Object.entries(timeRanges)) {
        zipcodes.forEach(zipcode => {
          csvData.push([addressLabel, timeRange, zipcode]);
        });
      }
    }

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'proximity_zipcodes.csv');
  };

  const toggleShowZipcodes = () => {
    setShowZipcodes((prev) => !prev);
    setCopyMessage('');
  };

  const copyZipcodesToClipboard = () => {
    const tableRows = [];

    // Header row
    tableRows.push(['Address', 'Time Range', 'ZIP Code']);

    for (const [addressLabel, timeRanges] of Object.entries(allZipcodes)) {
      for (const [timeRange, zipcodes] of Object.entries(timeRanges)) {
        zipcodes.forEach(zipcode => {
          tableRows.push([addressLabel, timeRange, zipcode]);
        });
      }
    }

    // Convert tableRows to tab-separated values for Excel
    const textToCopy = tableRows.map((row) => row.join('\t')).join('\n');

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopyMessage('ZIP codes copied to clipboard!');
      },
      () => {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            placeholder="Enter addresses, one per line"
            value={addressesInput}
            onChange={handleAddressesChange}
            style={{ flex: 1, height: '100px', padding: '10px' }}
          />
          <Button onClick={getProximityIsochrones} disabled={loading}>
            {loading ? loadingMessage || 'Loading...' : 'Find Zips'}
          </Button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Buttons to Show ZIP codes, Copy to Clipboard, and Export */}
        {Object.keys(allZipcodes).length > 0 && (
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
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table border="1" cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Time Range</th>
                  <th>ZIP Codes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(allZipcodes).flatMap(([addressLabel, timeRanges]) =>
                  Object.entries(timeRanges).flatMap(([timeRange, zipcodes]) =>
                    zipcodes.map(zipcode => (
                      <tr key={`${addressLabel}-${timeRange}-${zipcode}`}>
                        <td>{addressLabel}</td>
                        <td>{timeRange}</td>
                        <td>{zipcode}</td>
                      </tr>
                    ))
                  )
                )}
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
