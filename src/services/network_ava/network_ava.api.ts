import { api } from "../api.api";

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

export const networkAVAManage = {
  async UploadSitesAVA(formData: FormData) {
    console.log("UploadSitesAVA");
    // เพิ่มก่อน API call
    for (const [key, value] of formData.entries()) {
      console.log(key, (value as File).name);
    }
    const response = await api.post(
      "/NetworkAVA/UploadSitesAVA",
      formData
    );

    return response.data;
  },

  async UploadIncidentTT(formData: FormData) {
    // เพิ่มก่อน API call
    for (const [key, value] of formData.entries()) {
      console.log(key, (value as File).name);
    }
    const response = await api.post(
      "/NetworkAVA/UploadIncidentTT",
      formData
    );

    return response.data;
  },
  
  async UploadTop100SitesAVA(formData: FormData) {
    // เพิ่มก่อน API call
    for (const [key, value] of formData.entries()) {
      console.log(key, (value as File).name);
    }
    const response = await api.post(
      "/NetworkAVA/UploadTop100SitesAVA",
      formData
    );

    return response.data;
  },

  async AVAChart(data: any) {
    const response = await api.post(
      "/NetworkAVA/AVAChart", data
    );

    return response.data;
  },

  async AVAChartALL(data: any) {
    const response = await api.post(
      "/NetworkAVA/AVAChartALL", data
    );

    return response.data;
  },

  async AVAChartALL_graph(data: any) {
    const response = await api.post(
      "/NetworkAVA/AVAChartALL_graph", data
    );

    return response.data;
  },

  async AVAChartALL_incident(data: any) {
    const response = await api.post(
      "/NetworkAVA/AVAChartALL_incident", data
    );

    return response.data;
  },
};