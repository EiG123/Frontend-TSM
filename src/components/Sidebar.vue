<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.user?.username || "User");
const email = computed(() => authStore.user?.email || "user@gmail.com");

const goHome = () => { router.push("/home"); emit("close"); };
const goPM = () => { router.push("/PM"); emit("close"); };
const goPMTitle = () => { router.push("/PM_Title"); emit("close"); };
const goPMDropdown = () => { router.push("/pm_dropdown"); emit("close"); };
const goToSettings = () => { emit("close"); };
const logout = () => { authStore.logout(); router.push("/"); emit("close"); };
const goDev = () => { router.push("/dev/devDashboard"); emit("close"); };
const goAdmin = () => { router.push("/admin/adminDashboard"); emit("close"); };
</script>

<template>
  <aside
    class="
      fixed top-0 left-0 w-64 h-screen flex flex-col z-40
      transition-transform duration-300 ease-in-out
      md:translate-x-0
      bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800
      border-r border-slate-200 dark:border-slate-700/50
      shadow-2xl
    "
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- ===== HEADER / LOGO ===== -->
    <div class="p-6 border-b border-slate-200 dark:border-slate-700/50">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">TS</span>
          </div>
        </div>
        <!-- ปุ่มปิด mobile -->
        <button
          @click="emit('close')"
          class="md:hidden p-1 rounded-lg
                 text-slate-400 hover:text-slate-600 dark:hover:text-white
                 hover:bg-slate-100 dark:hover:bg-slate-700/50
                 transition-colors duration-300"
          aria-label="Close menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== NAVIGATION ===== -->
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <!-- Dev -->
      <button
        v-if="authStore.hasPermission('dev')"
        @click="goDev"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-white bg-purple-600 hover:bg-purple-700
               transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"/>
        </svg>
        <span class="font-medium">Dev</span>
      </button>

      <!-- Admin -->
      <button
        v-if="authStore.hasPermission('admin_dashboard')"
        @click="goAdmin"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-white bg-red-600 hover:bg-red-700
               transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"/>
        </svg>
        <span class="font-medium">Admin</span>
      </button>

      <!-- Dashboard -->
      <button
        @click="goHome"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-white bg-blue-600 hover:bg-blue-700
               transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span class="font-medium">Dashboard</span>
      </button>

      <!-- PM -->
      <button
        @click="goPM"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-slate-600 dark:text-slate-300
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-slate-700/50
               transition-all duration-300 group"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span class="font-medium">Project Management</span>
      </button>

      <!-- Modules -->
      <button
        @click="emit('close')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-slate-600 dark:text-slate-300
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-slate-700/50
               transition-all duration-300 group"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <span class="font-medium">Modules</span>
      </button>

      <!-- Divider -->
      <div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/50"></div>

      <!-- Settings -->
      <button
        @click="goToSettings"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-slate-600 dark:text-slate-300
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-slate-700/50
               transition-all duration-300 group"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="font-medium">Settings</span>
      </button>

      <!-- PM Title (admin) -->
      <button
        v-if="authStore.hasPermission('admin')"
        @click="goPMTitle"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-slate-600 dark:text-slate-300
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-slate-700/50
               transition-all duration-300 group"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="font-medium">PM Title</span>
      </button>

      <!-- PM Dropdown (admin) -->
      <button
        v-if="authStore.hasPermission('admin')"
        @click="goPMDropdown"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg
               text-slate-600 dark:text-slate-300
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-slate-700/50
               transition-all duration-300 group"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="font-medium">PM Dropdown</span>
      </button>

    </nav>

    <!-- ===== USER PROFILE & LOGOUT ===== -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-700/50">
      <div class="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg
                  bg-slate-100 dark:bg-slate-700/30">
        <div class="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white font-semibold text-sm">
            {{ username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-slate-800 dark:text-white text-sm font-medium truncate">{{ username }}</p>
          <p class="text-slate-500 dark:text-slate-400 text-xs truncate">{{ email }}</p>
        </div>
      </div>

      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
               text-red-500 dark:text-red-400
               hover:text-white
               hover:bg-red-500 dark:hover:bg-red-600/20
               border border-red-300 dark:border-red-600/30
               hover:border-red-500 dark:hover:border-red-600/50
               transition-all duration-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>