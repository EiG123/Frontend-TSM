import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 วินาที
});

// Request interceptor - เพิ่ม token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("TOKEN:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - จัดการ error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ถ้า token หมดอายุหรือไม่ valid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (ถ้าใช้ Vue Router)
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export const AuthApiService = {
  async login(email: string, pass: string) {
    try {
      const response = await api.post('/login', {
        email,
        password: pass
      });
      console.log(response.data);
      // เก็บ token และ user data
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      // จัดการ error ให้ดีขึ้น
      if (error.response) {
        throw {
          success: false,
          message: error.response.data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        };
      } else if (error.request) {
        throw {
          success: false,
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        };
      } else {
        throw {
          success: false,
          message: 'เกิดข้อผิดพลาด'
        };
      }
    }
  },

  async register(data: any) {
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (err) {
      return {
        success: false,
        message: 'ไม่สามารถ register ได้'
      }
    }
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export const PmApiService = {
  async createPmNodeB(data: any) {
    try {
      const response = await api.post('/pm_nodeb', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          success: false,
          message: error.response.data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        };
      } else if (error.request) {
        throw {
          success: false,
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        };
      } else {
        throw {
          success: false,
          message: 'เกิดข้อผิดพลาด'
        };
      }
    }
  }
};

export default api;