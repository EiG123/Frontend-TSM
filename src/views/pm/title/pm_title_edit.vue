<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { pmTitleManage } from "../../../services/PmTitle/pmTitleManage.api";

const router = useRouter();
const route = useRoute();

const Id = ref(route.params.id as any);

const pm_name = ref("");
const pm_description = ref("");
const pm_key = ref("");
const pm_mode = ref("PM");
const pm_type = ref("NodeB");
const pm_status = ref("");
const pm_rank = ref(0);

const handleCancel = () => {
  router.push("/pm_title");
};

const handleSubmit = async () => {
  const res = await pmTitleManage.EditpmTitle({
    pm_id: Id.value,
    pm_name: pm_name.value,
    pm_description: pm_description.value,
    pm_key: pm_key.value,
    pm_type: pm_type.value,
    pm_status: pm_status.value,
    pm_rank: pm_rank.value,
  });

  if (res.success) {
    router.push("/pm_title");
  } else {
    alert("ไม่สำเร็จ");
  }
};

const loading = ref(false);
const pmTitles = ref([]);

// ===== lifecycle =====
onMounted(async () => {
  loading.value = true;
  try {
    const res = await pmTitleManage.getPmTitleById(Id.value);
    pm_name.value = res.data.result.title || "";
    pm_description.value = res.data.result.description || "";
    pm_key.value = res.data.result.key || "";
    pm_type.value = res.data.result.type || "";
    pm_status.value = res.data.result.status || "";
    pm_rank.value = res.data.result.rank || 0;
  } catch {
    alert("ไม่เจอ API getPmTitleById");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">New NodeB Title</h1>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white shadow-md rounded-lg p-6 space-y-6"
    >
      <!-- Title -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          v-model="pm_name"
          type="text"
          placeholder="ชื่อหัวข้อ PM"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          v-model="pm_description"
          type="text"
          placeholder="Description"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Title Type -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Title Type
        </label>
        <select
          v-model="pm_key"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="">Select...</option>
          <option value="site_info">Site Information</option>
          <option value="transformer">Transformer</option>
          <option value="generator">Generator</option>
          <option value="kwh_meter">KWH Meter</option>
        </select>
      </div>

      <!-- Mode and Type in Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Mode -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mode
          </label>
          <input
            v-model="pm_mode"
            type="text"
            disabled
            class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <!-- Type -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <input
            v-model="pm_type"
            type="text"
            disabled
            class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      <!-- Status -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Status
        </label>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="pm_status"
              type="radio"
              value="active"
              class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-700">Active</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="pm_status"
              type="radio"
              value="inactive"
              class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-700">Inactive</span>
          </label>
        </div>
      </div>

      <!-- Rank -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rank
        </label>
        <input
          v-model="pm_rank"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Buttons -->
      <div class="flex gap-4 pt-4 border-t border-gray-200">
        <button
          @click="handleCancel"
          type="button"
          class="flex-1 px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>