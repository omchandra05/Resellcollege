/**
 * API Configuration
 * Centralized API base URL and endpoints for the entire application
 */

// In production, use the VITE_API_URL from environment variables.
// In development, this will be an empty string, and requests will be
// handled by the Vite proxy defined in vite.config.js.
const rawApiBaseUrl = import.meta.env.VITE_API_URL || '';
// Trim any trailing slash to prevent double slashes in the final URL
const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl.slice(0, -1) : rawApiBaseUrl;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },

  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
    AVATAR: `${API_BASE_URL}/api/users/avatar`,
    WISHLIST: `${API_BASE_URL}/api/users/wishlist`,
  },

  // Products/Listings
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/products`,
    DETAIL: (id) => `${API_BASE_URL}/api/products/${id}`,
    CREATE: `${API_BASE_URL}/api/products`,
    UPDATE: (id) => `${API_BASE_URL}/api/products/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/products/${id}`,
    SEARCH: `${API_BASE_URL}/api/products/search`,
  },

  // Chat
  CHAT: {
    CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
    MESSAGES: (conversationId) => `${API_BASE_URL}/api/chat/messages/${conversationId}`,
    SEND: `${API_BASE_URL}/api/chat/send`,
  },

  // Seller
  SELLER: {
    DASHBOARD: `${API_BASE_URL}/api/seller/dashboard`,
    LISTINGS: `${API_BASE_URL}/api/seller/listings`,
    SALES: `${API_BASE_URL}/api/seller/sales`,
    ANALYTICS: `${API_BASE_URL}/api/seller/analytics`,
  },

  // Buyer
  BUYER: {
    PURCHASES: `${API_BASE_URL}/api/buyer/purchases`,
    WISHLIST: `${API_BASE_URL}/api/buyer/wishlist`,
  },
};

/**
 * Helper function to make authenticated API calls
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {string} token - JWT token from user context
 * @returns {Promise}
 */
export const apiCall = async (url, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export default API_ENDPOINTS;
