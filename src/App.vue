<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme"; // ✅ เพิ่ม
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore(); // ✅ เพิ่ม — init store ที่นี่เลย
const isMobileMenuOpen = ref(false);

onMounted(() => {
  authStore.initAuth();
});

const isLoggedIn = computed(() => authStore.isAuthenticated);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <!-- ✅ ลบ bg ออกจากตรงนี้ ให้แต่ละหน้าจัดการเอง -->
  <div class="min-h-screen bg-white dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 transition-colors duration-300">
    <div
      v-if="isLoggedIn && isMobileMenuOpen"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
    ></div>

    <Sidebar v-if="isLoggedIn" :is-open="isMobileMenuOpen" @close="closeMobileMenu" />
    <Header v-if="isLoggedIn" :on-menu-click="toggleMobileMenu" />

    <main :class="[isLoggedIn ? 'md:ml-64 md:pt-16 pt-16 p-4 md:p-6' : '', 'min-h-screen']">
      <router-view />
    </main>
  </div>
</template>