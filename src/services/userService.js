// ========== CONFIG ==========
// ========== CONFIG ==========
const API_CONFIG = {
  USE_MOCK_API: true, // TRUE: Mock API | FALSE: Real API
  API_BASE_URL: 'http://localhost:8080/api/users/profile', // Thay đổi URL backend
  TIMEOUT: 5000,
};
// ========== MOCK DATA ==========
const MOCK_USER = {
  id: 1,
  fullName: 'Nguyễn Minh',
  birthDate: '01/01/1990',
  gender: 'Nam',
  email: 'nguyenminh@gmail.com',
  phone: '0123456789',
  avatar: 'https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg',
  joinDate: '01/01/2025',
};

const MOCK_ADDRESSES = [
  {
    id: 1,
    type: 'Nhà (Mặc định)',
    address: 'K275/27 Trường Chinh, An Khê, Thanh Khê, Đà Nẵng'
  },
  {
    id: 2,
    type: 'Công ty',
    address: 'Số 45, Đặng Dung 11, Hoà Minh, Liên Chiểu, Đà Nẵng'
  }
];

const MOCK_PAYMENTS = [
  { id: 1, type: 'VISA', number: 'Visa****1234' },
  { id: 2, type: 'MOMO', number: 'Momo****1234' }
];

// ========== MOCK FUNCTIONS ==========
const mockGetUserProfile = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...MOCK_USER,
        addresses: MOCK_ADDRESSES,
        payments: MOCK_PAYMENTS
      });
    }, 500);
  });
};

const mockUpdateUserProfile = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...MOCK_USER,
        ...userData,
        addresses: MOCK_ADDRESSES,
        payments: MOCK_PAYMENTS
      });
    }, 500);
  });
};

const mockAddAddress = async (address) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...address
      });
    }, 300);
  });
};

const mockDeleteAddress = async (addressId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id: addressId });
    }, 300);
  });
};

const mockAddPayment = async (payment) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...payment
      });
    }, 300);
  });
};

const mockDeletePayment = async (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id: paymentId });
    }, 300);
  });
};

// ========== REAL API FUNCTIONS ==========
const apiGetUserProfile = async () => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

const apiUpdateUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

const apiAddAddress = async (address) => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      },
      body: JSON.stringify(address)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to add address: ${error.message}`);
  }
};

const apiDeleteAddress = async (addressId) => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to delete address: ${error.message}`);
  }
};

const apiAddPayment = async (payment) => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      },
      body: JSON.stringify(payment)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to add payment: ${error.message}`);
  }
};

const apiDeletePayment = async (paymentId) => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to delete payment: ${error.message}`);
  }
};

// ========== PUBLIC SERVICE API ==========
const userService = {
  // Config Methods
  setUseMockAPI: (useMock) => {
    API_CONFIG.USE_MOCK_API = useMock;
  },

  setAPIBaseURL: (url) => {
    API_CONFIG.API_BASE_URL = url;
  },

  // User Profile
  getUserProfile: async () => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Using MOCK user profile');
        return await mockGetUserProfile();
      } else {
        console.log('[v0] Calling REAL API:', `${API_CONFIG.API_BASE_URL}/users/profile`);
        return await apiGetUserProfile();
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed - NO FALLBACK:', error.message);
        throw error;
      }
    }
  },

  updateUserProfile: async (userData) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Updating MOCK user profile');
        return await mockUpdateUserProfile(userData);
      } else {
        console.log('[v0] Calling REAL API to update profile');
        return await apiUpdateUserProfile(userData);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },

  // Address Management
  addAddress: async (address) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Adding MOCK address');
        return await mockAddAddress(address);
      } else {
        console.log('[v0] Calling REAL API to add address');
        return await apiAddAddress(address);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },

  deleteAddress: async (addressId) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Deleting MOCK address:', addressId);
        return await mockDeleteAddress(addressId);
      } else {
        console.log('[v0] Calling REAL API to delete address');
        return await apiDeleteAddress(addressId);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },

  // Payment Management
  addPayment: async (payment) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Adding MOCK payment');
        return await mockAddPayment(payment);
      } else {
        console.log('[v0] Calling REAL API to add payment');
        return await apiAddPayment(payment);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },

  deletePayment: async (paymentId) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Deleting MOCK payment:', paymentId);
        return await mockDeletePayment(paymentId);
      } else {
        console.log('[v0] Calling REAL API to delete payment');
        return await apiDeletePayment(paymentId);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  }
};

export default userService;
