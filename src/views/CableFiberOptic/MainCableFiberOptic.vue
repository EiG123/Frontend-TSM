<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useThemeStore } from "../../stores/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const username = computed(() => authStore.user?.username || "User");


const goToCableFiberOpticUpload = () =>
  router.push({
    path: `/CableFiberOpticUpload`,
  });

const goToCableFiberOpticViews = () =>
  router.push({
    path: `/CableFiberOpticViews`,
  });


const cards = [
  {
    id: 11,
    title: "Cable Fiber Optic",
    value: "",
    icon: "M8 0a.5.5 0 0 1 .473.337L9.046 2H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.85l1.323 3.837a.5.5 0 1 1-.946.326L11.092 11H8.5v3a.5.5 0 0 1-1 0v-3H4.908l-1.435 4.163a.5.5 0 1 1-.946-.326L3.85 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4.954L7.527.337A.5.5 0 0 1 8 0M2 3v7h12V3z",
    color: "from-red-500 to-blue-600",
    onclick: goToCableFiberOpticUpload,
  },
  {
    id: 12,
    title: "Cable Fiber Optic Views",
    value: "",
    icon: "M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.5.5 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.5.5 0 0 0-.196 0zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1z",
    color: "from-red-500 to-blue-600",
    onclick: goToCableFiberOpticViews,
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors duration-300"
  >
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Welcome,
        <span
          class="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent"
        >
          {{ username }}
        </span>
        👋
      </h1>
    </div>

    <!-- Big Image Container -->
    <div class="container mb-8">
      <div
        class="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl group"
      >
        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 z-10"
        ></div>

        <!-- Background -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
        >
          <div
            class="absolute inset-0 opacity-10"
            style="
              background-image: radial-gradient(
                circle at 2px 2px,
                rgb(100 116 139) 1px,
                transparent 0
              );
              background-size: 40px 40px;
            "
          ></div>
        </div>

        <!-- Content -->
        <div
          class="relative z-20 h-full flex flex-col items-center justify-center p-8 text-center"
        >
          <h2 class="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Dashboard
          </h2>
          <p class="text-slate-500 dark:text-slate-300 text-lg max-w-2xl mb-6">
            Details
          </p>
        </div>

        <!-- Decorative -->
        <div
          class="absolute top-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
        ></div>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="card in cards"
        :key="card.id"
        @click="card.onclick"
        class="bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4">
          <div
            :class="`w-14 h-14 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`"
          >
            <svg
              class="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="card.icon"
              />
            </svg>
          </div>
        </div>

        <!-- Card Content -->
        <div>
          <h3
            class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2"
          >
            {{ card.title }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>