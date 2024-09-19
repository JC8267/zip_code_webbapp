'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadIcon } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';


const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`, data);
      throw new Error(
        `HTTP error! Status: ${response.status} - ${
          data.error || data.message || 'Unknown error'
        }`
      );
    }

    return data;
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const AddressProximityWebapp = () => {
  const [address, setAddress] = useState('');
  const [zipcodes, setZipcodes] = useState({
    '0-20': [],
    '20-40': [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const getProximityZipcodes = async () => {
    if (!address.trim()) {
      setError('Please enter a valid address.');
      return;
    }

    setLoading(true);
    setError(null);
    setZipcodes({ '0-20': [], '20-40': [] });

    try {
      const apiKey = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
      console.log(`Mapbox API Key: ${apiKey ? 'Set' : 'Not set'}`);

      // Geocode the address using Mapbox Geocoding API
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${apiKey}&limit=1`;
      const geocodeData = await fetchWithRetry(geocodeUrl);

      if (!geocodeData.features || geocodeData.features.length === 0) {
        setError('Address not found. Please enter a valid address.');
        setLoading(false);
        return;
      }

      const [lng, lat] = geocodeData.features[0].center;
      console.log(`Coordinates: Latitude ${lat}, Longitude ${lng}`);

      const timeRanges = [
        { time: 20, label: '0-20' },
        { time: 40, label: '20-40'},
        
      ];

      for (const { time, label } of timeRanges) {
        try {
          const isolineUrl = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}.json?contours_minutes=${time}&polygons=true&access_token=${apiKey}`;
          const isolineData = await fetchWithRetry(isolineUrl);

          if (!isolineData.features || isolineData.features.length === 0) {
            console.log(`No isoline data for ${label} minutes`);
            continue;
          }

          const isolineGeometry = isolineData.features[0].geometry.coordinates[0];
          console.log(`Isoline Geometry for ${label} minutes:`, isolineGeometry);

          const response = await fetch('/api/getZipCodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isolineGeometry }),
          });

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server did not return JSON.');
          }

          const zipCodesData = await response.json();
          console.log(`Server Response for ${label}:`, zipCodesData);

          if (zipCodesData.error) {
            setError((prevError) =>
              prevError
                ? `${prevError}\nError for ${label} minutes range: ${zipCodesData.error}`
                : `Error for ${label} minutes range: ${zipCodesData.error}`
            );
          } else if (zipCodesData.message) {
            console.log(`Message for ${label} minutes:`, zipCodesData.message);
          } else if (zipCodesData.zipcodes && zipCodesData.zipcodes.length > 0) {
            const uniqueZipcodes = [...new Set(zipCodesData.zipcodes)];
            console.log(`${label} minutes: ${uniqueZipcodes.length} zip codes found`);
            setZipcodes((prevZipcodes) => ({
              ...prevZipcodes,
              [label]: uniqueZipcodes,
            }));
          } else {
            console.log(`No zip codes found for ${label} minutes`);
          }
        } catch (error) {
          console.error(`Error fetching data for ${label} minutes range:`, error);
          setError((prevError) =>
            prevError
              ? `${prevError}\nError for ${label} minutes range: ${error.message}`
              : `Error for ${label} minutes range: ${error.message}`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching proximity zipcodes:', error);
      setError(`An error occurred: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };


  const exportToCSV = () => {
    const { '0-20': zip0to20, '20-40': zip20to40 } = zipcodes;
    console.log('Exporting ZIP codes:', zip0to20, zip20to40);

    if (zip0to20.length === 0 && zip20to40.length === 0) {
      alert('No ZIP codes available to export.');
      return;
    }

    const maxLength = Math.max(zip0to20.length, zip20to40.length);
    const csvData = [
      ['Zip Codes (0-20 min)', 'Zip Codes (20-40 min)'],
      ...Array.from({ length: maxLength }, (_, i) => [
        zip0to20[i] || '',
        zip20to40[i] || '',
      ]),
    ];

    console.log('CSV Data:', csvData);

    const csvString = Papa.unparse(csvData);
    console.log('CSV String:', csvString);

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'proximity_zipcodes.csv');

    alert('CSV exported successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <h2>Address Proximity Webapp</h2>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Enter an address"
          value={address}
          onChange={handleAddressChange}
        />
        <Button onClick={getProximityZipcodes} disabled={loading}>
          {loading ? 'Loading...' : 'Get Proximity Zipcodes'}
        </Button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {(zipcodes['0-20'].length > 0 || zipcodes['20-40'].length > 0) && (
          <div>
            {zipcodes['0-20'].length > 0 && (
              <>
                <h3>Zip Codes Within 0-20 Minutes:</h3>
                <ul>
                  {zipcodes['0-20'].map((zipcode, index) => (
                    <li key={`0-20-${index}`}>{zipcode}</li>
                  ))}
                </ul>
              </>
            )}
            {zipcodes['20-40'].length > 0 && (
              <>
                <h3>Zip Codes Within 20-40 Minutes:</h3>
                <ul>
                  {zipcodes['20-40'].map((zipcode, index) => (
                    <li key={`20-40-${index}`}>{zipcode}</li>
                  ))}
                </ul>
              </>
            )}
            <Button onClick={exportToCSV}>
              Export to CSV <DownloadIcon />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressProximityWebapp;