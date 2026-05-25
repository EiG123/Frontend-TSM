<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPmList } from "../../services/pm_nodeb_list.api";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import { useAuthStore } from "../../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const props = defineProps<{
  pmId: string;
}>();

const pmId = computed(() => props.pmId);

const loading = ref(false);
const pMsiteData = ref<any>(null);
const showModules = ref(true);

const hide = () => {
  showModules.value = !showModules.value;
};

const goBack = () => {
  router.back();
};

const goEdit = () => {
  router.push(`/pm_nodeb_edit/${pmId.value}`);
};

const handleDelete = async () => {
  const confirmed = window.confirm("คุณต้องการลบ PM นี้ใช่หรือไม่?");
  if (!confirmed) return;

  loading.value = true;

  try {
    await pmServiceManage.deletePmById(pmId.value);
    router.push(`/pm_nodeb`);
  } catch (error) {
    alert("ไม่สามารถลบข้อมูลได้");
  } finally {
    loading.value = false;
  }
};

const userId = authStore.userId;

const isCheckedIn = ref(false);
const checkInTime = ref<string | null>(null);
const checkOutTime = ref<string | null>(null);

const service_status = ref("");

const cabinets = ref([]);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await getPmList.getPmById(pmId.value);
    console.log(res.data.data);
    if (res.data.data.progress_status === "checkedin") {
      isCheckedIn.value = true;
      const cabinet = await pmServiceManage.getPmCabinetById(pmId.value);
      console.log(cabinet);
      cabinets.value = cabinet.data.result.cabinets;
      console.log(cabinets.value);
    } else if (res.data.data.status === "checkout") {
      isCheckedIn.value = false;
      const cabinet = await pmServiceManage.getPmCabinetById(pmId.value);
      cabinets.value = cabinet.data.result.cabinets;
      console.log(cabinets.value);
    }
    pMsiteData.value = res.data.data;
    service_status.value = res.data.data.service_status;
  } catch (error) {
    console.error("Failed to load PM data:", error);
    alert("ไม่เจอ API SiteList");
  } finally {
    loading.value = false;
  }
});

// Navigation functions
const navigations = [
  {
    name: "Summary",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    action: () => router.push(`/pm_site_detail/${pmId.value}`),
  },
  {
    name: "Site Data",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    action: () => router.push(`/pm_site_detail_site_data/${pmId.value}`),
  },
  {
    name: "Cabinets",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    name: "Problems",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    action: () => alert("Go to ProblemsPage"),
  },
  {
    name: "Audit",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    action: () => alert("Go to AuditPage"),
  },
];

const AddCabinets = () => {
  router.push({
    name: "pm_add_cabinet",
    query: {
      pmId: pmId.value,
    },
  });
};

const handleCabinetDetail = (cabinets_id: any) => {
  router.push({
    name: "pm_cabinet_detail_page",
    query: {
      cabinet_id: cabinets_id,
    },
  });
};

const handleCabinet = (cabinet_id: any) => {
  alert(cabinet_id);
};

const handleCabinetDelete = async (cabinet_id: any) => {
  loading.value = true;
  try {
    await pmServiceManage.deleteCabinet({
      cabinet_id,
    });
    router.go;
  } catch (error) {
    console.log("Cabinet Delete Log ERROR: ", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-slate-900 from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
  >
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center h-96 animate-fade-in"
    >
      <div
        class="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-slate-400 text-lg">Loading site details...</p>
    </div>

    <!-- Main Content -->
    <div
      v-else-if="pMsiteData"
      class="max-w-7xl mx-auto space-y-6 animate-slide-up"
    >
      <!-- Back Button -->
      <button
        @click="goBack"
        class="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-200 mb-4"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">Back to List</span>
      </button>

      <!-- Header Section -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div
            class="absolute inset-0"
          ></div>

          <div class="relative px-8 py-6">
            <div
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h1
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
                >
                  {{ pMsiteData.site_name }}
                </h1>
                <div class="flex items-center gap-3 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-slate-400">Round:</span>
                    <span
                      class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold border border-blue-500/30"
                    >
                      {{ pMsiteData.round }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div
                      class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                    ></div>
                    <span class="text-xs text-green-400">{{
                      pMsiteData.service_status
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="goEdit"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/20 dark:hover:bg-blue-500/25 hover:border-blue-500/50 text-blue-600 dark:text-blue-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  @click="handleDelete"
                    class="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 hover:bg-red-500/20 dark:hover:bg-red-500/25 hover:border-red-500/50 text-red-600 dark:text-red-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-x-auto"
      >
        <div class="flex gap-2 p-4">
          <button
            v-for="nav in navigations"
            :key="nav.name"
            @click="nav.action"
            class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-700/30 hover:bg-slate-700/50 border dark:border-slate-600/30 hover:border-blue-500/40 dark:text-slate-300 hover:text-blue-300 rounded-xl font-medium transition-all duration-200 whitespace-nowrap"
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
                :d="nav.icon"
              />
            </svg>
            {{ nav.name }}
          </button>
        </div>
      </div>

      <!-- Cabinets Section -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <!-- Header -->
        <div
          @click="hide"
          class="flex items-center justify-between px-8 py-6 cursor-pointer hover:bg-slate-800/60 transition-all duration-200 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-200">Cabinets</h2>
              <p class="text-sm text-slate-400">
                {{ cabinets.length }} cabinet{{
                  cabinets.length !== 1 ? "s" : ""
                }}
              </p>
            </div>
          </div>

          <button
            class="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
          >
            {{ showModules ? "Hide" : "Show" }}
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': !showModules }"
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

        <!-- Content -->
        <div v-if="showModules" class="p-6">
          <!-- Add Cabinet Button (Always show at top) -->
          <div 
          v-if="isCheckedIn"
          class="mb-4">
            <button
              @click="AddCabinets"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200 hover:-translate-y-0.5"
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
              Add Cabinet
            </button>
          </div>

          <!-- Cabinets List -->
          <div v-if="cabinets.length > 0" class="space-y-4">
            <div
              v-for="(cab, index) in cabinets"
              :key="index"
              class="group bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
            >
              <!-- Cabinet Header -->
              <div
                class="px-6 py-4 bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-b border-slate-700/50 cursor-pointer hover:from-slate-800/80 hover:to-slate-900/80 transition-all"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                      <span class="text-white font-bold text-lg">{{
                        index + 1
                      }}</span>
                    </div>
                    <div>
                      <h3
                        class="text-lg font-semibold text-slate-200 group-hover:text-blue-300 transition-colors"
                      >
                        {{ cab.cabinet_name || `Cabinet ${index + 1}` }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <svg
                          class="w-4 h-4 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        <span class="text-sm text-slate-400"
                          >Network:
                          <span class="text-blue-400 font-medium">{{
                            cab.cabinet_network || "N/A"
                          }}</span></span
                        >
                      </div>
                    </div>
                  </div>

                  <div @click="handleCabinetDetail(cab.id)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#ffffff"
                      class="icon icon-tabler icons-tabler-filled icon-tabler-device-desktop"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M7 21a1 1 0 0 1 0 -2h1v-2h-4a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-4v2h1a1 1 0 0 1 0 2zm7 -4h-4v2h4z"
                      />
                    </svg>
                  </div>

                  <div @click="handleCabinet(cab.id)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-edit"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"
                      />
                      <path
                        d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415"
                      />
                      <path d="M16 5l3 3" />
                    </svg>
                  </div>

                  <div @click="handleCabinetDelete(cab.id)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 7l16 0" />
                      <path d="M10 11l0 6" />
                      <path d="M14 11l0 6" />
                      <path
                        d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"
                      />
                      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                  </div>

                  <svg
                    class="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors"
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

              <!-- Cabinet Stats Grid -->
              <div class="p-6">
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <!-- Rectifiers -->
                  <div
                    class="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-green-500/40 transition-all"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span class="text-2xl font-bold text-green-400">{{
                        cab.rectifier_count
                      }}</span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium">Rectifiers</p>
                  </div>

                  <!-- Batteries -->
                  <div
                    class="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/40 transition-all"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span class="text-2xl font-bold text-blue-400">{{
                        cab.batteries?.length || 0
                      }}</span>
                    </div>
                    <p
                      v-if="cab.batteries[0]?.battery_type"
                      class="text-xs text-slate-400 font-medium"
                    >
                      {{ cab.batteries[0].battery_type }}
                    </p>
                  </div>

                  <!-- Site Grade -->
                  <div
                    class="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-purple-500/40 transition-all"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span class="text-2xl font-bold text-purple-400">{{
                        cab.site_grad || "N/A"
                      }}</span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium">Site Grade</p>
                  </div>

                  <!-- Problems -->
                  <div
                    class="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-yellow-500/40 transition-all cursor-pointer"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span class="text-2xl font-bold text-yellow-400">{{
                        cab.problems?.length || 0
                      }}</span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium">Problems</p>
                  </div>

                  <!-- Audit -->
                  <div
                    class="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-orange-500/40 transition-all cursor-pointer"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <span class="text-2xl font-bold text-orange-400">•</span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium">
                      Audit (RNSA)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Cabinets -->
          <div
            v-else
            class="border-2 border-dashed border-slate-700/50 rounded-xl p-12 hover:border-blue-500/40 transition-all"
          >
            <div class="text-center">
              <div
                class="w-20 h-20 dark:bg-slate-800/50 border rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-10 h-10 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-300 mb-2">
                No Cabinets Yet
              </h3>
              <p class="text-slate-400 text-sm mb-4">
                Get started by adding your first cabinet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div
      v-else
      class="flex flex-col items-center justify-center h-96 animate-fade-in"
    >
      <svg
        class="w-20 h-20 text-slate-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-slate-400 text-lg font-medium">No data available</p>
      <p class="text-slate-500 text-sm mt-2">Unable to load site information</p>
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