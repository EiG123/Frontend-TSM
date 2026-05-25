<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, compile, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPmList } from "../../services/pm_nodeb_list.api";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import { pmTitleManage } from "../../services/PmTitle/pmTitleManage.api";

import { useAuthStore } from "../../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const props = defineProps<{
  pmId: string;
  type: string;
}>();

const pmId = computed(() => props.pmId);
const type = computed(() => props.type);

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

const title_info = ref("");

const handleCheckInOut = async () => {
  if (!isCheckedIn.value) {
    const confirmed = window.confirm(
      "คุณต้องการ Check in เพื่อเริ่มบันทึกผล PM ใช่หรือไม่?"
    );
    if (!confirmed) return;

    loading.value = true;

    try {
      await pmServiceManage.checkIn(pmId.value, userId);
      isCheckedIn.value = true;
      checkInTime.value = new Date().toLocaleString("th-TH");
      checkOutTime.value = null;
      alert("Check in สำเร็จ! เริ่มบันทึกผล PM ได้แล้ว");
    } catch (error) {
      console.error("Check in failed:", error);
      alert("ไม่สามารถ Check in ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      loading.value = false;
    }
  } else {
    const confirmed = window.confirm("คุณต้องการ Check out ใช่หรือไม่?");
    if (!confirmed) return;

    loading.value = true;

    try {
      await pmServiceManage.checkOut(pmId.value, userId);
      checkOutTime.value = new Date().toLocaleString("th-TH");
      alert("Check out สำเร็จ! บันทึกเวลาเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Check out failed:", error);
      alert("ไม่สามารถ Check out ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      loading.value = false;
    }
  }
};

const loadData_init = async () => {
  const res = await getPmList.getPmById(pmId.value);
  if (res.data.data.status === "checkin") {
    isCheckedIn.value = true;
  } else if (res.data.data.status === "checkout") {
    isCheckedIn.value = false;
  }
  pMsiteData.value = res.data.data;
  service_status.value = res.data.data.service_status;
};

const loadData_Title = async () => {
  title_info.value = await pmTitleManage.getAllTitleInfo({
    type: "pm_nodeb",
    pm_id: pmId.value,
  });
  console.log(title_info.value);
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadData_init();
    await loadData_Title();
  } catch (error) {
    console.error("Failed to load PM data:", error);
    alert("ไม่เจอ API SiteList");
  } finally {
    loading.value = false;
  }
});

// Navigation functions
const activeTab = ref("Site Data");
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
    action: () =>
      router.push({
        name: `pm_cabinet_page`,
        query: {
          pmId: pmId.value,
        },
      }),
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

// Site Data Sections with navigation routes
const sections = [
  {
    id: "site-info",
    title: "Site Info",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "blue",
    route: {
      name: `pm_site_detail_site_data_data`,
      query: {
        id: pmId.value,
        key: "site_info",
      },
    },
    count: 0,
    key: "site_info",
  },
  {
    id: "site-facility",
    title: "Site Facility",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "green",
    route: {
      name: "pm_site_detail_site_data_data",
      query: {
        id: pmId.value,
        key: "site_facility",
      },
    },
    count: 0,
    key: "site_facility",
  },
  {
    id: "ac-power",
    title: "AC Power",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "yellow",
    route: {
      name: "pm_site_detail_site_data_data",
      query: {
        pmId: pmId.value,
        key: "ac_power",
        type: type.value,
      },
    },
    count: pMsiteData.value?.kwh_meters?.length || 0,
  },
  {
    id: "generator",
    title: "Generator",
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    color: "purple",
    route: {
      name: "pm_site_detail_site_data_data",
      query: {
        id: pmId.value,
        key: "generator",
      },
    },
    count: pMsiteData.value?.generators?.length || 0,
    key: "generator",
  },
  {
    id: "grounding",
    title: "Grounding System",
    icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
    color: "orange",
    route: {
      name: "pm_site_detail_site_data_data",
      query: {
        id: pmId.value,
        key: "grounding",
      },
    },
    count: 0,
    key: "grounding",
  },
  {
    id: "external-alarm",
    title: "External Alarm (Before)",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    color: "red",
    route: {
      name: "pm_site_detail_site_data_data",
      query: {
        id: pmId.value,
        key: "external_alarm",
      },
    },
    count: 0,
    key: "external_alarm",
  },
];

// Handle section click
const handleSectionClick = (section: any) => {
  router.push(section.route);
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center h-96 animate-fade-in"
    >
      <div
        class="w-16 h-16 border-4 border-slate-500/30 border-t-slate-500 rounded-full animate-spin mb-4"
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
        class="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div class="absolute inset-0 dark:bg-slate-900"></div>

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
                      service_status
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
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-x-auto"
      >
        <div class="flex gap-2 p-4">
          <button
            v-for="nav in navigations"
            :key="nav.name"
            @click="nav.action"
            :class="[
              'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              nav.name === activeTab
                ? 'dark:bg-blue-500/20 border-2 border-blue-500/50 dark:text-blue-300 shadow-lg shadow-blue-500/20'
                : 'dark:bg-slate-700/30 hover:bg-slate-700/50 border dark:border-slate-600/30 hover:border-blue-500/40 dark:text-slate-300 hover:text-blue-300',
            ]"
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

      <!-- Site Data Sections - Clickable Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="section in sections"
          :key="section.id"
          @click="handleSectionClick(section)"
          class="group dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40"
        >
          <!-- Card Content -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div
                :class="[
                  'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110',
                  `bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 shadow-${section.color}-500/30`,
                ]"
              >
                <svg
                  class="w-7 h-7 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="section.icon"
                  />
                </svg>
              </div>

              <!-- Arrow Icon -->
              <div
                class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg
                  class="w-5 h-5 text-slate-300"
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

            <div>
              <h3
                class="text-xl font-semibold dark:text-slate-200 mb-1 group-hover:text-blue-300 transition-colors"
              >
                {{ section.title }}
              </h3>
              <p class="text-sm text-slate-400">Click to view details</p>
            </div>

            <!-- Count Badge (if applicable) -->
            <div
              v-if="section.count >= 0"
              class="mt-4 pt-4 border-t border-slate-700/50"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-400">Items</span>
                <span
                  :class="`px-3 py-1 bg-${section.color}-500/20 border border-${section.color}-500/30 rounded-lg text-${section.color}-300 text-sm font-bold`"
                >
                  <div>
                    {{
                      title_info.find((item) => item.key === section.key)
                        ?.total_detail || 0
                    }}
                    /
                    {{
                      title_info.find((item) => item.key === section.key)
                        ?.total_status || 0
                    }}
                  </div>
                </span>
              </div>
            </div>
          </div>

          <!-- Hover Effect Border -->
          <div
            class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            :class="`ring-1 ring-inset ring-${section.color}-500/30`"
          ></div>
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