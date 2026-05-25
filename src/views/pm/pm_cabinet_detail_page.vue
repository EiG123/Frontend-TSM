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
  cabinetId: any;
}>();

const cabinetId = computed(() => props.cabinetId);

const loading = ref(false);
const pMsiteData = ref<any>(null);
const showModules = ref(true);

const hide = () => {
  showModules.value = !showModules.value;
};

const goBack = () => {
  router.back();
};

const userId = authStore.userId;

const isCheckedIn = ref(false);
const checkInTime = ref<string | null>(null);
const checkOutTime = ref<string | null>(null);

const cabinet_name = ref("");
const cabinet_network = ref("");
const cabinet_rectifier = ref("");
const cabinet_battery_count = ref("");

onMounted(async () => {
  loading.value = true;
  try {
    const cabinet_detail = await pmServiceManage.getCabinetDetailByCabinetId(
      cabinetId.value
    );
    console.log(cabinet_detail.data);
    cabinet_name.value = cabinet_detail.data.cabinet_name;
    cabinet_network.value = cabinet_detail.data.cabinet_network;
    cabinet_rectifier.value = cabinet_detail.data.rectifier;
    cabinet_battery_count.value = cabinet_detail.data.batteries.length;
  } catch (error) {
    console.error("Failed to load PM data:", error);
    alert("ไม่เจอ API SiteList");
  } finally {
    loading.value = false;
  }
});

const handleCabinetDetail = (cabinets_id: any) => {
  alert("go to cabinet detail" + cabinets_id);
};

const handleCabinet = (cabinet_id: any) => {
  alert(cabinet_id);
};

const handleCabinetDelete = async (cabinet_id: any) => {
  loading.value = true;
  if (confirm("ลบ cabinet นี้หรือไม่")) {
    try {
      await pmServiceManage.deleteCabinet({
        cabinet_id,
      });
      router.back();
    } catch (error) {
      console.log("Cabinet Delete Log ERROR: ", error);
    } finally {
      loading.value = false;
    }
  }else{
    return;
  }
};
</script>

<template>
  <div>
    <div @click="goBack">Back</div>
    <!-- Cabinets List -->
    <div class="space-y-4">
      <div
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
              ></div>
              <div>
                <h3
                  class="text-lg font-semibold text-slate-200 group-hover:text-blue-300 transition-colors"
                >
                  {{ cabinet_name }}
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
                      cabinet_network
                    }}</span></span
                  >
                </div>
              </div>
            </div>

            <div @click="handleCabinet(cabinetId)">
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

            <div @click="handleCabinetDelete(cabinetId)">
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
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
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
                  cabinet_rectifier
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
                  cabinet_battery_count
                }}</span>
              </div>
              <p class="text-xs text-slate-400 font-medium">N/A</p>
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
                  "N/A"
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
                <span class="text-2xl font-bold text-yellow-400"></span>
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
              <p class="text-xs text-slate-400 font-medium">Audit (RNSA)</p>
            </div>
          </div>
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