exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  /* DEBUG — log every header Whop sends so we know what's available */
  const safeHeaders = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    /* Redact the actual token value but show the key name */
    safeHeaders[k] = k.toLowerCase().includes('token') || k.toLowerCase().includes('auth')
      ? v ? '[PRESENT]' : '[EMPTY]'
      : v;
  }
  console.log('HEADERS RECEIVED:', JSON.stringify(safeHeaders));

  const token = event.headers['x-whop-user-token'];

  if (!token) {
    console.log('NO TOKEN — x-whop-user-token absent');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No Whop user token' }),
    };
  }

  try {
    const res = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Whop API error:', res.status, text);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token verification failed' }),
      };
    }

    const user = await res.json();
    const userId = user.id;

    if (!userId) {
      console.error('No user ID in response:', JSON.stringify(user));
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No user ID from Whop' }),
      };
    }

    console.log('SUCCESS — userId:', userId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ userId }),
    };
  } catch (err) {
    console.error('whoami error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
