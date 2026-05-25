<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { pmDropdownManage } from "../../../services/PmTitle/pmDropdownManage.api";
import { pmTitleManage } from "../../../services/PmTitle/pmTitleManage.api";

const router = useRouter();
const route = useRoute();
const props = defineProps<{
  title_id?: any;
  title_child_id?: any;
}>();

const title_id = computed(() => props.title_id);
const title_child_id = computed(() => props.title_child_id);

const title_child_name = ref("");
const description = ref("");
const status = ref("inactive");
const rank = ref(0);

// Values (3 static values)
const value_status_1 = ref("inactive");
const value_name_1 = ref("");
const value_input_type_1 = ref("");
const dropdown_head_id_1 = ref<string | null>(null);
const dropdown_member_id_1 = ref<string | null>(null);

const value_status_2 = ref("inactive");
const value_name_2 = ref("");
const value_input_type_2 = ref("");
const dropdown_head_id_2 = ref<string | null>(null);
const dropdown_member_id_2 = ref<string | null>(null);

const value_status_3 = ref("inactive");
const value_name_3 = ref("");
const value_input_type_3 = ref("");
const dropdown_head_id_3 = ref<string | null>(null);
const dropdown_member_id_3 = ref<string | null>(null);

// Image
const image_status = ref("inactive");
const image_number = ref(0);
const image_descriptions = ref<string[]>([]);

// Dropdown data
const dropdownData = ref([]);

// Watch image_number to update descriptions array - only for NEW entries
watch(image_number, (newVal, oldVal) => {
  const num = Number(newVal) || 0;
  const current = image_descriptions.value.length;
  if (num > current) {
    // Add empty strings for new slots
    image_descriptions.value.push(...Array(num - current).fill(""));
  } else {
    // Trim array if reduced
    image_descriptions.value = image_descriptions.value.slice(0, num);
  }
});

// Get members for dropdown based on head selection
const getSelectedMembers = (headId: string | null) => {
  if (!headId) return [];
  const head = dropdownData.value.find((item) => item.id === headId);
  return head ? head.members : [];
};

// Load dropdown data on mount
onMounted(async () => {
  try {
    const getTitleChildByTitle = await pmTitleManage.getTitleChildData({
      title_id: title_id.value,
      title_child_id: title_child_id.value,
    });
    title_child_name.value =
      getTitleChildByTitle.data.result[0].title_child_name;
    description.value = getTitleChildByTitle.data.result[0].description;
    status.value = getTitleChildByTitle.data.result[0].status;
    rank.value = getTitleChildByTitle.data.result[0].rank;

    // Values (3 static values)
    value_status_1.value = getTitleChildByTitle.data.result[0].value_status_1;
    value_name_1.value = getTitleChildByTitle.data.result[0].value_name_1;
    value_input_type_1.value =
      getTitleChildByTitle.data.result[0].value_input_type_1;
    // dropdown_head_id_1 = ref<string | null>(null);
    // dropdown_member_id_1 = ref<string | null>(null);

    value_status_2.value = getTitleChildByTitle.data.result[0].value_status_2;
    value_name_2.value = getTitleChildByTitle.data.result[0].value_name_2;
    value_input_type_2.value =
      getTitleChildByTitle.data.result[0].value_input_type_2;
    // dropdown_head_id_2 = ref<string | null>(null);
    // dropdown_member_id_2 = ref<string | null>(null);

    value_status_3.value = getTitleChildByTitle.data.result[0].value_status_3;
    value_name_3.value = getTitleChildByTitle.data.result[0].value_name_3;
    value_input_type_3.value =
      getTitleChildByTitle.data.result[0].value_input_type_3;
    // dropdown_head_id_3 = ref<string | null>(null);
    // dropdown_member_id_3 = ref<string | null>(null);

    // Image
    image_status.value = getTitleChildByTitle.data.result[0].img_status;
    const imgResults = getTitleChildByTitle.data.img_result;
    image_number.value = getTitleChildByTitle.data.img_result.length;

    // Set descriptions array ก่อน
    image_descriptions.value = imgResults.map((img: any) => img.description);

    // Set image_number หลัง (watch จะ trigger แต่ num === current.length จะไม่เปลี่ยน array)
    image_number.value = imgResults.length;

    console.log(getTitleChildByTitle.data.result);
    // image_status = ref("inactive");
    // image_number = ref(0);
    // image_descriptions = ref<string[]>([]);
    const res = await pmDropdownManage.getAllDropdownNameAndValue();
    if (res.data.success) {
      dropdownData.value = res.data.result;
    }
  } catch (error) {
    console.error("Error loading dropdown data:", error);
  }
});

const handleCancel = () => {
  router.back();
};

const handleSubmit = async () => {
  console.log("Submitting...");
  if (value_status_1.value === 'active') {
    if (!value_input_type_1.value) {
      // handle error
      alert("กรุณากรอก value type ตัวที่ 1");
      return;
    }
  }
  if (value_status_2.value === 'active') {
    if (!value_input_type_2.value) {
      // handle error
      alert("กรุณากรอก value type ตัวที่ 2");
      return;
    }
  }
  if (value_status_3.value === 'active') {
    if (!value_input_type_3.value) {
      // handle error
      alert("กรุณากรอก value type ตัวที่ 3");
      return;
    }
  }
  const res = await pmTitleManage.EditpmTitleChild({
    title_id: title_id.value,
    title_child_id: title_child_id.value,
    title_child_name: title_child_name.value,
    description: description.value,
    status: status.value,
    rank: rank.value,

    value_status_1: value_status_1.value,
    value_name_1: value_name_1.value,
    value_input_type_1: value_input_type_1.value,
    dropdown_head_id_1: dropdown_head_id_1.value,
    dropdown_member_id_1: dropdown_member_id_1.value,

    value_status_2: value_status_2.value,
    value_name_2: value_name_2.value,
    value_input_type_2: value_input_type_2.value,
    dropdown_head_id_2: dropdown_head_id_2.value,
    dropdown_member_id_2: dropdown_member_id_2.value,

    value_status_3: value_status_3.value,
    value_name_3: value_name_3.value,
    value_input_type_3: value_input_type_3.value,
    dropdown_head_id_3: dropdown_head_id_3.value,
    dropdown_member_id_3: dropdown_member_id_3.value,

    image_status: image_status.value,
    image_number: image_number.value,
    image_descriptions: image_descriptions.value,
  });

  if (res.data.success) {
    router.push(`/pm_title_child/${title_id.value}`);
  } else {
    alert("Submit ไม่ผ่าน");
  }
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
    <form
      @submit.prevent="handleSubmit"
      class="max-w-5xl mx-auto space-y-6 animate-slide-up"
    >
      <!-- Back Button -->
      <button
        type="button"
        @click="handleCancel"
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
        <span class="font-medium">Back</span>
      </button>

      <!-- Header -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div class="absolute inset-0 dark:bg-slate-900"></div>

          <div class="relative px-8 py-6">
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h1
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                >
                  New Title Child
                </h1>
                <p class="text-slate-400 mt-1">
                  Create a new title child configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Basic Information -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div class="px-8 py-6 border-b border-slate-700/50">
          <h2
            class="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
          >
            Basic Information
          </h2>
        </div>

        <div class="p-8 space-y-6">
          <!-- Title Child Name -->
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-2">
              Title Child Name <span class="text-red-400">*</span>
            </label>
            <input
              v-model="title_child_name"
              type="text"
              placeholder="Enter title child name"
              required
              class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              v-model="description"
              placeholder="Enter description"
              rows="3"
              class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-3">
              Status
            </label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="status"
                  type="radio"
                  value="active"
                  class="w-5 h-5 text-blue-500 dark:bg-slate-800 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-blue-400 transition-colors"
                  >Active</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="status"
                  type="radio"
                  value="inactive"
                  class="w-5 h-5 text-blue-500 dark:bg-slate-800 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-blue-400 transition-colors"
                  >Inactive</span
                >
              </label>
            </div>
          </div>

          <!-- Rank -->
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-2">
              Rank
            </label>
            <input
              v-model.number="rank"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Value #1 -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div
          class="px-8 py-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <span class="text-white font-bold">1</span>
            </div>
            <h2 class="text-xl font-semibold dark:text-slate-200">Value #1</h2>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <!-- Value Status -->
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-3">
              Status
            </label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_1"
                  type="radio"
                  value="active"
                  class="w-5 h-5 text-green-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-green-400 transition-colors"
                  >Active</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_1"
                  type="radio"
                  value="inactive"
                  class="w-5 h-5 text-green-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-green-400 transition-colors"
                  >Inactive</span
                >
              </label>
            </div>
          </div>

          <!-- Show only when active -->
          <div
            v-if="value_status_1 === 'active'"
            class="space-y-6 pt-4 border-t border-slate-700/30"
          >
            <!-- Value Name -->
            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-2">
                Name
              </label>
              <input
                v-model="value_name_1"
                type="text"
                placeholder="Enter value name"
                class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <!-- Input Type -->
            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-3">
                Input Type
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-green-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_1"
                    type="radio"
                    value="text"
                    class="w-4 h-4 text-green-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Text</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-green-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_1"
                    type="radio"
                    value="number"
                    class="w-4 h-4 text-green-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Number</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-green-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_1"
                    type="radio"
                    value="date"
                    class="w-4 h-4 text-green-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Date</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-green-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_1"
                    type="radio"
                    value="dropdown"
                    class="w-4 h-4 text-green-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Dropdown</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-green-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_1"
                    type="radio"
                    value="ocr"
                    class="w-4 h-4 text-green-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">OCR (AI)</span>
                </label>
              </div>
            </div>

            <!-- Dropdown Configuration -->
            <div
              v-if="value_input_type_1 === 'dropdown'"
              class="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
            >
              <h4
                class="text-sm font-semibold dark:text-blue-300 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Dropdown Configuration
              </h4>

              <div>
                <label
                  class="block text-sm font-medium dark:text-slate-300 mb-2"
                >
                  Select Dropdown Name
                </label>
                <select
                  v-model="dropdown_head_id_1"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Dropdown --
                  </option>
                  <option
                    v-for="head in dropdownData"
                    :key="head.id"
                    :value="head.id"
                    class="dark:bg-slate-800"
                  >
                    {{ head.dropdown_head }}
                  </option>
                </select>
              </div>

              <div v-if="dropdown_head_id_1">
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  Select Value
                </label>
                <select
                  v-model="dropdown_member_id_1"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Value --
                  </option>
                  <option
                    v-for="member in getSelectedMembers(dropdown_head_id_1)"
                    :key="member.id"
                    :value="member.id"
                    class="bg-slate-800"
                  >
                    {{ member.dropdown_member }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Value #2 (Similar structure, just change colors and variable names) -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div
          class="px-8 py-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              <span class="text-white font-bold">2</span>
            </div>
            <h2 class="text-xl font-semibold dark:text-slate-200">Value #2</h2>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-3"
              >Status</label
            >
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_2"
                  type="radio"
                  value="active"
                  class="w-5 h-5 text-purple-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-purple-400 transition-colors"
                  >Active</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_2"
                  type="radio"
                  value="inactive"
                  class="w-5 h-5 text-purple-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-purple-400 transition-colors"
                  >Inactive</span
                >
              </label>
            </div>
          </div>

          <div
            v-if="value_status_2 === 'active'"
            class="space-y-6 pt-4 border-t border-slate-700/30"
          >
            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-2"
                >Name</label
              >
              <input
                v-model="value_name_2"
                type="text"
                placeholder="Enter value name"
                class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-3"
                >Input Type</label
              >
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-purple-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_2"
                    type="radio"
                    value="text"
                    class="w-4 h-4 text-purple-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Text</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-purple-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_2"
                    type="radio"
                    value="number"
                    class="w-4 h-4 text-purple-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Number</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-purple-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_2"
                    type="radio"
                    value="date"
                    class="w-4 h-4 text-purple-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Date</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-purple-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_2"
                    type="radio"
                    value="dropdown"
                    class="w-4 h-4 text-purple-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Dropdown</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-purple-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_2"
                    type="radio"
                    value="ocr"
                    class="w-4 h-4 text-purple-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">OCR (AI)</span>
                </label>
              </div>
            </div>

            <div
              v-if="value_input_type_2 === 'dropdown'"
              class="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
            >
              <h4
                class="text-sm font-semibold dark:text-blue-300 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Dropdown Configuration
              </h4>
              <div>
                <label
                  class="block text-sm font-medium dark:text-slate-300 mb-2"
                  >Select Dropdown Name</label
                >
                <select
                  v-model="dropdown_head_id_2"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Dropdown --
                  </option>
                  <option
                    v-for="head in dropdownData"
                    :key="head.id"
                    :value="head.id"
                    class="bg-slate-800"
                  >
                    {{ head.dropdown_head }}
                  </option>
                </select>
              </div>
              <div v-if="dropdown_head_id_2">
                <label
                  class="block text-sm font-medium dark:text-slate-300 mb-2"
                  >Select Value</label
                >
                <select
                  v-model="dropdown_member_id_2"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Value --
                  </option>
                  <option
                    v-for="member in getSelectedMembers(dropdown_head_id_2)"
                    :key="member.id"
                    :value="member.id"
                    class="bg-slate-800"
                  >
                    {{ member.dropdown_member }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Value #3 (Similar structure, change colors to orange) -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div
          class="px-8 py-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <span class="text-white font-bold">3</span>
            </div>
            <h2 class="text-xl font-semibold dark:text-slate-200">Value #3</h2>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-3"
              >Status</label
            >
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_3"
                  type="radio"
                  value="active"
                  class="w-5 h-5 text-orange-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-orange-400 transition-colors"
                  >Active</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="value_status_3"
                  type="radio"
                  value="inactive"
                  class="w-5 h-5 text-orange-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-orange-400 transition-colors"
                  >Inactive</span
                >
              </label>
            </div>
          </div>

          <div
            v-if="value_status_3 === 'active'"
            class="space-y-6 pt-4 border-t border-slate-700/30"
          >
            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-2"
                >Name</label
              >
              <input
                v-model="value_name_3"
                type="text"
                placeholder="Enter value name"
                class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-3"
                >Input Type</label
              >
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_3"
                    type="radio"
                    value="text"
                    class="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Text</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_3"
                    type="radio"
                    value="number"
                    class="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Number</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_3"
                    type="radio"
                    value="date"
                    class="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Date</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_3"
                    type="radio"
                    value="dropdown"
                    class="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">Dropdown</span>
                </label>
                <label
                  class="flex items-center gap-2 px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/40 transition-all"
                >
                  <input
                    v-model="value_input_type_3"
                    type="radio"
                    value="ocr"
                    class="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600"
                  />
                  <span class="dark:text-slate-300 text-sm">OCR (AI)</span>
                </label>
              </div>
            </div>

            <div
              v-if="value_input_type_3 === 'dropdown'"
              class="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
            >
              <h4
                class="text-sm font-semibold dark:text-blue-300 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Dropdown Configuration
              </h4>
              <div>
                <label
                  class="block text-sm font-medium dark:text-slate-300 mb-2"
                  >Select Dropdown Name</label
                >
                <select
                  v-model="dropdown_head_id_3"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Dropdown --
                  </option>
                  <option
                    v-for="head in dropdownData"
                    :key="head.id"
                    :value="head.id"
                    class="bg-slate-800"
                  >
                    {{ head.dropdown_head }}
                  </option>
                </select>
              </div>
              <div v-if="dropdown_head_id_3">
                <label class="block text-sm font-medium text-slate-300 mb-2"
                  >Select Value</label
                >
                <select
                  v-model="dropdown_member_id_3"
                  class="w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option :value="null" class="bg-slate-800">
                    -- Select Value --
                  </option>
                  <option
                    v-for="member in getSelectedMembers(dropdown_head_id_3)"
                    :key="member.id"
                    :value="member.id"
                    class="bg-slate-800"
                  >
                    {{ member.dropdown_member }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Section -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
      >
        <div
          class="px-8 py-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold dark:text-slate-200">
              Image Configuration
            </h2>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div>
            <label class="block text-sm font-medium dark:text-slate-300 mb-3"
              >Image Status</label
            >
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="image_status"
                  type="radio"
                  value="active"
                  class="w-5 h-5 text-yellow-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-yellow-400 transition-colors"
                  >Active</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  v-model="image_status"
                  type="radio"
                  value="inactive"
                  class="w-5 h-5 text-yellow-500 bg-slate-800 border-slate-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0"
                />
                <span
                  class="dark:text-slate-300 group-hover:text-yellow-400 transition-colors"
                  >Inactive</span
                >
              </label>
            </div>
          </div>

          <div
            v-if="image_status === 'active'"
            class="space-y-6 pt-4 border-t border-slate-700/30"
          >
            <div>
              <label class="block text-sm font-medium dark:text-slate-300 mb-2"
                >Number of Images</label
              >
              <input
                v-model.number="image_number"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            <div v-if="image_number > 0" class="space-y-4">
              <div
                v-for="(desc, index) in image_descriptions"
                :key="index"
                class="p-4 dark:bg-slate-900/40 border-l-4 border-yellow-500 rounded-r-xl"
              >
                <label
                  class="block text-sm font-medium dark:text-slate-300 mb-2"
                >
                  Image #{{ index + 1 }} Description
                </label>
                <input
                  v-model="image_descriptions[index]"
                  type="text"
                  :placeholder="`Description for image ${index + 1}`"
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-end gap-4">
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
          class="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Submit
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
</style>