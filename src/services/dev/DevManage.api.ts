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

export const DevManage = {
    async deleteUserById(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/deleteUserById", data
        );
        return response.data;
    },

    async getAllUser() {
        const response = await api.get(
            "http://localhost:3000/api/DevManage/getAllUser"
        );
        return response.data;
    },

    async getAllRole() {
        const response = await api.get(
            "http://localhost:3000/api/DevManage/getAllRole"
        );
        return response.data;
    },

    async getAllPermission() {
        const response = await api.get(
            "http://localhost:3000/api/DevManage/getAllPermission"
        );
        return response.data;
    },

    async getAllRoleWithPermission() {
        const response = await api.get(
            "http://localhost:3000/api/DevManage/getAllRoleWithPermission"
        );
        return response.data;
    },

    async savePermissions(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/savePermissions", data
        );
        return response.data;
    },

    async deleteRole(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/deleteRole", data
        );
        return response.data;
    },


    async getUserById(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/getUserById", data
        );
        return response.data;
    },

    async userEdit(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/userEdit", data
        );
        return response.data;
    },

    async AddRole(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/AddRole", data
        );
        return response.data;
    },

    async addPermission(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/addPermission", data
        );
        return response.data;
    },

    async updatePermission(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/updatePermission", data
        );
        return response.data;
    },

    async deletePermission(data: any) {
        const response = await api.post(
            "http://localhost:3000/api/DevManage/deletePermission", data
        );
        return response.data;
    },
};

