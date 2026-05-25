import { api } from './api.api';

export const AuthApiService = {
  async login(email: string, pass: string) {
    try {
      const response = await api.post('/login', {
        email,
        password: pass
      });

      console.log("📥 Login Response:", response.data);

      // ✅ 1. ปรับชื่อคีย์ให้ตรงกับ Axios Interceptor ตัวที่เราใช้ดึงค่า
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      // จัดการ error ให้สมบูรณ์แบบ
      if (error.response) {
        // เคสที่หลังบ้าน (Hono) จงใจส่ง Error กลับมา เช่น รหัสผิด (401) หรือข้อมูลไม่ครบ (400)
        throw {
          success: false,
          message: error.response.data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        };
      } else if (error.request) {
        // เคสที่ Render ล่ม, เน็ตหลุด หรือสัญญานไปไม่ถึงหลังบ้าน
        throw {
          success: false,
          // ✅ 2. เปลี่ยนให้แสดงภาษาไทยเป็นหลัก แล้วพ่วง Error ภาษาอังกฤษไว้ท้ายสุดเพื่อเอาไว้ส่องดูบั๊ก
          message: `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (${error.message || 'Network Error'})`
        };
      } else {
        // เคสผิดพลาดอื่น ๆ ในระบบฝั่งหน้าบ้านเอง
        throw {
          success: false,
          message: error.message || 'เกิดข้อผิดพลาดภายในระบบหน้าบ้าน'
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