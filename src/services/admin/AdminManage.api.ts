import axios from "axios";
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

export const AdminManage = {
    async getAllUser() {
        const response = await axios.get(
            "http://localhost:3000/api/AdminManage/getAllUser"
        );
        return response.data;
    },

    async getUserById(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/AdminManage/getUserById", data
        );
        return response.data;
    },

    async userEdit(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/AdminManage/userEdit", data
        );
        return response.data;
    },

    async getAllRole(){
        const response = await axios.get(
            "http://localhost:3000/api/AdminManage/getAllRole"
        );
        return response.data;
    },

    async deleteUserById(data: any){
        const response = await api.post(
            "http://localhost:3000/api/AdminManage/deleteUserById", data
        );
        return response.data;
    },
};

