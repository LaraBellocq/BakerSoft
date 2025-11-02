const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const COLLECTION_PATH = `${API_BASE_URL}/tipo-producto`;

const ensureJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};

export const updateTipoProducto = async (id, tipoProductoData) => {
  try {
    const response = await fetch(`${COLLECTION_PATH}/${id}/actualizar/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(tipoProductoData),
    });

    if (!response.ok) {
      const errorData = await ensureJson(response);
      throw new Error(errorData.error || 'Error al actualizar el tipo de producto');
    }

    return await ensureJson(response);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getTipoProductoById = async (id) => {
  try {
    const response = await fetch(`${COLLECTION_PATH}/${id}/`);

    if (!response.ok) {
      const errorData = await ensureJson(response);
      throw new Error(errorData.error || 'Error al obtener el tipo de producto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createTipoProducto = async (tipoProductoData) => {
  try {
    const response = await fetch(`${COLLECTION_PATH}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        nombre: tipoProductoData.nombre,
        descripcion: tipoProductoData.descripcion,
        activo: true,
      }),
    });

    if (!response.ok) {
      const errorData = await ensureJson(response);
      throw new Error(errorData.message || 'Error al crear el tipo de producto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getTiposProducto = async ({ search } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append('search', search);
    }

    const queryString = queryParams.toString();
    const response = await fetch(`${COLLECTION_PATH}/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const data = await ensureJson(response);
      throw new Error(data.message || 'Error al obtener los tipos de producto');
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return data;
    }

    return {
      count: data.length,
      results: data,
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteTipoProducto = async (id) => {
  try {
    const response = await fetch(`${COLLECTION_PATH}/${id}/`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await ensureJson(response);
      throw new Error(
        errorData.error || errorData.message || 'Error al eliminar el tipo de producto'
      );
    }

    if (response.status === 204) {
      return null;
    }

    return await ensureJson(response);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

