<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { pmTitleManage } from "../../../services/PmTitle/pmTitleManage.api";

const router = useRouter();
const goNew = () => router.push("/pm_title_add");
const goBack = () => {
  router.back();
} 
const goTitleChild = (id: string) => router.push(`/pm_title_child/${id}`);

const loading = ref(false);
const pmTitles = ref([]);

const pm_type = ref("pm_nodeb");

// ===== แยก logic ออกมาเป็น function =====
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await pmTitleManage.getAllPmTitle({
      type: pm_type.value,
    });
    pmTitles.value = res.data.result;
    for (let i = 0; i < pmTitles.value.length; i++) {
      const resTitleChild_count = await pmTitleManage.getAllPmTitleChild({
        id: pmTitles.value[i].id,
      });
      console.log(resTitleChild_count)
      pmTitles.value[i].title_child_count =
        resTitleChild_count.data.result.length;
    }
  } catch (err){
    console.log(err);
    alert("ไม่เจอ API getAllPmTitle");
  } finally {
    loading.value = false;
  }
};

// ===== lifecycle =====
onMounted(fetchData);

// ===== watch pm_type เมื่อเปลี่ยนค่าให้ดึงข้อมูลใหม่ =====
watch(pm_type, fetchData);

const handleDelete = async (id: number) => {
  const confirmed = window.confirm("คุณต้องการลบ Tittle นี้หรือไม่?");

  if (!confirmed) return;

  loading.value = true;

  try {
    await pmTitleManage.deleteTitleById(id);
    window.location.reload();
  } catch (error) {
    alert("ไม่สามารถลบ Title นี้ได้");
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
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">
          Title Settings [PM NodeB]
        </h1>

        <button
          @click="goNew"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>New Title</span>
        </button>
      </div>

      <!-- Filter Section -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">PM Menu:</label>
        <select
          v-model="pm_type"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="pm_nodeb">PM NodeB</option>
          <option value="pm_small_node">PM Small Exchange</option>
          <option value="pm_medium_node">PM Medium Exchange</option>
          <option value="pm_boardband">PM Boardband</option>
          <option value="pm_mowing">PM Mowing</option>
          <option value="pm_solar_cell">PM Solar Cell</option>
        </select>
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
                PM Title
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Key
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                PM Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Title Child
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
            <tr v-else-if="!pmTitles.length">
              <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="item in pmTitles"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.rank }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                @click="goTitleChild(item.id)"
              >
                [{{ item.id }}] {{ item.title }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.key || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.title_child_count || "0" }}
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
                    @click="router.push(`/pm_title_edit/${item.id}`)"
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