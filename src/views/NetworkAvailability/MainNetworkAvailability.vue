<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useThemeStore } from "../../stores/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const username = computed(() => authStore.user?.username || "User");

const goPM = () => router.push("/PM");
const goCableSlack = () => router.push("/CableSlack");
const goTxTtoExcel = () => router.push("/txt_to_excel");
const goNetworkAvailability = () =>
  router.push("/network_availability_dashboard");

const goNetworkAvailabilitySitesAVAUpload = () => {
  router.push("/network_availability_upload_sites_ava");
};

const goNetworkIncidentTicketSitesAVAUpload = () => {
  router.push("/network_availability_upload_incident_ticket");
};

const goNetworkAVASitesAVAandIncident = () => {
  router.push("/network_availability_sites_and_incident");
};

const goNetworkAVASitesAVAandIncidentALL = () => {
  router.push("/network_availability_sites_and_incident_ALL");
};

const goToTop100NetworkAVA = () => {
  router.push({
    path: `/Top100NetworkAVA`,
  });
};

const cards = [
  {
    id: 6,
    title: "Network Availability",
    value: "",
    icon: "📈",
    color: "from-pink-500 to-pink-600",
    onclick: goNetworkAvailability,
  },
  {
    id: 7,
    title: "Network Availability Sites AVA Upload",
    value: "",
    icon: "M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z",
    color: "from-red-500 to-blue-600",
    onclick: goNetworkAvailabilitySitesAVAUpload,
  },
  {
    id: 8,
    title: "Incident Ticket Upload",
    value: "",
    icon: "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z",
    color: "from-red-500 to-blue-600",
    onclick: goNetworkIncidentTicketSitesAVAUpload,
  },
  {
    id: 9,
    title: "NetWork AVA Site AVA and Incident DashBoard",
    value: "",
    icon: "M8 0a.5.5 0 0 1 .473.337L9.046 2H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.85l1.323 3.837a.5.5 0 1 1-.946.326L11.092 11H8.5v3a.5.5 0 0 1-1 0v-3H4.908l-1.435 4.163a.5.5 0 1 1-.946-.326L3.85 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4.954L7.527.337A.5.5 0 0 1 8 0M2 3v7h12V3z",
    color: "from-red-500 to-blue-600",
    onclick: goNetworkAVASitesAVAandIncident,
  },
  {
    id: 10,
    title: "NetWork AVA Site AVA and Incident DashBoard ALL",
    value: "",
    icon: "M8 0a.5.5 0 0 1 .473.337L9.046 2H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.85l1.323 3.837a.5.5 0 1 1-.946.326L11.092 11H8.5v3a.5.5 0 0 1-1 0v-3H4.908l-1.435 4.163a.5.5 0 1 1-.946-.326L3.85 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4.954L7.527.337A.5.5 0 0 1 8 0M2 3v7h12V3z",
    color: "from-red-500 to-blue-600",
    onclick: goNetworkAVASitesAVAandIncidentALL,
  },
  {
    id: 14,
    title: "Top 100 NetWork AVA",
    value: "",
    icon: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6",
    color: "from-red-500 to-blue-600",
    onclick: goToTop100NetworkAVA,
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