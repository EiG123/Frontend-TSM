import { defineStore } from "pinia";
import { AuthApiService } from "../services/auth.api";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  sub?: string;
  email?: string;
  role?: string;
}

interface User {
  id: any;
  username: string;
  email: string;
  role: string;
  region: string;
  company: string;
  permissions: string[];
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    user: null as User | null,
    logoutTimer: null as number | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role,
    userId: (state) => state.user?.id,
    userRegion: (state) => state.user?.region,

    hasPermission: (state) => {
      // console.log(state.user?.permissions);
      return (permission: string) => {
        const perms = state.user?.permissions || [];
        return perms.includes('*') || perms.includes(permission);
      };
    }

  },

  actions: {
    async login(email: string, password: string) {
      try {
        const data = await AuthApiService.login(email, password);
        // console.log("LOGIN RESPONSE:", data);
        console.log(data);
        // console.log(this.user?.permissions);

        // เช็คว่า response สำเร็จหรือไม่
        if (!data.success || !data.token) {
          return {
            success: false,
            error: data.message || 'เข้าสู่ระบบไม่สำเร็จ'
          };
        }

        this.token = data.token;
        this.user = data.user;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        this.startAutoLogout(data.token);

        return { success: true };

      } catch (error: any) {
        console.error('Login error:', error);
        return {
          success: false,
          error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        };
      }
    },

    logout() {
      this.token = null;
      this.user = null;

      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // redirect to login (optional)
      // window.location.href = '/login';
    },

    initAuth() {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        this.logout();
        return;
      }

      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // เช็คว่า token หมดอายุหรือยัง
        const expiresIn = decoded.exp * 1000 - Date.now();

        if (expiresIn <= 0) {
          console.log('Token expired, logging out...');
          this.logout();
          return false;
        }

        // ถ้า token ใกล้หมดอายุ (เหลือน้อยกว่า 5 นาที) ให้เตือน
        if (expiresIn < 5 * 60 * 1000) {
          console.warn('Token will expire soon!');
        }

        this.token = token;
        this.user = JSON.parse(user);
        this.startAutoLogout(token);

        return true;

      } catch (error) {
        console.error('Token validation error:', error);
        this.logout();
        return false;
      }
    },

    startAutoLogout(token: string) {
      try {
        // ล้าง timer เก่าก่อน (ถ้ามี)
        if (this.logoutTimer) {
          clearTimeout(this.logoutTimer);
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const expiresIn = decoded.exp * 1000 - Date.now();

        console.log(`Token will expire in ${Math.floor(expiresIn / 1000 / 60)} minutes`);

        // ตั้ง timer สำหรับ auto logout
        this.logoutTimer = window.setTimeout(() => {
          console.log('Session expired, logging out...');
          this.logout();
          alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');

          // redirect to login
          window.location.href = '/';
        }, expiresIn);
      } catch (error) {
        console.error('Error setting auto logout:', error);
      }
    },

    // Optional: Refresh token (ถ้า backend รองรับ)
    async refreshToken() {
      try {
        // เรียก API refresh token
        // const data = await AuthApiService.refreshToken();
        // this.token = data.token;
        // localStorage.setItem("token", data.token);
        // this.startAutoLogout(data.token);
      } catch (error) {
        console.error('Refresh token error:', error);
        this.logout();
      }
    },
  },
});