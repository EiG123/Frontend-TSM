<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";
import { AuthApiService } from "../services/auth.api";

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const confirmed_password = ref("");

const username = ref("");
const phone = ref("");
const region = ref("");
const company = ref("");

const error = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirmedPassword = ref(false);

const handleRegister = async () => {
  error.value = "";

  // Validation
  if (password.value !== confirmed_password.value) {
    error.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  if (password.value.length < 6) {
    error.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    return;
  }

  loading.value = true;

  // Call register API
  const result = await AuthApiService.register({
    email: email.value,
    password: password.value,
    confirmPassword: confirmed_password.value,
    username: username.value,
    phone: phone.value,
    region: region.value,
    company: company.value,
  });

  loading.value = false;

  // Simulate success for now
  if (result.success) {
    router.push("/");
  } else {
    error.value = result.error || "สมัครสมาชิกไม่สำเร็จ";
    // router.go(0);
  }
  // For demo - remove this and uncomment above
  setTimeout(() => {
    router.push("/");
  }, 1000);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmedPasswordVisibility = () => {
  showConfirmedPassword.value = !showConfirmedPassword.value;
};

const goLogin = () => {
  router.push("/");
};
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300"
  >
    <div class="w-full max-w-2xl animate-fade-in">
      <!-- Theme Toggle Button - Top Right -->
      <div class="flex justify-end mb-4">
        <button
          @click="themeStore.toggleTheme()"
          class="absolute top-4 right-4 p-3 rounded-xl fixed top-4 right-4 z-50 p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <span v-if="themeStore.isDark" class="text-2xl">☀️</span>
          <span v-else class="text-2xl">🌙</span>
        </button>
      </div>
      <!-- Register Card -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-2xl"
      >
        <!-- Header Section -->
        <div class="relative overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
          ></div>
          <div class="absolute inset-0 backdrop-blur-sm"></div>

          <div class="relative px-8 py-10 text-center">
            <!-- Logo/Icon -->
            <div
              class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <svg
                class="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>

            <h2
              class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-2"
            >
              สมัครสมาชิก
            </h2>
            <p class="text-gray-600 dark:text-slate-400">
              กรอกข้อมูลเพื่อสร้างบัญชีใหม่
            </p>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleRegister" class="px-8 py-8 space-y-5">
          <!-- Error Message -->
          <div
            v-if="error"
            class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 animate-shake"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-sm text-red-700 dark:text-red-300 font-medium">
                {{ error }}
              </p>
            </div>
          </div>

          <!-- Two Column Grid for Desktop -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Email Input -->
            <div class="space-y-2">
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                อีเมล <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Username Input -->
            <div class="space-y-2">
              <label
                for="username"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                ชื่อผู้ใช้ <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="username"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                รหัสผ่าน <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-12 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  :disabled="loading"
                >
                  <svg
                    v-if="!showPassword"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirmed Password Input -->
            <div class="space-y-2">
              <label
                for="confirmed_password"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                ยืนยันรหัสผ่าน <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  id="confirmed_password"
                  v-model="confirmed_password"
                  :type="showConfirmedPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-12 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  @click="toggleConfirmedPasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  :disabled="loading"
                >
                  <svg
                    v-if="!showConfirmedPassword"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Phone Input -->
            <div class="space-y-2">
              <label
                for="phone"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                เบอร์โทรศัพท์ <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  id="phone"
                  v-model="phone"
                  type="tel"
                  placeholder="08XXXXXXXX"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-12 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Region Select -->
            <div class="space-y-2">
              <label
                for="region"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                ภูมิภาค <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <select
                  id="region"
                  v-model="region"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-12 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">เลือกภูมิภาค...</option>
                  <option value="R1">R1</option>
                  <option value="R2">R2</option>
                  <option value="R3">R3</option>
                  <option value="R4">R4</option>
                  <option value="R5">R5</option>
                  <option value="R6">R6</option>
                  <option value="R7">R7</option>
                  <option value="R8">R8</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Company Select -->
            <div class="space-y-2">
              <label
                for="company"
                class="block text-sm font-medium text-gray-700 dark:text-slate-400"
              >
                บริษัท <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <select
                  id="company"
                  v-model="company"
                  required
                  :disabled="loading"
                  class="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">เลือกบริษัท...</option>
                  <option value="true">TRUE</option>
                  <option value="bbtec">BBTEC</option>
                  <option value="ww">WW</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก" }}
          </button>
        </form>

        <!-- Footer -->
        <div
          class="px-8 py-5 bg-gray-50 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-700/50 text-center"
        >
          <p class="text-sm text-gray-600 dark:text-slate-400">
            มีบัญชีอยู่แล้ว?
            <button
              @click="goLogin"
              type="button"
              class="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ml-1"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-shake {
  animation: shake 0.5s;
}
</style>