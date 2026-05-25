<script setup lang="ts">
import { useRouter } from "vue-router";
import { useThemeStore } from "../../stores/theme";

useThemeStore();

const router = useRouter();

const go = (path: string) => {
  router.push(path);
};

// Card data with icons
const adminCards = [
  {
    title: "Role Management",
    subtitle: "",
    description: "",
    path: "/dev/RoleManage",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    stats: "",
  },
  {
    title: "User Management For Developer",
    subtitle: "",
    description: "",
    path: "/dev/userManage",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    stats: "",
  },
  
  {
    title: "LOG Mornitor",
    subtitle: "",
    description: "",
    path: "/dev/logMornitor",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M7.05 11.885c0 1.415-.548 2.206-1.524 2.206C4.548 14.09 4 13.3 4 11.885c0-1.412.548-2.203 1.526-2.203.976 0 1.524.79 1.524 2.203m-1.524-1.612c-.542 0-.832.563-.832 1.612q0 .133.006.252l1.559-1.143c-.126-.474-.375-.72-.733-.72zm-.732 2.508c.126.472.372.718.732.718.54 0 .83-.563.83-1.614q0-.129-.006-.25zm6.061.624V14h-3v-.595h1.181V10.5h-.05l-1.136.747v-.688l1.19-.786h.69v3.633z M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z",
    stats: "",
  }
];
</script>

<template>
  <div
    class="min-h-screen bg-gray-200 dark:bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3"
        >
          Developer Dashboard
        </h1>
        <p class="text-slate-400 text-lg">
          Preventive Maintenance Management System
        </p>

        <!-- Stats Overview -->
        <!-- <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div
            class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
          >
            <p class="text-slate-400 text-sm mb-1">Total Sites</p>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
            >
              404
            </p>
          </div>
          <div
            class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
          >
            <p class="text-slate-400 text-sm mb-1">Active</p>
            <p class="text-3xl font-bold text-green-400">387</p>
          </div>
          <div
            class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
          >
            <p class="text-slate-400 text-sm mb-1">Scheduled</p>
            <p class="text-3xl font-bold text-yellow-400">12</p>
          </div>
          <div
            class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
          >
            <p class="text-slate-400 text-sm mb-1">Completed</p>
            <p class="text-3xl font-bold text-purple-400">5</p>
          </div>
        </div> -->
      </div>

      <!-- Dev Cards Grid -->
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
          <div
            class="relative border-b border-gray-200 dark:border-slate-700/50 p-6"
          >
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
              <span class="text-slate-400 text-sm font-medium">{{
                card.stats
              }}</span>
            </div>

            <div
              class="flex items-center gap-2 dark:text-blue-400 group-hover:text-blue-300 transition-colors"
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
            class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            :class="`ring-1 ring-inset ${card.gradient
              .replace('from-', 'ring-')
              .replace(' to-', '/30 ring-')}`"
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
  }
  to {
    opacity: 1;
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
