import { apiClient } from '@/lib/api-client'

/**
 * API wrapper para manter compatibilidade com código existente
 * Expõe uma interface axios-like usando o ky client
 */
export const api = {
  async get(url: string, config?: any) {
    const response = await apiClient.get(url.startsWith('/') ? url.slice(1) : url, config)
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  },

  async post(url: string, data?: any, config?: any) {
    const response = await apiClient.post(url.startsWith('/') ? url.slice(1) : url, {
      json: data,
      ...config,
    })
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  },

  async put(url: string, data?: any, config?: any) {
    const response = await apiClient.put(url.startsWith('/') ? url.slice(1) : url, {
      json: data,
      ...config,
    })
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  },

  async patch(url: string, data?: any, config?: any) {
    const response = await apiClient.patch(url.startsWith('/') ? url.slice(1) : url, {
      json: data,
      ...config,
    })
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  },

  async delete(url: string, config?: any) {
    const response = await apiClient.delete(url.startsWith('/') ? url.slice(1) : url, config)
    return {
      data: await response.json().catch(() => null), // DELETE pode não ter body
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  },
}
