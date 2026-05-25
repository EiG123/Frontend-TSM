<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { PMApiService } from "../../services/pm_nodeb.api";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();

const authStore = useAuthStore();
const username = authStore.currentUser;

const props = defineProps<{
  type: string;
}>();
const type = computed(() => props.type);

// Loading state
const isSubmitting = ref(false);
const showPmInfo = ref(true);

const togglePmInfo = () => {
  showPmInfo.value = !showPmInfo.value;
};

const handleCancel = async () => {
  window.location.href = "/pm_nodeb";
};

const handlePmNodeB = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // แปลง kwh_meters array เป็น string หรือ JSON ตามที่ API ต้องการ
    const generatorData = generatorEnabled.value ? generatorCount.value : 0;
    const transformerData = transformerEnabled.value
      ? transformerCount.value
      : 0;
    const kwhMeterData = kwhMeterEnabled.value ? kwh_meters.value : [];
    const solarCellData = solarCellEnabled.value ? solarCellCount.value : 0;
    const mowingData = mowingEnabled.value ? mowingCount.value : 0;

    const pmResult = await PMApiService.pre_pm_nodeb({
      site_id: site_id.value,
      type: type.value,
      region: region.value,
      datetime: datetime.value,
      status: status.value,
      planwork: planwork.value,
      generator: generatorData,
      transformer: transformerData,
      kwh_meter: kwhMeterData,
      solarCell: solarCellData,
      mowing: mowingData,
      created_by: created_by,
      remark: remark.value,
    });

    if (pmResult.success) {
      router.back();
    } else {
      alert(pmResult.message || "ไม่สามารถลงข้อมูลได้");
    }
  } catch (error) {
    console.error("PM NodeB Error:", error);
    alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถลงข้อมูลได้"));
  } finally {
    isSubmitting.value = false;
  }
};

const site_id = ref("");
const region = ref("");
const datetime = ref("");
const status = ref("");
const planwork = ref("");
const created_by = username.username;
const remark = ref("");

// Checkbox states
const generatorEnabled = ref(false);
const transformerEnabled = ref(false);
const kwhMeterEnabled = ref(false);
const solarCellEnabled = ref(false);
const mowingEnabled = ref(false);

const generatorCount = ref(1);
const transformerCount = ref(1);
const kwhMeterCount = ref(1);
const solarCellCount = ref(1);
const mowingCount = ref(1);
// KWH Meter specific states
const kwh_meters = ref([{ phase: "P1" }]);

// Watch for count changes
watch(kwhMeterCount, (newCount) => {
  const currentLength = kwh_meters.value.length;

  if (newCount > currentLength) {
    // เพิ่มช่องใหม่
    for (let i = currentLength; i < newCount; i++) {
      kwh_meters.value.push({ phase: "P1" });
    }
  } else if (newCount < currentLength) {
    // ลดช่อง
    kwh_meters.value = kwh_meters.value.slice(0, newCount);
  }
});

// Reset เมื่อ disable checkbox
watch(kwhMeterEnabled, (enabled) => {
  if (!enabled) {
    kwhMeterCount.value = 1;
    kwh_meters.value = [{ phase: "P1" }];
  }
});

watch(generatorEnabled, (enabled) => {
  if (!enabled) {
    generatorCount.value = 1;
  }
});
watch(transformerEnabled, (enabled) => {
  if (!enabled) {
    transformerCount.value = 1;
  }
});
watch(solarCellEnabled, (enabled) => {
  if (!enabled) {
    solarCellCount.value = 1;
  }
});
watch(mowingEnabled, (enabled) => {
  if (!enabled) {
    mowingCount.value = 1;
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
  >
    <form
      @submit.prevent="handlePmNodeB"
      class="max-w-4xl mx-auto animate-slide-up"
    >
      <!-- Header -->
      <div class="mb-6">
        <h1
          class="dark:text-white text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
        >
          New Site PM
        </h1>
        <p class="text-slate-900 dark:text-slate-400">
          Create a new preventive maintenance schedule
        </p>
      </div>

      <!-- PM Information Section -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl mb-6 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-6 py-5 cursor-pointer border-b border-slate-700/50 hover:bg-sky-500/60 dark:hover:bg-slate-800/60 transition-all duration-200"
          @click="togglePmInfo"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold dark:text-slate-200">
              Site Information
            </h2>
          </div>
          <button
            type="button"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-700/50 dark:bg-slate-700/50 hover:bg-slate-700 transition-all duration-200 text-slate-300"
          >
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': !showPmInfo }"
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

        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[3000px]"
          leave-from-class="opacity-100 max-h-[3000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="showPmInfo" class="overflow-hidden">
            <div class="p-6 space-y-6">
              <!-- Site ID -->
              <div class="form-group">
                <label
                  class="block text-sm font-medium dark:text-slate-400 mb-2"
                >
                  Site ID <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="site_id"
                  type="text"
                  required
                  placeholder="Enter site ID"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Region -->
              <div class="form-group">
                <label
                  class="block text-sm font-medium dark:text-slate-400 mb-2"
                >
                  Region
                </label>
                <select
                  v-model="region"
                  class="w-full px-4 py-3 bg-white dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="" class="bg-slate-800">
                    Select region...
                  </option>
                  <option value="R1" class="bg-slate-800">R1</option>
                  <option value="R2" class="bg-slate-800">R2</option>
                  <option value="R3" class="bg-slate-800">R3</option>
                  <option value="R4" class="bg-slate-800">R4</option>
                  <option value="R5" class="bg-slate-800">R5</option>
                  <option value="R6" class="bg-slate-800">R6</option>
                  <option value="R7" class="bg-slate-800">R7</option>
                  <option value="R8" class="bg-slate-800">R8</option>
                </select>
              </div>

              <!-- PM Date -->
              <div class="form-group">
                <label
                  class="block text-sm font-medium dark:text-slate-400 mb-2"
                >
                  PM Date <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="datetime"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- PlanWork -->
              <div class="form-group">
                <label
                  class="block text-sm font-medium dark:text-slate-400 mb-2"
                >
                  Plan Work
                </label>
                <input
                  v-model="planwork"
                  type="text"
                  placeholder="Enter plan work details"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Service Status -->
              <div class="form-group">
                <label
                  class="block text-sm font-medium dark:text-slate-400 mb-2"
                >
                  Service Status
                </label>
                <select
                  v-model="status"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="" class="bg-slate-800">
                    Select status...
                  </option>
                  <option value="onService" class="bg-slate-800">
                    On Service
                  </option>
                  <option value="cancel" class="bg-slate-800">Cancel</option>
                </select>
              </div>

              <!-- Divider -->
              <div class="relative py-4">
                <div class="absolute inset-0 flex items-center">
                  <div
                    class="w-full dark:border-t dark:border-slate-700/50"
                  ></div>
                </div>
                <div class="relative flex justify-center">
                  <span
                    class="px-4 dark:bg-slate-800/40 dark:text-slate-400 text-sm font-medium"
                    >Equipment & Modules</span
                  >
                </div>
              </div>

              <!-- Generator -->
              <div
                class="form-group dark:bg-slate-900/20 border border-slate-700/30 rounded-xl p-5"
              >
                <label
                  class="flex items-center text-base font-medium text-slate-300 mb-4 cursor-pointer group"
                >
                  <input
                    v-model="generatorEnabled"
                    type="checkbox"
                    class="w-5 h-5 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span
                    class="ml-3 text-gray-400 group-hover:text-black dark:group-hover:text-blue-400 transition-colors"
                    >Generator</span
                  >
                </label>

                <div class="flex items-center gap-4">
                  <label
                    class="text-sm font-medium text-slate-400 min-w-[120px]"
                  >
                    Quantity:
                  </label>
                  <input
                    v-model.number="generatorCount"
                    type="number"
                    min="0"
                    max="10"
                    :disabled="!generatorEnabled"
                    class="w-24 px-4 py-2 dark:bg-slate-800/60 border border-slate-700/50 rounded-lg dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <!-- Transformer -->
              <div
                class="form-group dark:bg-slate-900/20 border border-slate-700/30 rounded-xl p-5"
              >
                <label
                  class="flex items-center text-base font-medium text-slate-300 mb-4 cursor-pointer group"
                >
                  <input
                    v-model="transformerEnabled"
                    type="checkbox"
                    class="w-5 h-5 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span
                    class="ml-3 text-gray-400 group-hover:text-black dark:group-hover:text-blue-400 transition-colors"
                    >Transformer</span
                  >
                </label>

                <div class="flex items-center gap-4">
                  <label
                    class="text-sm font-medium text-slate-400 min-w-[120px]"
                  >
                    Quantity:
                  </label>
                  <input
                    v-model.number="transformerCount"
                    type="number"
                    min="0"
                    max="10"
                    :disabled="!transformerEnabled"
                    class="w-24 px-4 py-2 dark:bg-slate-800/60 border border-slate-700/50 rounded-lg dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <!-- KWH Meter - Enhanced Version -->
              <div
                class="form-group dark:bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-slate-700/30 rounded-xl p-5"
              >
                <label
                  class="flex items-center text-base font-medium text-slate-300 mb-4 cursor-pointer group"
                >
                  <input
                    v-model="kwhMeterEnabled"
                    type="checkbox"
                    class="w-5 h-5 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span
                    class="ml-3 text-gray-400 group-hover:text-black dark:group-hover:text-blue-400 transition-colors"
                    >KWH Meter</span
                  >
                </label>

                <div class="flex items-center gap-4 mb-4">
                  <label
                    class="text-sm font-medium text-slate-400 min-w-[120px]"
                  >
                    Quantity:
                  </label>
                  <input
                    v-model.number="kwhMeterCount"
                    type="number"
                    min="0"
                    max="2"
                    :disabled="!kwhMeterEnabled"
                    class="w-24 px-4 py-2 dark:bg-slate-800/60 border border-slate-700/50 rounded-lg dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <!-- Meter Phase Selection -->
                <div v-if="kwhMeterEnabled" class="space-y-3 mt-4">
                  <div
                    v-for="(meter, index) in kwh_meters"
                    :key="index"
                    class="dark:bg-slate-800/40 p-4 rounded-lg border border-slate-700/50 shadow-sm hover:border-blue-500/30 transition-all"
                  >
                    <div
                      class="flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <span
                        class="text-sm font-semibold text-slate-300 min-w-[80px]"
                      >
                        Meter {{ index + 1 }}:
                      </span>

                      <!-- Phase Choice Buttons -->
                      <div class="flex gap-2">
                        <button
                          type="button"
                          @click="meter.phase = 'P1'"
                          :class="[
                            'px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                            meter.phase === 'P1'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'dark:bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50',
                          ]"
                        >
                          1 Phase
                        </button>
                        <button
                          type="button"
                          @click="meter.phase = 'P3'"
                          :class="[
                            'px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                            meter.phase === 'P3'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'dark:bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50',
                          ]"
                        >
                          3 Phase
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Solar Cell -->
              <div
                class="form-group dark:bg-slate-900/20 border border-slate-700/30 rounded-xl p-5"
              >
                <label
                  class="flex items-center text-base font-medium text-slate-300 mb-4 cursor-pointer group"
                >
                  <input
                    v-model="solarCellEnabled"
                    type="checkbox"
                    class="w-5 h-5 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span
                    class="ml-3 text-gray-400 group-hover:text-black dark:group-hover:text-blue-400 transition-colors"
                    >Solar Cell</span
                  >
                </label>

                <div class="flex items-center gap-4">
                  <label
                    class="text-sm font-medium text-slate-400 min-w-[120px]"
                  >
                    Quantity:
                  </label>
                  <input
                    v-model.number="solarCellCount"
                    type="number"
                    min="0"
                    max="10"
                    :disabled="!solarCellEnabled"
                    class="w-24 px-4 py-2 dark:bg-slate-800/60 border border-slate-700/50 rounded-lg dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <!-- Mowing -->
              <div
                class="form-group dark:bg-slate-900/20 border border-slate-700/30 rounded-xl p-5"
              >
                <label
                  class="flex items-center text-base font-medium text-slate-300 mb-4 cursor-pointer group"
                >
                  <input
                    v-model="mowingEnabled"
                    type="checkbox"
                    class="w-5 h-5 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span
                    class="ml-3 text-gray-400 group-hover:text-black dark:group-hover:text-blue-400 transition-colors"
                    >Mowing</span
                  >
                </label>

                <div class="flex items-center gap-4">
                  <label
                    class="text-sm font-medium text-slate-400 min-w-[120px]"
                  >
                    Quantity:
                  </label>
                  <input
                    v-model.number="mowingCount"
                    type="number"
                    min="0"
                    max="10"
                    :disabled="!mowingEnabled"
                    class="w-24 px-4 py-2 dark:bg-slate-800/60 border border-slate-700/50 rounded-lg dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <!-- Created by (hidden) -->
              <input v-model="created_by" type="hidden" />

              <!-- Remark -->
              <div class="form-group">
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  Remark
                </label>
                <textarea
                  v-model="remark"
                  rows="3"
                  placeholder="Additional notes or remarks..."
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Submit Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button
          type="button"
          @click="handleCancel"
          class="px-8 py-3.5 bg-slate-700/50 border border-slate-600/50 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200"
        >
          <span class="flex items-center justify-center gap-2">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </span>
        </button>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-blue-500/20 transition-all duration-300"
        >
          <span
            v-if="isSubmitting"
            class="flex items-center justify-center gap-2"
          >
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            กำลังบันทึก...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Create Site PM
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
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

.animate-slide-up {
  animation: slide-up 0.6s ease-out 0.2s both;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>