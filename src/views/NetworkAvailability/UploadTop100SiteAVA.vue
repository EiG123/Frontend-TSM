<script setup lang="ts">
import { ref } from "vue";
import { networkAVAManage } from "../../services/network_ava/network_ava.api";

const files = ref<File[]>([]);
const loading = ref(false);
const validating = ref(false);
const importing = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);
const dragActive = ref(false);
const success = ref(false);

const missingSites = ref<any[] | null>(null);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    // ✅ merge แทน replace
    files.value = [...files.value, ...Array.from(target.files)];
    result.value = null;
    error.value = null;
    target.value = ""; // reset input ให้เลือกไฟล์เดิมซ้ำได้
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    files.value = Array.from(e.dataTransfer.files); // ✅ แปลง FileList → File[]
    result.value = null;
    error.value = null;
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = () => {
  dragActive.value = false;
};

const uploadFile = async () => {
  if (!files.value.length) return;

  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    const formData = new FormData();
    for (const file of files.value) {
      formData.append("files[]", file);
    }

    const res = await networkAVAManage.UploadTop100SitesAVA(formData);

    console.log(res);

    if (!res.success) throw new Error("Upload failed");

    result.value = res.data;
    files.value = []; // ✅ reset เป็น array ว่าง
    success.value = true;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const validate = async () => {
  if (!result.value) return;
  validating.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Validation successful!");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    validating.value = false;
  }
};

const importData = async () => {
  if (!result.value) return;
  importing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert("Import successful!");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    importing.value = false;
  }
};

const removeFile = (index: number) => {
  // ✅ ลบทีละไฟล์ด้วย index
  files.value.splice(index, 1);
  if (!files.value.length) {
    result.value = null;
    error.value = null;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3"
        >
          Import Top 100 Sites AVA Data
        </h1>
        <p class="text-gray-600 dark:text-slate-400 text-lg">
          Upload your Top 100 availability data (Excel or CSV)
        </p>
      </div>

      <div class="space-y-6">
        <!-- Upload Section -->
        <div
          class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden"
        >
          <div
            class="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-gray-200 dark:border-slate-700/50 px-6 py-4"
          >
            <h2 class="text-xl font-bold text-gray-800 dark:text-slate-200">
              Upload File
            </h2>
          </div>

          <div class="p-6 space-y-4">
            <!-- Drag & Drop Area -->
            <div
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :class="[
                'border-2 border-dashed rounded-xl p-8 transition-all duration-200',
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-gray-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500',
              ]"
            >
              <div class="text-center">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="mt-4">
                  <label
                    for="file-upload"
                    class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Choose File
                    <!-- เปลี่ยน input ให้รับหลายไฟล์ -->
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.csv"
                      multiple
                      @change="handleFileChange"
                      class="sr-only"
                    />
                  </label>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  or drag and drop
                </p>
                <p class="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  XLSX, CSV up to 10MB
                </p>
              </div>
            </div>

            <!-- Selected File Info -->
            <div v-if="files.length" class="space-y-2">
              <div
                v-for="(file, index) in files"
                :key="index"
                class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-3 flex-1">
                    <div
                      class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0"
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="font-medium text-gray-800 dark:text-slate-200 truncate"
                      >
                        {{ file.name }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-slate-400">
                        {{ formatFileSize(file.size) }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="ml-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Button -->
            <button
              :disabled="!files.length || loading"
              @click="uploadFile"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="loading"
                class="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
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
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {{ loading ? "Uploading..." : "Upload File" }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 animate-shake"
        >
          <div class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <h3 class="font-medium text-red-800 dark:text-red-300">Error</h3>
              <p class="text-sm text-red-700 dark:text-red-400 mt-1">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="success"
          class="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 animate-fade-in"
        >
          <div class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <h3 class="font-medium text-green-800 dark:text-green-300">
                Upload Successful
              </h3>
              <p class="text-sm text-green-700 dark:text-green-400 mt-1">
                File uploaded successfully. You can now validate or import the
                data below.
              </p>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div
          v-if="result?.preview"
          class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden"
        >
          <div
            class="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-gray-200 dark:border-slate-700/50 px-6 py-4"
          >
            <h2 class="text-xl font-bold text-gray-800 dark:text-slate-200">
              Data Preview
            </h2>
            <p class="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {{ result.preview.length }} rows loaded
            </p>
          </div>

          <div class="p-6">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead
                  class="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700/50"
                >
                  <tr>
                    <th
                      v-for="(v, k) in result.preview[0]"
                      :key="k"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      {{ k }}
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-slate-800/20 divide-y divide-gray-200 dark:divide-slate-700/30"
                >
                  <tr
                    v-for="(row, i) in result.preview"
                    :key="i"
                    class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td
                      v-for="(v, k) in row"
                      :key="k"
                      class="px-4 py-3 text-sm text-gray-800 dark:text-slate-300"
                    >
                      {{ v }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 mt-6">
              <button
                @click="validate"
                :disabled="validating"
                class="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  v-if="validating"
                  class="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                {{ validating ? "Validating..." : "Validate" }}
              </button>
              <button
                @click="importData"
                :disabled="importing"
                class="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  v-if="importing"
                  class="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                {{ importing ? "Importing..." : "Import Data" }}
              </button>
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
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-shake {
  animation: shake 0.5s;
}
</style>