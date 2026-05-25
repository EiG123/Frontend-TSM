<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { DevManage } from "../../services/dev/DevManage.api";

const router = useRouter();

const loading = ref(false);
const RoleList = ref([]);
const company = ref("");
const searchQuery = ref("");

// Modal state
const showModal = ref(false);
const roleName = ref("");
const roleDescription = ref("");

const openAddModal = () => {
  roleName.value = "";
  roleDescription.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  roleName.value = "";
  roleDescription.value = "";
};

const loadData = async () => {
  loading.value = true;
  try {
    const resRole = await DevManage.getAllRole();
    RoleList.value = resRole.data.result;
    console.log(resRole.data.result);
  } catch (error) {
    alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
});

// Filter users by company and search query
const filteredUsers = computed(() => {
  let filtered = RoleList.value;

  // Filter by company
  // if (company.value) {
  //   filtered = filtered.filter(
  //     (user) => user.company?.toLowerCase() === company.value.toLowerCase()
  //   );
  // }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (RoleList) =>
        RoleList.name?.toLowerCase().includes(query) ||
        RoleList.description?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

const handleEditRole = () => {
  router.push({
    name: "userPermissionEdit",
  });
};

const AddRoleButton = () => {
  openAddModal();
};

const handleAddRole = async () => {
  console.log(roleName.value);
  console.log(roleDescription.value);
  try {
    const AddRes = await DevManage.AddRole({
      roleName: roleName.value,
      roleDescription: roleDescription.value
    });
    alert(AddRes.message);
  }catch (error) {
    alert(error);
  }
  closeModal();
  await loadData();
}

const handleDelete = async (roleId: number, roleName: string) => {
  if (
    confirm(
      `คุณต้องการลบ "${roleName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
    )
  ) {
    try {
      const resMessage = await DevManage.deleteRole({ roleId, roleName });
      if (!resMessage.success) {
        alert(resMessage.message);
      } else {
        alert(resMessage.message);
      }
      // Reload data
      const resUser = await DevManage.getAllRole();
      RoleList.value = resUser.data.result;
    } catch (error) {
      alert("ลบไม่สำเร็จ");
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
            Role Management
          </h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
            จัดการ Role ในระบบ
            <span
              v-if="filteredUsers.length > 0"
              class="font-medium text-blue-600 dark:text-blue-400"
            >
              ({{ filteredUsers.length }} roles)
            </span>
          </p>
          <button
            @click="handleEditRole()"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Edit Permissions
          </button>
          <button
            @click="AddRoleButton()"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Add Role
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Company Filter -->
        <!-- <div class="flex items-center gap-3">
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
        </div> -->

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
            placeholder="Search by name..."
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
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-400 uppercase tracking-wider"
              >
                Description
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
                colspan="4"
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
                colspan="4"
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
                    {{ item.name?.charAt(0).toUpperCase() || "?" }}
                  </div>
                  <span class="font-medium">{{ item.name || "-" }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {{ item.description || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="handleDelete(item.id, item.name)"
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

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">
              Add Role
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
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

        <!-- Modal Body -->
        <form @submit.prevent="handleAddRole" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label
                for="roleName"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Role Name <span class="text-red-500">*</span>
              </label>
              <input
                id="roleName"
                v-model="roleName"
                type="text"
                placeholder="Enter Role Name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />

              <label
                for="roleDescription"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Role Description <span class="text-red-500">*</span>
              </label>
              <input
                id="roleDescription"
                v-model="roleDescription"
                type="text"
                placeholder="Enter Role Description"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>