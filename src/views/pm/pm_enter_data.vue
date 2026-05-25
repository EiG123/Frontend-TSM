<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import { pmTitleManage } from "../../services/PmTitle/pmTitleManage.api";
import { PMApiService } from "../../services/pm_nodeb.api";
import { useAuthStore } from "../../stores/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

const router = useRouter();
const authStore = useAuthStore();
const username = authStore.currentUser;

// Loading state
const isSubmitting = ref(false);
const loading = ref(false);

const props = defineProps<{
  pmId?: any;
  title_id?: any;
  title_child_id?: any;
  order_number?: any;
}>();

const pmId = computed(() => props.pmId);
const title_id = computed(() => props.title_id);
const title_child_id = computed(() => props.title_child_id);
const order_number = computed(() => props.order_number);

console.log(pmId.value);
const send_order_number = ref(1);
if(order_number.value !== undefined){
  send_order_number.value = order_number.value;
}

const handleCancel = () => {
  router.back();
};

const title_child_value_list = ref<any[]>([]);
const title_child_name = ref("");

// Form data for values
const formData = ref({
  value_1: "",
  value_2: "",
  value_3: "",
});

// Value 1
const value_name_1 = ref("");
const value_status_1 = ref("");
const value_input_type_1 = ref("");

// Value 2
const value_name_2 = ref("");
const value_status_2 = ref("");
const value_input_type_2 = ref("");

// Value 3
const value_name_3 = ref("");
const value_status_3 = ref("");
const value_input_type_3 = ref("");

const status = ref("");

const img_status = ref("");

const img_description = ref<any[]>([]);

const pm_images = ref<any[]>([]);

onMounted(async () => {
  loading.value = true;
  console.log(send_order_number.value);
  try {
    const res_title_child_value = await pmTitleManage.getTitleChildDataByTitle({
      pm_id: pmId.value,
      title_id: title_id.value,
      title_child_id: title_child_id.value,
      order_number: send_order_number.value,
    });

    const data = res_title_child_value.data.result[0] || {};
    title_child_value_list.value = data;
    console.log("Title Child Value:", title_child_value_list.value);

    pm_images.value = title_child_value_list.value.pm_images;

    status.value = data.status || "inactive";

    title_child_name.value = data.title_child_name || "";

    value_name_1.value = data.value_name_1 || "";
    value_status_1.value = data.value_status_1 || "";
    value_input_type_1.value = data.value_input_type_1 || "";

    value_name_2.value = data.value_name_2 || "";
    value_status_2.value = data.value_status_2 || "";
    value_input_type_2.value = data.value_input_type_2 || "";

    value_name_3.value = data.value_name_3 || "";
    value_status_3.value = data.value_status_3 || "";
    value_input_type_3.value = data.value_input_type_3 || "";

    formData.value.value_1 = data.value_1 || "";
    formData.value.value_2 = data.value_2 || "";
    formData.value.value_3 = data.value_3 || "";

    img_status.value = data.img_status || "";
    // ✅ เพิ่มใน onMounted หลัง set img_description
    img_description.value = data.pm_images || [];
    uploadedImages.value = new Array(img_description.value.length).fill(null);
  } catch (error) {
    console.error("Failed to load data:", error);
    alert("Failed to load form data");
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // Validate images
    // if (img_status.value === "active") {
    //   const allUploaded = img_description.value.every(
    //     (_, index) => uploadedImages.value[index] != null
    //   );
    //   if (!allUploaded) {
    //     alert("กรุณาอัปโหลดรูปภาพให้ครบทุกช่อง");
    //     return;
    //   }
    // }

    const form = new FormData();
    form.append("pm_id", pmId.value);
    form.append("title_id", title_id.value);
    form.append("title_child_id", title_child_id.value);
    // form.append('title_image_id', )

    form.append("value_1", formData.value.value_1 ?? "");
    form.append("value_2", formData.value.value_2 ?? "");
    form.append("value_3", formData.value.value_3 ?? "");

    // ส่ง input type ไปด้วยให้หลังบ้าน cast ได้ถูก
    form.append("value_input_type_1", value_input_type_1.value);
    form.append("value_input_type_2", value_input_type_2.value);
    form.append("value_input_type_3", value_input_type_3.value);

    form.append("order_number", send_order_number.value);

    form.append("username", username.username);

    const imagesMeta: any[] = [];

    uploadedImages.value.forEach((file, index) => {
      if (file) {
        imagesMeta.push({
          title_image_id: pm_images.value[index].title_image_id,
          img_number: index + 1,
        });
        form.append("files", file); // key เดียวกันหมด
      }
    });

    form.append("images_meta", JSON.stringify(imagesMeta));

    // แทน console.log(form) ใช้อันนี้แทน
    // for (const [key, value] of form.entries()) {
    //   console.log(key, value);
    // }
    await PMApiService.PmsubmitData(form);

    alert("Data saved successfully!");
    router.back();
  } catch (error) {
    console.error("Submit failed:", error);
    alert("Failed to save data");
  } finally {
    isSubmitting.value = false;
  }
};

// เก็บ file ที่ upload แต่ละรูป
const uploadedImages = ref<(File | null)[]>([]);

const handleImageUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Revoke blob URL เก่าก่อน
  if (img_description.value[index]?.file_path?.startsWith("blob:")) {
    URL.revokeObjectURL(img_description.value[index].file_path);
  }

  // ✅ uploadedImages — แก้ถูกแล้ว
  const newArr = [...uploadedImages.value];
  newArr[index] = file;
  uploadedImages.value = newArr;

  // ✅ img_description — แก้แบบเดียวกัน
  const newImgs = [...img_description.value];
  newImgs[index] = { ...newImgs[index], file_path: URL.createObjectURL(file) };
  img_description.value = newImgs;
};

// Get icon based on input type
const getInputIcon = (inputType: string) => {
  const icons: Record<string, string> = {
    text: "M4 6h16M4 12h16M4 18h16",
    number: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
    date: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    dropdown: "M4 6h16M4 10h16M4 14h16M4 18h16",
    ocr: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  };
  return icons[inputType] || icons.text;
};
</script>

<template>
  <div
    class="min-h-screen bg-red dark:bg-slate-900 from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
  >
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center h-96 animate-fade-in"
    >
      <div
        class="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-slate-400 text-lg">Loading form...</p>
    </div>

    <!-- Main Content -->
    <form
      v-else
      @submit.prevent="handleSubmit"
      class="max-w-4xl mx-auto space-y-6 animate-slide-up"
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

      <!-- Header Section -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div
            class="absolute inset-0 bg-white dark:bg-slate-900"
          ></div>

          <div class="relative px-8 py-6">
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h1
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400"
                >
                  {{ title_child_name }}
                </h1>
                <p class="text-slate-400 mt-1">
                  Enter data for this checklist item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Fields -->
      <div v-if="status === 'active'">
        <div
          class="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
        >
          <div class="p-8 space-y-6">
            <!-- Value 1 -->
            <div v-if="value_status_1 === 'active'" class="space-y-3">
              <label
                class="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <svg
                  class="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getInputIcon(value_input_type_1)"
                  />
                </svg>
                {{ value_name_1 }}
                <span class="text-red-400">*</span>
              </label>

              <!-- Text Input -->
              <div v-if="value_input_type_1 === 'text'">
                <input
                  v-model="formData.value_1"
                  type="text"
                  :placeholder="`Enter ${value_name_1.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Number Input -->
              <div v-else-if="value_input_type_1 === 'number'">
                <input
                  v-model.number="formData.value_1"
                  type="number"
                  :placeholder="`Enter ${value_name_1.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Date Input -->
              <div v-else-if="value_input_type_1 === 'date'">
                <input
                  v-model="formData.value_1"
                  type="date"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Dropdown Input -->
              <div v-else-if="value_input_type_1 === 'dropdown'">
                <select
                  v-model="formData.value_1"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="" class="dark:bg-slate-800">
                    Select an option...
                  </option>
                  <!-- Add options here -->
                </select>
              </div>

              <!-- OCR Input -->
              <div v-else-if="value_input_type_1 === 'ocr'">
                <div class="space-y-3">
                  <input
                    v-model="formData.value_1"
                    type="text"
                    :placeholder="`Enter ${value_name_1.toLowerCase()}`"
                    required
                    class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 dark:text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Scan with OCR
                  </button>
                </div>
              </div>

              <div class="pt-3 border-b border-slate-700/30"></div>
            </div>

            <!-- Value 2 -->
            <div v-if="value_status_2 === 'active'" class="space-y-3">
              <label
                class="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <svg
                  class="w-4 h-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getInputIcon(value_input_type_2)"
                  />
                </svg>
                {{ value_name_2 }}
                <span class="text-red-400">*</span>
              </label>

              <!-- Text Input -->
              <div v-if="value_input_type_2 === 'text'">
                <input
                  v-model="formData.value_2"
                  type="text"
                  :placeholder="`Enter ${value_name_2.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Number Input -->
              <div v-else-if="value_input_type_2 === 'number'">
                <input
                  v-model.number="formData.value_2"
                  type="number"
                  :placeholder="`Enter ${value_name_2.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Date Input -->
              <div v-else-if="value_input_type_2 === 'date'">
                <input
                  v-model="formData.value_2"
                  type="date"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Dropdown Input -->
              <div v-else-if="value_input_type_2 === 'dropdown'">
                <select
                  v-model="formData.value_2"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="" class="dark:bg-slate-800">
                    Select an option...
                  </option>
                  <!-- Add options here -->
                </select>
              </div>

              <!-- OCR Input -->
              <div v-else-if="value_input_type_2 === 'ocr'">
                <div class="space-y-3">
                  <input
                    v-model="formData.value_2"
                    type="text"
                    :placeholder="`Enter ${value_name_2.toLowerCase()}`"
                    required
                    class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 dark:text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Scan with OCR
                  </button>
                </div>
              </div>

              <div class="pt-3 border-b border-slate-700/30"></div>
            </div>

            <!-- Value 3 -->
            <div v-if="value_status_3 === 'active'" class="space-y-3">
              <label
                class="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <svg
                  class="w-4 h-4 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getInputIcon(value_input_type_3)"
                  />
                </svg>
                {{ value_name_3 }}
                <span class="text-red-400">*</span>
              </label>

              <!-- Text Input -->
              <div v-if="value_input_type_3 === 'text'">
                <input
                  v-model="formData.value_3"
                  type="text"
                  :placeholder="`Enter ${value_name_3.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Number Input -->
              <div v-else-if="value_input_type_3 === 'number'">
                <input
                  v-model.number="formData.value_3"
                  type="number"
                  :placeholder="`Enter ${value_name_3.toLowerCase()}`"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Date Input -->
              <div v-else-if="value_input_type_3 === 'date'">
                <input
                  v-model="formData.value_3"
                  type="date"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Dropdown Input -->
              <div v-else-if="value_input_type_3 === 'dropdown'">
                <select
                  v-model="formData.value_3"
                  required
                  class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="" class="dark:bg-slate-800">
                    Select an option...
                  </option>
                  <!-- Add options here -->
                </select>
              </div>

              <!-- OCR Input -->
              <div v-else-if="value_input_type_3 === 'ocr'">
                <div class="space-y-3">
                  <input
                    v-model="formData.value_3"
                    type="text"
                    :placeholder="`Enter ${value_name_3.toLowerCase()}`"
                    required
                    class="w-full px-4 py-3 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 dark:text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Scan with OCR
                  </button>
                </div>
              </div>
            </div>

            <!-- Image Section -->
            <div
              v-if="img_status === 'active'"
              class="space-y-4 pt-3 border-t border-slate-700/30"
            >
              <label
                class="flex items-center gap-2 text-sm font-medium dark:text-slate-300"
              >
                <svg
                  class="w-4 h-4 text-yellow-500"
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
                Images
              </label>

              <div
                v-for="(img, index) in img_description"
                :key="index"
                class="p-4 dark:bg-slate-900/40 border border-slate-700/50 rounded-xl space-y-3"
              >
                <!-- Description label -->
                <p class="text-xs text-slate-400 font-medium">
                  Image #{{ index + 1 }}
                  <span v-if="img.description" class="text-slate-500">
                    — {{ img.description }}</span
                  >
                </p>

                <!-- Preview (ถ้ามี img_url) -->
                <div
                  v-if="img.file_path"
                  class="rounded-lg overflow-hidden border border-slate-700/50"
                >
                  <img
                    :src="
                      img.file_path?.startsWith('blob:')
                        ? img.file_path
                        : BASE_URL + img.file_path
                    "
                    :alt="img.description || `Image ${index + 1}`"
                    class="w-full max-h-60 object-contain bg-slate-900"
                  />
                </div>

                <!-- Upload input -->
                <div class="flex items-center gap-3">
                  <label
                    class="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-medium cursor-pointer"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e) => handleImageUpload(e, index)"
                    />
                  </label>
                  <span class="text-slate-500 text-xs">PNG, JPG, WEBP</span>
                </div>
              </div>

              <!-- Empty state ถ้าไม่มี images -->
              <div
                v-if="img_description.length === 0"
                class="text-center py-6 text-slate-500 text-sm"
              >
                No images configured
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="
                value_status_1 !== 'active' &&
                value_status_2 !== 'active' &&
                value_status_3 !== 'active' &&
                img_status !== 'active'
              "
              class="text-center py-12"
            >
              <svg
                class="w-16 h-16 mx-auto text-slate-600 mb-4"
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
              <p class="text-slate-400 text-lg">No active fields to fill</p>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div
          class="flex flex-col sm:flex-row justify-end gap-4 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
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
            class="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-green-500/20 transition-all duration-300"
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
              Saving...
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
              Save Data
            </span>
          </button>
        </div>
      </div>
    </form>
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