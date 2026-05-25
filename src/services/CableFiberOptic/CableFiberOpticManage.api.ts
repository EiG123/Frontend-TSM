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

export const CableFiberOpticManage = {
  async UploadCable(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/UploadCable",
      formData
    );

    return response.data;
  },

  async getAllCable() {
    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/getAllCable"
    );

    return response.data.data;
  },

  async getCableById(data: any) {
    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/getCableById", data
    );

    return response.data.data;
  },

  async deleteCable(data: any) {
    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/deleteCable", data
    );

    return response.data.data;
  },

  async updateCable(formData: any) {
    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/updateCable", formData

    );
    return response.data.data;
  },

  async downloadCable(data: any) {
    const response = await api.post(
      "http://localhost:3000/api/CalbleFiberOptic/downloadCable", data, {
      responseType: "blob",
    }
    );
    const blob = new Blob(
      [response.data],
      {
        type: "application/vnd.google-earth.kmz",
      }
    );

    return blob;
  },
};