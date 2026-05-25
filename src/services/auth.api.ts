import { api } from './api.api';

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
          message: error?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
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