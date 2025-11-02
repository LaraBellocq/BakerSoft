import { fetchJson } from './api.js';

const COLLECTION_PATH = 'v1/tipo-producto/';

function buildPath(suffix = '') {
  return `${COLLECTION_PATH}${suffix}`;
}

function pickFirstString(value) {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        return item;
      }
    }
  }

  if (value && typeof value === 'object') {
    return extractNestedMessage(value);
  }

  return '';
}

function extractNestedMessage(data) {
  if (!data || typeof data !== 'object') {
    return '';
  }

  for (const key of Object.keys(data)) {
    const message = pickFirstString(data[key]);
    if (message) {
      return message;
    }
  }

  return '';
}

function resolveErrorMessage(error, fallbackMessage) {
  const data = error?.data;
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  const directMessage =
    (typeof data.message === 'string' && data.message.trim()) ||
    (typeof data.error === 'string' && data.error.trim()) ||
    (typeof data.detail === 'string' && data.detail.trim()) ||
    (Array.isArray(data.non_field_errors) && data.non_field_errors[0]);

  if (directMessage) {
    return directMessage;
  }

  const nested = extractNestedMessage(data);
  return nested || fallbackMessage;
}

function normalizeApiError(error, fallbackMessage) {
  const message = resolveErrorMessage(error, fallbackMessage);
  const normalized = new Error(message || fallbackMessage);
  if (error && typeof error === 'object') {
    normalized.status = error.status;
    normalized.data = error.data;
  }
  return normalized;
}

async function withErrorHandling(action, fallbackMessage) {
  try {
    return await action();
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
}

export async function updateTipoProducto(id, tipoProductoData) {
  return withErrorHandling(
    () =>
      fetchJson(buildPath(`${id}/actualizar/`), {
        method: 'PUT',
        body: tipoProductoData,
        auth: true,
      }),
    'Error al actualizar el tipo de producto',
  );
}

export async function getTipoProductoById(id) {
  return withErrorHandling(
    () =>
      fetchJson(buildPath(`${id}/`), {
        auth: true,
      }),
    'Error al obtener el tipo de producto',
  );
}

export async function createTipoProducto(tipoProductoData) {
  return withErrorHandling(
    () =>
      fetchJson(buildPath(), {
        method: 'POST',
        body: {
          nombre: tipoProductoData.nombre,
          descripcion: tipoProductoData.descripcion,
          activo: true,
        },
        auth: true,
      }),
    'Error al crear el tipo de producto',
  );
}

export async function getTiposProducto({ search, signal } = {}) {
  return withErrorHandling(async () => {
    const params = new URLSearchParams();
    if (search) {
      params.set('search', String(search).trim());
    }

    const suffix = params.toString();
    const data = await fetchJson(buildPath(suffix ? `?${suffix}` : ''), {
      auth: true,
      signal,
    });

    if (Array.isArray(data)) {
      return {
        count: data.length,
        results: data,
      };
    }

    return data ?? { count: 0, results: [] };
  }, 'Error al obtener los tipos de producto');
}

export async function deleteTipoProducto(id) {
  return withErrorHandling(
    () =>
      fetchJson(buildPath(`${id}/`), {
        method: 'DELETE',
        auth: true,
      }),
    'Error al eliminar el tipo de producto',
  );
}
