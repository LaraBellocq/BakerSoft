const BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api/';

const resolveBase = (base) => (base?.endsWith('/') ? base : `${base}/`);

export async function fetchJson(path, options = {}) {
  const base = resolveBase(BASE_URL);
  const url = `${base}${path.startsWith('/') ? path.slice(1) : path}`;
  const { headers, body, ...rest } = options;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);

  const parseJson = async () => {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  if (!response.ok) {
    const errorData = await parseJson();
    throw {
      status: response.status,
      data: errorData,
    };
  }

  return await parseJson();
}
