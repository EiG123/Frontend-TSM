<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { DevManage } from "../../services/dev/DevManage.api";

const router = useRouter();
const loading = ref(false);
const allP = ref([]);

// Modal state
const showModal = ref(false);
const isEditMode = ref(false);
const permissionName = ref("");
const permissionDescription = ref("");
const editingId = ref(null);

onMounted(async () => {
  await loadPermissions();
});

const loadPermissions = async () => {
  loading.value = true;
  try {
    const allPermission = await DevManage.getAllPermission();
    allP.value = allPermission.data.result;
  } catch (error) {
    alert("ไม่สามารถโหลดข้อมูลได้");
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  permissionName.value = "";
  permissionDescription.value = "";
  editingId.value = null;
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditMode.value = true;
  permissionName.value = item.name;
  permissionDescription.value = item.description;
  editingId.value = item.id;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  permissionName.value = "";
  editingId.value = null;
};

const handleSubmit = async () => {
  if (!permissionName.value.trim()) {
    alert("กรุณากรอกชื่อ Permission");
    return;
  }

  try {
    if (isEditMode.value) {
      // Edit
      await DevManage.updatePermission({
        permissionId: editingId.value, 
        permissionName: permissionName.value,
        permissionDescription: permissionDescription.value
      });
      console.log("Update:", editingId.value, permissionName.value);
      alert("แก้ไขสำเร็จ");
    } else {
      // Add
      await DevManage.addPermission({
        permissionName: permissionName.value,
        permissionDescription: permissionDescription.value,
      });
      console.log("Add:", permissionName.value);
      alert("เพิ่มสำเร็จ");
    }
    
    closeModal();
    await loadPermissions();
  } catch (error) {
    alert("เกิดข้อผิดพลาด");
  }
};

const handleDelete = async (id, name) => {
  if (confirm(`คุณต้องการลบ "${name}" หรือไม่?`)) {
    try {
      const resDelete = await DevManage.deletePermission(id);
      alert(resDelete.message);
      await loadPermissions();
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Permission Management</h1>

        <button
          @click="openAddModal"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>Add Permission</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Description
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
              <td colspan="3" class="px-6 py-8 text-center text-gray-500">
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
            <tr v-else-if="!allP.length">
              <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="item in allP"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
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
              {{ isEditMode ? "Edit Permission" : "Add Permission" }}
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
        <form @submit.prevent="handleSubmit" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label
                for="permissionName"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Permission Name <span class="text-red-500">*</span>
              </label>
              <input
                id="permissionName"
                v-model="permissionName"
                type="text"
                placeholder="Enter permission name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />

              <label
                for="permissionDescription"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Permission Description <span class="text-red-500">*</span>
              </label>
              <input
                id="permissionDescription"
                v-model="permissionDescription"
                type="text"
                placeholder="Enter permission Description"
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
            >
              {{ isEditMode ? "Update" : "Add" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>