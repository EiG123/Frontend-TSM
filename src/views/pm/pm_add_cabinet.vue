<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import { pmTitleManage } from "../../services/PmTitle/pmTitleManage.api";
import { PMApiService } from "../../services/pm_nodeb.api";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const username = authStore.currentUser;

// Loading state
const isSubmitting = ref(false);
const loading = ref(false);

const props = defineProps<{
  pmId?: any;
}>();

const pmId = computed(() => props.pmId);

const cabinet_name = ref("");
const cabinet_network = ref("");

const RectifierEnabled = ref(false);
const RectifierCount = ref(0);

const BatteryEnabled = ref(false);
const BatteryType = ref(""); // "lithium" or "lead-acid"
const BatteryCount = ref(0);

const OnlineEquipmentEnabled = ref(false);

// Watch BatteryEnabled to reset values when disabled
watch(BatteryEnabled, (newVal) => {
  if (!newVal) {
    BatteryType.value = "";
    BatteryCount.value = 0;
  }
});

const handleCancel = () => {
  router.back();
};

onMounted(async () => {});

const handleSubmit = async () => {
  console.log({
    cabinet_name: cabinet_name.value,
    cabinet_network: cabinet_network.value,
    rectifier_count: RectifierCount.value,
    rectifier: {
      enabled: RectifierEnabled.value,
      count: RectifierCount.value,
    },
    battery: {
      enabled: BatteryEnabled.value,
      type: BatteryType.value,
      count: BatteryCount.value,
    },
    online_equipment: OnlineEquipmentEnabled.value,
  });
  try {
    await pmServiceManage.AddCabinet({
      pm_id: pmId.value,
      cabinet_name: cabinet_name.value,
      cabinet_network: cabinet_network.value,
      rectifier_count: RectifierCount.value,
      rectifier: {
        enabled: RectifierEnabled.value,
        count: RectifierCount.value,
      },
      battery: {
        enabled: BatteryEnabled.value,
        serial_number: 999,
        type: BatteryType.value,
        count: BatteryCount.value,
        status: "pass",
      },
      online_equipment: OnlineEquipmentEnabled.value,
    });
    router.back();
  } catch (err) {
    alert(err);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Back Button -->
    <button
      type="button"
      @click="handleCancel"
      class="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-200 mb-6"
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
      <span class="font-medium">Back</span>
    </button>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800">Add Cabinet</h1>
      </div>

      <!-- Basic Information -->
      <div class="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Cabinet Information
        </h2>

        <!-- Cabinet Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cabinet Name
          </label>
          <input
            v-model="cabinet_name"
            type="text"
            placeholder="Enter cabinet name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <!-- Network -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Network
          </label>
          <select
            v-model="cabinet_network"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Select...</option>
            <option value="3G-2100">3G-2100</option>
            <option value="4G-1800">4G-1800</option>
            <option value="5G-3500">5G-3500</option>
          </select>
        </div>
      </div>

      <!-- Rectifier Section -->
      <div class="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <label
            class="flex items-center text-base font-medium text-gray-700 cursor-pointer group"
          >
            <input
              v-model="RectifierEnabled"
              type="checkbox"
              class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <span class="ml-3 group-hover:text-blue-600 transition-colors">
              Rectifier
            </span>
          </label>
        </div>

        <!-- Rectifier Count (show when enabled) -->
        <div v-show="RectifierEnabled" class="pt-4 border-t border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Number of Modules
          </label>
          <input
            v-model.number="RectifierCount"
            type="number"
            min="0"
            max="12"
            placeholder="0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <!-- Battery Section -->
      <div class="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <label
            class="flex items-center text-base font-medium text-gray-700 cursor-pointer group"
          >
            <input
              v-model="BatteryEnabled"
              type="checkbox"
              class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <span class="ml-3 group-hover:text-blue-600 transition-colors">
              Battery
            </span>
          </label>
        </div>

        <!-- Battery Options (show when enabled) -->
        <div
          v-show="BatteryEnabled"
          class="pt-4 border-t border-gray-200 space-y-4"
        >
          <!-- Battery Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Battery Type
            </label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="BatteryType"
                  type="radio"
                  value="lithium"
                  class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700">Lithium</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="BatteryType"
                  type="radio"
                  value="lead-acid"
                  class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-gray-700">Lead-Acid</span>
              </label>
            </div>
          </div>

          <!-- Battery Count -->
          <div v-show="BatteryType">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Number of Batteries
            </label>
            <input
              v-model.number="BatteryCount"
              type="number"
              min="0"
              max="12"
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      <!-- Online Equipment Section -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <label
          class="flex items-center text-base font-medium text-gray-700 cursor-pointer group"
        >
          <input
            v-model="OnlineEquipmentEnabled"
            type="checkbox"
            class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span class="ml-3 group-hover:text-blue-600 transition-colors">
            Online Equipment
          </span>
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-4">
        <button
          @click="handleCancel"
          type="button"
          class="flex-1 px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="flex-1 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>