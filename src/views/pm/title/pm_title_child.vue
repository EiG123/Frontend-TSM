<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { pmTitleManage } from "../../../services/PmTitle/pmTitleManage.api";

const router = useRouter();
const route = useRoute();

const goBack = () => {
  router.back();
};
const goNew = (id: string) => router.push(`/pm_title_child_add/${id}`);

const loading = ref(false);
const pmTitles = ref([]);
const pmTitlesChild = ref([]);

const pmTitleId = ref(route.params.id as string);

// ===== lifecycle =====
onMounted(async () => {
  loading.value = true;
  try {
    const resTitle = await pmTitleManage.getPmTitleById(pmTitleId.value);
    pmTitles.value = resTitle.data.result;

    const resTitleChild = await pmTitleManage.getAllPmTitleChild({
      id: pmTitleId.value,
    });
    pmTitlesChild.value = resTitleChild.data.result;
  } catch {
    alert("ไม่เจอ API getAllPmTitleChild");
  } finally {
    loading.value = false;
  }
});

const goEdit = (title_id: any, title_child_id: any) => {
  router.push({
    name: "pm_title_child_edit",
    query: { title_id: title_id, title_child_id: title_child_id },
  });
};

const handleDelete = async (id: number) => {
  const confirmed = window.confirm("คุณต้องการลบ Tittle Child นี้หรือไม่?");

  if (!confirmed) return;

  loading.value = true;

  try {
    await pmTitleManage.deleteTitleChildById(id);
    window.location.reload();
  } catch (error) {
    alert("ไม่สามารถลบ Title Child นี้ได้");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
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
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ pmTitles.title }}
        </h1>

        <button
          @click="goNew(pmTitles.id)"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>New Title</span>
        </button>
      </div>

      <div class="flex items-center justify-between mb-1">
        {{ pmTitles.description }}
      </div>

      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">PM :</label>
        <div
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
        >
          {{ pmTitles.pm_type }}
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Title Child
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                PM Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Sub Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Value
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <svg
                    class="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>Loading...</span>
                </div>
              </td>
            </tr>

            <!-- No Data State -->
            <tr v-else-if="!pmTitlesChild.length">
              <td colspan="12" class="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="item in pmTitlesChild"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.rank }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                [{{ item.id }}] {{ item.title_child_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.pm_type || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.sub_type || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.pm_detail_count || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ item.status === "active" ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="goEdit(pmTitles.id, item.id)"
                    class="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(item.id)"
                    class="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>