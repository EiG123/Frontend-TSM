<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {DevManage} from "../../services/dev/DevManage.api";

const router = useRouter();

const loading = ref(false);
const UserList = ref([]);
const company = ref("");
const searchQuery = ref("");

onMounted(async () => {
  loading.value = true;
  try {
    const resUser = await DevManage.getAllUser();
    UserList.value = resUser.data.result;
  } catch (error) {
    alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  } finally {
    loading.value = false;
  }
});

// Filter users by company and search query
const filteredUsers = computed(() => {
  let filtered = UserList.value;

  // Filter by company
  if (company.value) {
    filtered = filtered.filter(
      (user) => user.company?.toLowerCase() === company.value.toLowerCase()
    );
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

const handleEdit = (userId: number) => {
  router.push({
    path: "/dev/userEdit",
    query: {
      id: userId,
    },
  });
};

const handleDelete = async (userId: number, username: string) => {
  if (
    confirm(
      `คุณต้องการลบผู้ใช้ "${username}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
    )
  ) {
    try {
      await DevManage.deleteUserById(userId);
      // Reload data after delete
      router.go(0);
      alert("ลบผู้ใช้สำเร็จ");
    } catch (error) {
      alert("ลบผู้ใช้ไม่สำเร็จ");
    }
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header Section -->
    <div
      class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-md rounded-lg p-6 mb-6 border border-gray-200 dark:border-slate-700/50"
    >
      <div
        class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-slate-200">
            User Management For Developer
          </h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
            จัดการผู้ใช้งานในระบบสำหรับ Developer
            <span
              v-if="filteredUsers.length > 0"
              class="font-medium text-blue-600 dark:text-blue-400"
            >
              ({{ filteredUsers.length }} ผู้ใช้)
            </span>
          </p>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Company Filter -->
        <div class="flex items-center gap-3">
          <label
            class="text-sm font-medium text-gray-700 dark:text-slate-300 min-w-[80px]"
          >
            Company:
          </label>
          <select
            v-model="company"
            class="flex-1 px-4 py-2 bg-white dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 text-gray-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">All Companies</option>
            <option value="true">TRUE</option>
            <option value="bbtec">BBTEC</option>
            <option value="ww">WW</option>
          </select>
        </div>

        <!-- Search -->
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by username, email, or phone..."
            class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div
      class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700/50"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead
            class="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700/50"
          >
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Username
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-slate-800/20 divide-y divide-gray-200 dark:divide-slate-700/30"
          >
            <!-- Loading State -->
            <tr v-if="loading">
              <td
                colspan="8"
                class="px-6 py-8 text-center text-gray-500 dark:text-slate-400"
              >
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
            <tr v-else-if="!filteredUsers.length">
              <td
                colspan="8"
                class="px-6 py-8 text-center text-gray-500 dark:text-slate-400"
              >
                <div class="flex flex-col items-center">
                  <svg
                    class="w-12 h-12 text-gray-400 dark:text-slate-500 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p class="font-medium text-gray-700 dark:text-slate-300">
                    No roles found
                  </p>
                  <p class="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="item in filteredUsers"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300 font-mono"
              >
                {{ item.id }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-xs"
                  >
                    {{ item.username?.charAt(0).toUpperCase() || "?" }}
                  </div>
                  <span class="font-medium">{{ item.username || "-" }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {{ item.email }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {{ item.phone || "-" }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                <span
                  class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400"
                >
                  {{ item.company?.toUpperCase() || "-" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    item.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ item.role?.toUpperCase() || "USER" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors',
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200',
                  ]"
                >
                  {{ item.status === "active" ? "Active" : "Inactive" }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="handleEdit(item.id)"
                    class="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(item.id, item.username)"
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