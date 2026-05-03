exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const { code, redirect_uri } = JSON.parse(event.body || '{}');
  if (!code) return { statusCode: 400, body: JSON.stringify({ error: 'no_code' }) };
  const ALLOWED_IDS = ['1123249835546529802', '668981590310912022'];
  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return { statusCode: 401, body: JSON.stringify({ error: 'token_failed' }) };
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();
    if (!ALLOWED_IDS.includes(user.id)) return { statusCode: 403, body: JSON.stringify({ error: 'not_authorized' }) };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, username: user.username, avatar: user.avatar }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) };
  }
};
