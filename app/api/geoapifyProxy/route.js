import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error('Server-side API Key not configured');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const requestBody = await request.json();

    const geoapifyRequestBody = {
      ...requestBody,
      apiKey: apiKey, // Include the API key in the body
    };

    console.log('Request Body to Geoapify:', JSON.stringify(geoapifyRequestBody));

    const response = await fetch('https://api.geoapify.com/v2/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geoapifyRequestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Geoapify API Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}