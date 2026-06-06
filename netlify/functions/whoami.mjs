/* whoami — identifies the Whop user from their injected token.
   Works for Whop Products (no appID required).
   Whop automatically injects x-whop-user-token on every request
   made from within the Whop hub/app. */

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const token = event.headers['x-whop-user-token'];

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No Whop user token — user may not be inside Whop hub' }),
    };
  }

  try {
    /* Call Whop API directly with the user's token as Bearer.
       This works for Products — no appID or SDK needed. */
    const res = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Whop /api/v2/me error:', res.status, text);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token verification failed', status: res.status }),
      };
    }

    const user = await res.json();
    const userId = user.id;

    if (!userId) {
      console.error('No user ID in Whop response:', JSON.stringify(user));
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No user ID returned from Whop' }),
      };
    }

    console.log('whoami success — userId:', userId);
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
