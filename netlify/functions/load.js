exports.handler = async (event) => {
  const key = event.queryStringParameters?.key;
  if (!key) return { statusCode: 400, body: '-- no key' };
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/ocean_scripts?exec_key=eq.${key}&status=eq.active&select=code`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await res.json();
    if (!data.length) return { statusCode: 403, headers: { 'Content-Type': 'text/plain' }, body: '-- [Ocean] invalid or inactive key' };
    return { statusCode: 200, headers: { 'Content-Type': 'text/plain' }, body: data[0].code };
  } catch (e) {
    return { statusCode: 500, body: '-- server error' };
  }
};
