<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { pmDropdownManage } from "../../../services/PmTitle/pmDropdownManage.api";

const router = useRouter();
const route = useRoute();
const Id = ref(route.params.id as string);
const goNew = (id: any) => router.push(`/pm_dropdown_member_add/${id}`);

const loading = ref(false);
const pmDropDown = ref([]);

// ===== lifecycle =====
onMounted(async () => {
  loading.value = true;
  try {
    const res = await pmDropdownManage.getDropdownMemberById(Id.value);
    pmDropDown.value = res.data.result;
  } catch {
    alert("ไม่เจอ API getAllPmTitle");
  } finally {
    loading.value = false;
  }
});

const handleDelete = async (id: number) => {
  const confirmed = window.confirm("คุณต้องการลบ DropdownMember นี้ใช่หรือไม่?");

  if (!confirmed) return;

  loading.value = true;

  try {
    await pmDropdownManage.deleteDropdownMemberById(id);
    window.location.reload();
  } catch (error) {
    alert("ไม่สามารถลบข้อมูลได้");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header Section -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Dropdown Settings</h1>

        <button
          @click="goNew(Id)"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>New Dropdown Member</span>
        </button>
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
                DROPDOWN NAME
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
            <tr v-else-if="!pmDropDown.length">
              <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="item in pmDropDown"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                @click="goPMDropdown(item.id)"
              >
                [{{ item.id }}] {{ item.dropdown_member }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
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