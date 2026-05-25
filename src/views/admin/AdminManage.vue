<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const go = (path: string) => {
  router.push(path);
};

// Card data with icons
const adminCards = [
  {
    title: "User Management",
    subtitle: "",
    description: "",
    path: "/admin/userManage",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    stats: "",
  },
  // {
  //   title: "Permission Management",
  //   subtitle: "",
  //   description: "",
  //   path: "/dev/permissionManage",
  //   gradient: "from-blue-500 to-cyan-500",
  //   icon: "M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  //   stats: "",
  // },
  {
    title: "Title PM Management",
    subtitle: "",
    description: "",
    path: "/admin/TitleManagement",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    stats: "",
  },
  {
    title: "User Location DashBoard",
    subtitle: "",
    description: "",
    path: "/admin/UserlocationDashboard",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
    stats: "",
  }
];
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3"
        >
          Admin Dashboard
        </h1>
        <p class="text-gray-600 dark:text-slate-400 text-lg">
          Preventive Maintenance Management System
        </p>

        <!-- Stats Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div
            class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <p class="text-gray-500 dark:text-slate-400 text-sm mb-1">Total Sites</p>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400"
            >
              404
            </p>
          </div>
          <div
            class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <p class="text-gray-500 dark:text-slate-400 text-sm mb-1">Active</p>
            <p class="text-3xl font-bold text-green-500 dark:text-green-400">387</p>
          </div>
          <div
            class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <p class="text-gray-500 dark:text-slate-400 text-sm mb-1">Scheduled</p>
            <p class="text-3xl font-bold text-yellow-500 dark:text-yellow-400">12</p>
          </div>
          <div
            class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <p class="text-gray-500 dark:text-slate-400 text-sm mb-1">Completed</p>
            <p class="text-3xl font-bold text-purple-500 dark:text-purple-400">5</p>
          </div>
        </div>
      </div>

      <!-- PM Cards Grid -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up"
      >
        <div
          v-for="(card, index) in adminCards"
          :key="index"
          @click="go(card.path)"
          class="group relative bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 dark:hover:border-blue-500/40 cursor-pointer"
        >
          <!-- Gradient Overlay -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300"
            :class="`bg-gradient-to-br ${card.gradient}`"
          ></div>

          <!-- Card Header -->
          <div class="relative border-b border-gray-200 dark:border-slate-700/50 p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2
                  class="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all"
                  :class="`group-hover:${card.gradient}`"
                >
                  {{ card.title }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400 mb-3">
                  {{ card.subtitle }}
                </p>
                <p class="text-gray-700 dark:text-slate-300 text-sm">
                  {{ card.description }}
                </p>
              </div>

              <!-- Icon -->
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                :class="`bg-gradient-to-br ${card.gradient}`"
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
          </div>

          <!-- Card Footer -->
          <div class="relative p-6 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
              ></div>
              <span class="text-gray-600 dark:text-slate-400 text-sm font-medium">
                {{ card.stats }}
              </span>
            </div>

            <div
              class="flex items-center gap-2 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors"
            >
              <span class="text-sm font-medium">View Details</span>
              <svg
                class="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          <!-- Hover Effect Border -->
          <div
            class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-inset ring-blue-400/30 dark:ring-blue-500/30"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out 0.2s both;
}
</style>