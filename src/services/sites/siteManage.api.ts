import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 300000, // 5 นาที
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

export const siteManage = {
  async getAllSite() {
    const response = await axios.get(
      "http://localhost:3000/api/siteManage/getAllSite"
    );
    return response.data;
  },
};