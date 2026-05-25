<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const username = computed(() => authStore.user?.username || "User");

const goPM = () => router.push("/PM");
const goCableSlack = () => router.push("/CableSlack");
const goTxTtoExcel = () => router.push("/txt_to_excel");

const goToImprovement = () =>
  router.push({
    name: `Site_Improvement`,
    query: {
      region: authStore.userRegion,
    },
  });

const goToCableFiberOptic = () =>
  router.push({
    path: `/CableFiberOpticUpload`,
  });

const goToCableFiberOpticViews = () =>
  router.push({
    path: `/CableFiberOpticViews`,
  });

const goToSitesLocationView = () =>
  router.push({
    path: `/siteLocationView`,
  });

const goToMainNetworkAVA = () =>
  router.push({
    path: `/MainNetworkAVA`,
  });

const goToMainCableOpticFiber = () =>
  router.push({
    path: `/MainCableOpticFiber`,
  });

const cards = [
  {
    id: 1,
    title: "PM",
    value: "",
    icon: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
    color: "from-blue-500 to-blue-600",
    onclick: goPM,
  },
  {
    id: 2,
    title: "เก็บตกยกสาย",
    value: "",
    icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z",
    color: "from-purple-500 to-purple-600",
    onclick: goCableSlack,
  },
  {
    id: 3,
    title: "TxT To Excel",
    value: "",
    icon: "✅",
    color: "from-green-500 to-green-600",
    onclick: goTxTtoExcel,
  },
  {
    id: 4,
    title: "Improvement Site",
    value: "",
    icon: "👥",
    color: "from-orange-500 to-orange-600",
    onclick: goToImprovement,
  },
  {
    id: 13,
    title: "Sites Location Views",
    value: "",
    icon: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6",
    color: "from-red-500 to-blue-600",
    onclick: goToSitesLocationView,
  },
  {
    id: 14,
    title: "Network AVA",
    value: "",
    icon: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6",
    color: "from-red-500 to-blue-600",
    onclick: goToMainNetworkAVA,
  },
  {
    id: 15,
    title: "Cable Optic Fiber",
    value: "",
    icon: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6",
    color: "from-red-500 to-blue-600",
    onclick: goToMainCableOpticFiber,
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