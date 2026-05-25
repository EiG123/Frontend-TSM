<script setup lang="ts">
import { useRouter } from "vue-router";
import { useThemeStore } from "../stores/theme";

const themeStore = useThemeStore();

const router = useRouter();

const go = (path: string) => {
  router.push(path);
};

// Card data with icons
const pmCards = [
  {
    title: "PM DashBoard",
    subtitle: "PM",
    description: "DashBoard",
    action: () =>
      router.push({
        path: `/pmDashBoardAI`,
      }),
    gradient: "from-red-500 to-blue-500",
    icon: "M20 14H4m6.5 3L8 20m5.5-3 2.5 3M4.88889 17H19.1111c.4909 0 .8889-.4157.8889-.9286V4.92857C20 4.41574 19.602 4 19.1111 4H4.88889C4.39797 4 4 4.41574 4 4.92857V16.0714c0 .5129.39797.9286.88889.9286ZM13 14v-3h4v3h-4Z",
    stats: "",
  },
  {
    title: "PM NodeB",
    subtitle: "NodeB",
    description: "Mobile NodeB",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "pm_nodeb",
        },
      }),
    gradient: "from-blue-500 to-cyan-500",
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    stats: "",
  },
  {
    title: "PM Small Exchange",
    subtitle: "AN / PN / DN",
    description: "CX-Node",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "pm_small",
        },
      }),
    gradient: "from-purple-500 to-pink-500",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    stats: "",
  },
  {
    title: "PM Medium Exchange",
    subtitle: "RN / AGN Node",
    description: "TOC Node",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "pm_medium",
        },
      }),
    gradient: "from-green-500 to-emerald-500",
    icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
    stats: "",
  },
  {
    title: "PM Broadband",
    subtitle: "OLT Indoor / Outdoor",
    description: "NodeB / DSLAM / TVS",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "pm_broadband",
        },
      }),
    gradient: "from-orange-500 to-red-500",
    icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",
    stats: "",
  },
  {
    title: "Mowing",
    subtitle: "ตัดหญ้า NodeB / PN / DN",
    description: "Lawn Maintenance",
    path: "/mowing",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "pm_mowing",
        },
      }),
    gradient: "from-lime-500 to-green-500",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    stats: "",
  },
  {
    title: "PM Solar Cell",
    subtitle: "Solar Cell NodeB",
    description: "Mobile NodeB",
    action: () =>
      router.push({
        name: `pm_page`,
        query: {
          type: "/pm_solar",
        },
      }),
    gradient: "from-yellow-500 to-orange-500",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
    stats: "",
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3"
        >
          PM Dashboard
        </h1>
        <p class="text-slate-400 text-lg">
          Preventive Maintenance Management System
        </p>

        <!-- Stats Overview -->
        <!-- <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <p class="text-slate-400 text-sm mb-1">Total Sites</p>
            <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">404</p>
          </div>
          <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <p class="text-slate-400 text-sm mb-1">Active</p>
            <p class="text-3xl font-bold text-green-400">387</p>
          </div>
          <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <p class="text-slate-400 text-sm mb-1">Scheduled</p>
            <p class="text-3xl font-bold text-yellow-400">12</p>
          </div>
          <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <p class="text-slate-400 text-sm mb-1">Completed</p>
            <p class="text-3xl font-bold text-purple-400">5</p>
          </div>
        </div> -->
      </div>

      <!-- PM Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(card, index) in pmCards"
          :key="index"
          @click="card.action"
          class="group bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500/40"
        >
          <!-- Gradient Overlay -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            :class="`bg-gradient-to-br ${card.gradient}`"
          ></div>

          <!-- Card Header -->
          <div
            class="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-gray-200 dark:border-slate-700/50 px-6 py-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h2
                  class="text-gray-800 dark:text-slate-300 font-semibold text-lg"
                  :class="`group-hover:${card.gradient}`"
                >
                  {{ card.title }}
                </h2>
                <p class="text-gray-500 dark:text-slate-500 text-xs font-mono">
                  {{ card.subtitle }}
                </p>
                <p class="text-gray-400 dark:text-slate-400 text-xs font-mono">
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

      <!-- Quick Actions -->
      <!-- <div
        class="mt-8 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 animate-fade-in"
      >
        <h3 class="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            class="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 hover:text-white transition-all duration-200"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span class="text-sm font-medium">New PM</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 hover:text-white transition-all duration-200"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span class="text-sm font-medium">Reports</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 hover:text-white transition-all duration-200"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="text-sm font-medium">Schedule</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 hover:text-white transition-all duration-200"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div> -->
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