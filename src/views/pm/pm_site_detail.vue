<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPmList } from "../../services/pm_nodeb_list.api";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import { UserLocation } from "../../services/user/UserLoaction.api";
import { useAuthStore } from "../../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

const props = defineProps<{
  pmId: string;
  type: string;
}>();

const pmId = computed(() => props.pmId);
const type = computed(() => props.type);

const loading = ref(false);
const pMsiteData = ref<any>(null);
const showModules = ref(true);

// ─── Unified Work State ───────────────────────────────────────────
type WorkState = "pending" | "Inprogress" | "checkedin" | "checkedout";
const workState = ref<WorkState>("pending");

const startWorkTime = ref<string | null>(null);
const checkInTime = ref<string | null>(null);
const checkOutTime = ref<string | null>(null);

// ─── GPS Tracking ─────────────────────────────────────────────────
let watchId: number;
let intervalId: any;
const currentLocation = ref<Record<string, any>>({});
const progress_status = ref();

const watchPosition = () => {
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      currentLocation.value = {
        pmId: pmId.value,
        userId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        status: "active",
        job: pMsiteData.value.site_name,
        progress_status: progress_status.value,
      };
    },
    (err) => console.error(err),
    { enableHighAccuracy: true }
  );
};

const startHeartbeat = () => {
  intervalId = setInterval(async () => {
    if (!currentLocation.value?.lat) return;
    await UserLocation.sendLocation(currentLocation.value);
  }, 10000);
};

const stopGPS = async () => {
  navigator.geolocation.clearWatch(watchId);
  clearInterval(intervalId);
  await UserLocation.sendLocation({ userId, status: "inactive", job: "0" });
};

// ─── Main Action Handler ──────────────────────────────────────────
const handleMainAction = async () => {
  if (workState.value === "pending") {
    const confirmed = window.confirm(
      "เริ่มออกงานและเปิด GPS Tracking ใช่หรือไม่?"
    );
    if (!confirmed) return;

    loading.value = true;
    try {
      // ส่ง progress_status ไป DB ก่อน
      await pmServiceManage.updateProgressStatus({
        pmId: pmId.value,
        userId,
        progress_status: "Inprogress",
      });
      startWorkTime.value = formatDate(new Date().toISOString());
      progress_status.value = "Inprogress";
      workState.value = "Inprogress"; // ✅ sync UI
      watchPosition();
      startHeartbeat();
    } catch {
      alert("ไม่สามารถเริ่มงานได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      loading.value = false;
    }
  } else if (workState.value === "Inprogress") {
    const confirmed = window.confirm(
      "Check in เพื่อเริ่มบันทึกผล PM ใช่หรือไม่?"
    );
    if (!confirmed) return;

    loading.value = true;
    try {
      await pmServiceManage.updateProgressStatus({
        pmId: pmId.value,
        userId,
        progress_status: "checkedin",
      });
      await pmServiceManage.checkIn(pmId.value, userId);
      checkInTime.value = formatDate(new Date().toISOString());
      progress_status.value = "checkedin";
      workState.value = "checkedin"; // ✅ sync UI
      console.log(workState.value);
      console.log(progress_status.value);
      alert("Check in สำเร็จ! เริ่มบันทึกผล PM ได้แล้ว");
      await loadState();
    } catch {
      alert("ไม่สามารถ Check in ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      loading.value = false;
    }
  } else if (workState.value === "checkedin") {
    const confirmed = window.confirm(
      "Check out และหยุด GPS Tracking ใช่หรือไม่?"
    );
    if (!confirmed) return;

    loading.value = true;
    try {
      await pmServiceManage.updateProgressStatus({
        pmId: pmId.value,
        userId,
        progress_status: "checkout",
      });
      await pmServiceManage.checkOut(pmId.value, userId);
      checkOutTime.value = formatDate(new Date().toISOString());
      progress_status.value = "checkedout";
      workState.value = "checkedout"; // ✅ sync UI
      await stopGPS();
      alert("Check out สำเร็จ! บันทึกเวลาเรียบร้อยแล้ว");
      window.location.reload();
    } catch {
      alert("ไม่สามารถ Check out ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      loading.value = false;
    }
  }
};

// ─── Computed UI ──────────────────────────────────────────────────
const stateConfig = computed(() => {
  const configs = {
    pending: {
      iconColor: "from-blue-500 to-blue-600 shadow-blue-500/30",
      title: "Ready to Start",
      description: "กด Start Work เพื่อเริ่มออกงานและเปิด GPS",
      btnColor:
        "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30",
      btnLabel: "Start Work",
      statusBar: null,
    },
    Inprogress: {
      iconColor: "from-amber-500 to-orange-500 shadow-amber-500/30",
      title: "On The Way",
      description: "GPS กำลัง Track ตำแหน่ง — กด Check In เมื่อถึงหน้างาน",
      btnColor:
        "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30",
      btnLabel: "Check In",
      statusBar: {
        bg: "bg-amber-500/10 border-amber-500/30",
        dot: "bg-amber-400",
        text: "text-amber-300",
        label: "GPS กำลัง Track ตำแหน่ง...",
      },
    },
    checkedin: {
      iconColor: "from-green-500 to-green-600 shadow-green-500/30",
      title: "In Progress",
      description: "กำลังทำงานอยู่ — บันทึกผล PM ได้เลย",
      btnColor:
        "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/30",
      btnLabel: "Check Out",
      statusBar: {
        bg: "bg-green-500/10 border-green-500/30",
        dot: "bg-green-500",
        text: "text-green-300",
        label: "กำลังบันทึกผล PM — GPS ยังทำงานอยู่",
      },
    },
    checkedout: {
      iconColor: "from-purple-500 to-purple-600 shadow-purple-500/30",
      title: "Work Completed",
      description: "บันทึกเวลาเรียบร้อย — GPS หยุดทำงานแล้ว",
      btnColor:
        "bg-purple-500/20 border border-purple-500/40 text-purple-300 cursor-not-allowed opacity-75",
      btnLabel: "Completed",
      statusBar: {
        bg: "bg-purple-500/10 border-purple-500/30",
        dot: null,
        text: "text-purple-300",
        label: "งานเสร็จสิ้น — GPS หยุดทำงานแล้ว",
      },
    },
  };
  return configs[workState.value];
});

const actionDisabled = computed(
  () => loading.value || workState.value === "checkedout"
);

const isCheckedIn = computed(() => workState.value === "checkedin");

// ─── Cabinets ─────────────────────────────────────────────────────
const cabinets = ref([]);

const AddCabinets = () =>
  router.push({ name: "pm_add_cabinet", query: { pmId: pmId.value } });

const handleCabinet = (cabinet_id: any) => {
  router.push({ name: "pm_cabinet_detail", params: { id: cabinet_id } });
};
const handleCabinetDelete = async (cabinet_id: any) => {
  if (!confirm("คุณต้องการ ลบ Cabinet ID:" + cabinet_id + "หรือไม่")) return;
  loading.value = true;
  try {
    await pmServiceManage.deleteCabinet({ cabinet_id });
    window.location.reload();
  } catch (error) {
    console.error("Cabinet Delete Error:", error);
  } finally {
    loading.value = false;
  }
};

// ─── Data / Nav / Utils ───────────────────────────────────────────
const hide = () => {
  showModules.value = !showModules.value;
};
const goBack = () => router.back();
const goEdit = () => router.push(`/pm_nodeb_edit/${pmId.value}`);

const handleDelete = async () => {
  if (!window.confirm("คุณต้องการลบ PM นี้ใช่หรือไม่?")) return;
  loading.value = true;
  try {
    await pmServiceManage.deletePmById(pmId.value);
    router.push(`/pm_nodeb`);
  } catch {
    alert("ไม่สามารถลบข้อมูลได้");
  } finally {
    loading.value = false;
  }
};

const loadState = async () => {
  if (progress_status.value === "pending") {
    workState.value = "pending";
  } else if (progress_status.value === "Inprogress") {
    workState.value = "Inprogress";
    watchPosition(); // ← resume GPS
    startHeartbeat(); // ← resume heartbeat
  } else if (progress_status.value === "checkedin") {
    // โหลดหน้าใหม่แล้ว state เป็น checkedin (ไม่มี GPS เพราะ page refresh)
    workState.value = "checkedin";
    const cabinet = await pmServiceManage.getPmCabinetById(pmId.value);
    cabinets.value = cabinet.data.result.cabinets;
  } else if (progress_status.value === "checkedout") {
    workState.value = "checkedout";
  }
};

const loadData = async () => {
  const res = await getPmList.getPmById(pmId.value);
  progress_status.value = res.data.data.progress_status;
  await loadState();
  pMsiteData.value = res.data.data;
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadData();
  } catch {
    alert("ไม่เจอ API SiteList");
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  // cleanup GPS ถ้า user ออกจากหน้าก่อน checkout
  if (workState.value === "Inprogress" || workState.value === "checkedin") {
    navigator.geolocation.clearWatch(watchId);
    clearInterval(intervalId);
  }
});

const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
};

const navigations = [
  {
    name: "Summary",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    action: () =>
      router.push({
        name: `pm_cabinet_page`,
        query: {
          pmId: pmId.value,
          type: type.value,
        },
      }),
  },
  {
    name: "Site Data",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    action: () =>
      router.push({
        name: `pm_site_detail_site_data`,
        query: {
          pmId: pmId.value,
          type: type.value,
        },
      }),
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
</script>
<template>
  <div
    class="min-h-screen bg-white dark:bg-slate-900 from-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300"
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
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div
            class="absolute inset-0 dark:bg-gradient-to-r from-blue-500/10 to-purple-500/10"
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
                <div v-if="userRole === `dev` || userRole === `admin`">
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
      <!-- Tracking User Section -->

      <!-- Check In/Out Section -->

      <!-- Work Status Card (แทนที่ 2 card เดิม) -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div class="p-6">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <!-- Left: Icon + Info + Timeline -->
            <div class="flex items-start gap-4">
              <div
                :class="[
                  'w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 bg-gradient-to-br',
                  stateConfig.iconColor,
                ]"
              >
                <!-- pending -->
                <svg
                  v-if="workState === 'pending'"
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <!-- Inprogress -->
                <svg
                  v-else-if="workState === 'Inprogress'"
                  class="w-8 h-8 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <!-- checkedin -->
                <svg
                  v-else-if="workState === 'checkedin'"
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <!-- checkedout -->
                <svg
                  v-else
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div class="flex-1">
                <h3 class="text-xl font-semibold dark:text-slate-200 mb-1">
                  {{ stateConfig.title }}
                </h3>
                <p class="dark:text-slate-400 text-sm mb-4">
                  {{ stateConfig.description }}
                </p>

                <!-- Timeline -->
                <div class="space-y-2">
                  <div
                    v-if="startWorkTime"
                    class="flex items-center gap-2 text-sm"
                  >
                    <span
                      class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
                    ></span>
                    <span class="text-amber-400 font-medium">Start Work:</span>
                    <span class="dark:text-slate-300">{{ startWorkTime }}</span>
                  </div>
                  <div
                    v-if="checkInTime"
                    class="flex items-center gap-2 text-sm"
                  >
                    <span
                      class="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                    ></span>
                    <span class="text-green-400 font-medium">Check In:</span>
                    <span class="dark:text-slate-300">{{ checkInTime }}</span>
                  </div>
                  <div
                    v-if="checkOutTime"
                    class="flex items-center gap-2 text-sm"
                  >
                    <span
                      class="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"
                    ></span>
                    <span class="text-purple-400 font-medium">Check Out:</span>
                    <span class="dark:text-slate-300">{{ checkOutTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Single Action Button -->
            <button
              @click="handleMainAction"
              :disabled="actionDisabled"
              :class="[
                'flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg whitespace-nowrap text-white',
                workState !== 'checkedout'
                  ? `bg-gradient-to-r ${stateConfig.btnColor} hover:-translate-y-0.5`
                  : stateConfig.btnColor,
              ]"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="workState === 'pending'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  v-if="workState === 'pending'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else-if="workState === 'Inprogress'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
                <path
                  v-else-if="workState === 'checkedin'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-lg">{{ stateConfig.btnLabel }}</span>
            </button>
          </div>

          <!-- Status Bar -->
          <div
            v-if="stateConfig.statusBar"
            class="mt-6 pt-6 border-t dark:border-slate-700/50"
          >
            <div
              :class="[
                'flex items-center gap-3 px-4 py-3 border rounded-xl',
                stateConfig.statusBar.bg,
              ]"
            >
              <div
                v-if="stateConfig.statusBar.dot"
                :class="[
                  'w-2 h-2 rounded-full animate-pulse',
                  stateConfig.statusBar.dot,
                ]"
              ></div>
              <svg
                v-else
                class="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                :class="['text-sm font-medium', stateConfig.statusBar.text]"
                >{{ stateConfig.statusBar.label }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Site Information Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Info Box -->
        <div
          class="lg:col-span-2 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg p-6"
        >
          <h2
            class="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6"
          >
            Site Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Column 1 -->
            <div class="space-y-5">
              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Site ID</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium">
                    {{ pMsiteData.site_name }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Region</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium">
                    {{ pMsiteData.region || "-" }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Company</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium">
                    {{ pMsiteData.company || "-" }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Created by</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium">
                    {{ pMsiteData.created_by }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Column 2 -->
            <div class="space-y-5">
              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Plan Date</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium font-mono">
                    {{ formatDate(pMsiteData.plan) }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >PM Date</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium font-mono">
                    {{ formatDate(pMsiteData.pm_date) }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >Date Created</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium font-mono">
                    {{ formatDate(pMsiteData.date) }}
                  </p>
                </div>
              </div>

              <div class="group">
                <label
                  class="block text-xs font-medium dark:text-slate-500 uppercase tracking-wide mb-2"
                  >PlanWork</label
                >
                <div
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-lg px-4 py-3"
                >
                  <p class="dark:text-slate-200 font-medium">
                    {{ pMsiteData.planwork || "-" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Stats -->
        <div class="space-y-4">
          <!-- AC Power Card -->
          <div
            class="group dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium dark:text-slate-400 mb-1">
                  AC Power
                </p>
                <p
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"
                >
                  {{ pMsiteData.kwh_meters?.length || 0 }}
                </p>
              </div>
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Generator Card -->
          <div
            class="group dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg p-6 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium dark:text-slate-400 mb-1">
                  Generator
                </p>
                <p
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600"
                >
                  {{ pMsiteData.generators?.length || 0 }}
                </p>
              </div>
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
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
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Broadband Card -->
          <div
            class="group dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium dark:text-slate-400 mb-1">
                  Broadband
                </p>
                <p
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600"
                >
                  {{ pMsiteData.boardband?.length || 0 }}
                </p>
              </div>
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
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
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Cabinets Section -->
      <div
        v-if="isCheckedIn"
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg overflow-hidden"
      >
        <!-- Header -->
        <div
          @click="hide"
          class="flex items-center justify-between px-8 py-6 cursor-pointer dark:hover:bg-slate-800/60 transition-all duration-200 border-b dark:border-slate-700/50"
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
              <h2 class="text-xl font-semibold dark:text-slate-200">
                Cabinets
              </h2>
              <p class="text-sm dark:text-slate-400">
                {{ cabinets.length }} cabinet{{
                  cabinets.length !== 1 ? "s" : ""
                }}
              </p>
            </div>
          </div>

          <button
            class="flex items-center gap-2 dark:text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
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
          <div class="mb-4">
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
              class="group dark:bg-slate-800/40bg-slate-900/40 border dark:border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
            >
              <!-- Cabinet Header -->
              <div
                class="px-6 py-4 dark:bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-b dark:border-slate-700/50 cursor-pointer hover:from-slate-800/80 hover:to-slate-900/80 transition-all"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                      <span class="dark:text-white font-bold text-lg">{{
                        index + 1
                      }}</span>
                    </div>
                    <div>
                      <h3
                        class="text-lg font-semibold darktext-slate-200 group-hover:text-blue-300 transition-colors"
                      >
                        {{ cab.cabinet_name || `Cabinet ${index + 1}` }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <svg
                          class="w-4 h-4 dark:text-slate-500"
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
                        <span class="text-sm dark:text-slate-400"
                          >Network:
                          <span class="text-blue-400 font-medium">{{
                            cab.cabinet_network || "N/A"
                          }}</span></span
                        >
                      </div>
                    </div>
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
                    class="w-6 h-6 dark:text-slate-400 group-hover:text-blue-400 transition-colors"
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
                <div
                  class="dark:bg-slate-800/40 grid grid-cols-2 md:grid-cols-5 gap-3"
                >
                  <!-- Rectifiers -->
                  <div
                    class="dark:bg-slate-800/40 border dark:border-slate-700/50 rounded-lg p-4 hover:border-green-500/40 transition-all"
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
                    <p class="text-xs dark:text-slate-400 font-medium">
                      Rectifiers
                    </p>
                  </div>

                  <!-- Batteries -->
                  <div
                    class="dark:bg-slate-800/40 border dark:border-slate-700/50 rounded-lg p-4 hover:border-blue-500/40 transition-all"
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
                      class="text-xs dark:text-slate-400 font-medium"
                    >
                      {{ cab.batteries[0].battery_type }}
                    </p>
                  </div>

                  <!-- Site Grade -->
                  <div
                    class="dark:bg-slate-800/40 border dark:border-slate-700/50 rounded-lg p-4 hover:border-purple-500/40 transition-all"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <svg
                        class="w-5 h-5 dark:text-purple-400"
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
                    <p class="text-xs dark:text-slate-400 font-medium">
                      Site Grade
                    </p>
                  </div>

                  <!-- Problems -->
                  <div
                    class="dark:bg-slate-800/40 border dark:border-slate-700/50 rounded-lg p-4 hover:border-yellow-500/40 transition-all cursor-pointer"
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
                    <p class="text-xs dark:text-slate-400 font-medium">
                      Problems
                    </p>
                  </div>

                  <!-- Audit -->
                  <div
                    class="dark:bg-slate-800/40 border dark:border-slate-700/50 rounded-lg p-4 hover:border-orange-500/40 transition-all cursor-pointer"
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
                    <p class="text-xs dark:text-slate-400 font-medium">
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
            class="border-2 border-dashed dark:border-slate-700/50 rounded-xl p-12 hover:border-blue-500/40 transition-all"
          >
            <div class="text-center">
              <div
                class="w-20 h-20 bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-10 h-10 dark:text-slate-600"
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
              <h3 class="text-lg font-semibold dark:text-slate-300 mb-2">
                No Cabinets Yet
              </h3>
              <p class="dark:text-slate-400 text-sm mb-4">
                Get started by adding your first cabinet
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modules Section -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div
          @click="hide"
          class="flex items-center justify-between px-8 py-6 cursor-pointer dark:hover:bg-slate-800/60 transition-all duration-200 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
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
            <h2 class="text-xl font-semibold dark:text-slate-200">Modules</h2>
          </div>

          <button
            class="flex items-center gap-2 dark:text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
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

        <div v-if="showModules" class="px-8 py-6 space-y-4">
          <!-- Mowing Module -->
          <div
            v-if="pMsiteData.mowing?.length"
            class="dark:bg-gradient-to-r from-green-500/10 to-emerald-500/10 border dark:border-green-500/30 rounded-xl p-5 hover:from-green-500/15 hover:to-emerald-500/15 transition-all duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-lg dark:bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-slate-200 text-lg">Mowing</p>
                  <p class="text-sm text-slate-400">Lawn maintenance module</p>
                </div>
              </div>
              <div
                class="px-4 py-2 dark:bg-green-500/20 border dark:border-green-500/30 rounded-lg"
              >
                <span class="text-green-300 font-bold">{{
                  pMsiteData.mowing.length
                }}</span>
                <span class="text-green-400 text-sm ml-1">items</span>
              </div>
            </div>
          </div>

          <!-- Solar Cell Module -->
          <div
            v-if="pMsiteData.solar_cell?.length"
            class="dark:bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border dark:border-yellow-500/30 rounded-xl p-5 hover:from-yellow-500/15 hover:to-orange-500/15 transition-all duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-lg dark:bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/30"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold dark:text-slate-200 text-lg">
                    Solar Cell
                  </p>
                  <p class="text-sm dark:text-slate-400">Solar power system</p>
                </div>
              </div>
              <div
                class="px-4 py-2 dark:bg-yellow-500/20 border dark:border-yellow-500/30 rounded-lg"
              >
                <span class="dark:text-yellow-300 font-bold">{{
                  pMsiteData.solar_cell.length
                }}</span>
                <span class="dark:text-yellow-400 text-sm ml-1">items</span>
              </div>
            </div>
          </div>

          <!-- Empty State for Modules -->
          <div
            v-if="!pMsiteData.mowing?.length && !pMsiteData.solar_cell?.length"
            class="text-center py-8"
          >
            <svg
              class="w-16 h-16 mx-auto dark:text-slate-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p class="dark:text-slate-400 font-medium">No modules available</p>
            <p class="dark:text-slate-500 text-sm mt-1">
              Modules will appear here when added
            </p>
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
        class="w-20 h-20 dark:text-slate-600 mb-4"
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
      <p class="dark:text-slate-400 text-lg font-medium">No data available</p>
      <p class="dark:text-slate-500 text-sm mt-2">
        Unable to load site information
      </p>
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