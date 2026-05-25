<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";
import { defineStore } from "pinia";

const themeStore = useThemeStore();

const router = useRouter();
const authStore = useAuthStore();

// รับ props สำหรับควบคุมการแสดงผล
const props = defineProps<{
  onMenuClick?: () => void;
}>();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.user?.username || "User");

const goProfile = () => {
  router.push("/profile");
};
</script>

<template>
  <header
    class="fixed top-0 right-0 h-16 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 border-b border-slate-700/50 shadow-lg z-30 flex items-center px-4 md:px-6 transition-all duration-300"
    :class="[
      // บน mobile: เต็มหน้าจอ
      // บนหน้าจอใหญ่: เว้นที่สำหรับ sidebar
      'left-0 md:left-64',
    ]"
  >
    <!-- LEFT - Menu Button (Mobile Only) + Title -->
    <div class="flex items-center gap-3 flex-1">
      <!-- Hamburger Menu Button สำหรับ Mobile -->
      <button
        @click="onMenuClick"
        class="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
        aria-label="Toggle menu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Title -->
      <h1 class="text-black-to-br dark:text-white truncate md:text-xl font-bold">
        TSM Platform
      </h1>
    </div>

    <!-- RIGHT - Actions -->
    <div class="flex items-center gap-2 md:gap-3">
      <button
        @click="themeStore.toggleTheme()"
        class="p-2 rounded-lg hover:bg-slate-700/50 transition"
      >
        <span v-if="themeStore.isDark">☀️</span>
        <span v-else>🌙</span>
      </button>
      <!-- Notifications -->
      <div class="relative">
        <button
          class="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
          aria-label="Notifications"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <!-- Notification Badge -->
          <span
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900"
          ></span>
        </button>
      </div>

      <!-- Divider (Hidden on small screens) -->
      <div class="hidden sm:block w-px h-8 bg-slate-700/50"></div>

      <!-- User Profile -->
      <button
        @click="goProfile"
        class="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
      >
        <div
          class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-slate-700 group-hover:ring-slate-600 transition-all"
        >

          <span class="text-black-to-br dark:text-white font-semibold text-sm">
            {{ username.charAt(0).toUpperCase() }}
          </span>
        </div>

        <!-- Username & Dropdown (Hidden on mobile) -->
        <div class="hidden lg:block text-left">
          <p class="text-black text-sm font-medium dark:text-white">{{ username }}</p>
          <p class="text-xs text-slate-400">View Profile</p>
        </div>

        <!-- Dropdown Icon (Hidden on mobile) -->
        <svg
          class="hidden lg:block w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
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
      </button>
    </div>
  </header>
</template>