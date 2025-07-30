const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, config);
  return handleResponse(response);
};

// Product API functions
export const fetchProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/products?${queryString}`);
};

export const fetchProduct = async (id) => {
  return apiRequest(`/products/${id}`);
};

export const fetchProductBySlug = async (slug) => {
  return apiRequest(`/products/slug/${slug}`);
};

export const fetchRelatedProducts = async (productId) => {
  return apiRequest(`/products/${productId}/related`);
};

export const searchProducts = async (query) => {
  return apiRequest(`/products/search/autocomplete?q=${encodeURIComponent(query)}`);
};

export const addProductReview = async (productId, reviewData) => {
  return apiRequest(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

// Order API functions
export const createOrder = async (orderData) => {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const fetchUserOrders = async (userId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/orders/user/${userId}?${queryString}`);
};

export const fetchOrder = async (orderId) => {
  return apiRequest(`/orders/${orderId}`);
};

export const fetchOrderByNumber = async (orderNumber) => {
  return apiRequest(`/orders/number/${orderNumber}`);
};

export const cancelOrder = async (orderId, reason) => {
  return apiRequest(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const downloadInvoice = async (orderId) => {
  const url = `${API_BASE_URL}/orders/${orderId}/invoice`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to download invoice');
  }
  
  return response.blob();
};

// Return API functions
export const createReturnRequest = async (returnData) => {
  return apiRequest('/returns', {
    method: 'POST',
    body: JSON.stringify(returnData),
  });
};

export const fetchUserReturns = async (userId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/returns/user/${userId}?${queryString}`);
};

export const fetchReturn = async (returnId) => {
  return apiRequest(`/returns/${returnId}`);
};

// User API functions
export const fetchUserProfile = async (userId) => {
  return apiRequest(`/users/${userId}`);
};

export const updateUserProfile = async (userId, profileData) => {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const fetchUserAddresses = async (userId) => {
  return apiRequest(`/users/${userId}/addresses`);
};

export const addUserAddress = async (userId, addressData) => {
  return apiRequest(`/users/${userId}/addresses`, {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

export const updateUserAddress = async (userId, addressId, addressData) => {
  return apiRequest(`/users/${userId}/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
};

export const deleteUserAddress = async (userId, addressId) => {
  return apiRequest(`/users/${userId}/addresses/${addressId}`, {
    method: 'DELETE',
  });
};

// Inventory API functions
export const fetchInventory = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/inventory?${queryString}`);
};

export const updateInventory = async (productId, inventoryData) => {
  return apiRequest(`/inventory/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  });
};

// Analytics API functions
export const fetchSalesAnalytics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/sales?${queryString}`);
};

export const fetchOrderAnalytics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/orders?${queryString}`);
};

// File upload functions
export const uploadImage = async (file, folder = 'products') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  return handleResponse(response);
};

export const uploadVideo = async (file, folder = 'returns') => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  return handleResponse(response);
};

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Error handling
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401')) {
    // Handle unauthorized
    localStorage.removeItem('auth-token');
    window.location.href = '/sign-in';
  }
  
  return {
    error: error.message || 'An unexpected error occurred',
  };
};