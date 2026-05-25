<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { DevManage } from "../../services/dev/DevManage.api";

const router = useRouter();

const roles = ref<any[]>([]);
const allPermissions = ref<any[]>([]);
const selectedRole = ref<any>(null);
const selectedPermissions = ref<string[]>([]);

const loading = ref(false);

const loadData = async () => {
  let allRoleWithPermission = await DevManage.getAllRoleWithPermission();
  let allPermission = await DevManage.getAllPermission();

  roles.value = allRoleWithPermission.data.result;
  allPermissions.value = allPermission.data.result;
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadData();
  } catch (error) {
    alert("ไม่สามารถโหลดข้อมูลได้");
  } finally {
    loading.value = false;
  }
});

function selectRole(role: any) {
  selectedRole.value = role;
  // ดึง permission ของ role
  selectedPermissions.value = role.permissions.map((p: any) => p.name);
}

function togglePermission(name: string) {
  if (selectedPermissions.value.includes(name)) {
    selectedPermissions.value = selectedPermissions.value.filter(
      (p) => p !== name
    );
  } else {
    selectedPermissions.value.push(name);
  }
}

async function savePermissions() {
  if (!selectedRole.value) {
    alert("กรุณาเลือก Role ก่อน");
    return;
  }

  try {
    await DevManage.savePermissions({
      roleId: selectedRole.value.id,
      permissions: selectedPermissions.value,
    });
    alert("บันทึกสำเร็จ");
    loadData();
  } catch (error) {
    alert("บันทึกไม่สำเร็จ");
  }
}

const goBack = () => {
  router.back();
};

const goAddPermission = () => {
  router.push({
    name: "AddPermission",
  });
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header Section -->
    <div
      class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-md rounded-lg p-6 mb-6 border border-gray-200 dark:border-slate-700/50"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-slate-200">
            Role Permissions Management
          </h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
            จัดการสิทธิ์การเข้าถึงสำหรับแต่ละ Role
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="goBack()"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <button
            @click="goAddPermission()"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span class="text-lg">+</span>
            Add Permission
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex items-center gap-2 text-gray-500 dark:text-slate-400">
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
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Role List -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-md overflow-hidden"
      >
        <div
          class="px-6 py-4 bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700/50"
        >
          <h2 class="text-lg font-bold text-gray-800 dark:text-slate-200">
            Roles
          </h2>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
            เลือก Role เพื่อจัดการสิทธิ์
          </p>
        </div>

        <div class="p-4 space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-if="!roles.length"
            class="text-center py-8 text-gray-500 dark:text-slate-400"
          >
            ไม่มี Role ในระบบ
          </div>

          <div
            v-else
            v-for="role in roles"
            :key="role.id"
            class="p-4 rounded-lg cursor-pointer transition-all duration-200 border"
            :class="
              selectedRole?.id === role.id
                ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 dark:border-blue-500 shadow-md'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            "
            @click="selectRole(role)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  :class="
                    selectedRole?.id === role.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  "
                >
                  {{ role.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p
                    class="font-medium"
                    :class="
                      selectedRole?.id === role.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-slate-200'
                    "
                  >
                    {{ role.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-slate-400">
                    {{ role.permissions?.length || 0 }} permissions
                  </p>
                </div>
              </div>

              <svg
                v-if="selectedRole?.id === role.id"
                class="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Permission Panel -->
      <div
        class="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-md overflow-hidden"
      >
        <div
          class="px-6 py-4 bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700/50"
        >
          <h2 class="text-lg font-bold text-gray-800 dark:text-slate-200">
            Permissions
          </h2>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
            <span v-if="selectedRole">{{ selectedRole.name }}</span>
            <span v-else>เลือก Role เพื่อจัดการสิทธิ์</span>
          </p>
        </div>

        <div class="p-6">
          <!-- Empty State -->
          <div v-if="!selectedRole" class="text-center py-16">
            <svg
              class="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p class="text-gray-500 dark:text-slate-400 font-medium">
              กรุณาเลือก Role
            </p>
            <p class="text-sm text-gray-400 dark:text-slate-500 mt-1">
              เลือก Role จากด้านซ้ายเพื่อจัดการสิทธิ์
            </p>
          </div>

          <!-- Permissions Grid -->
          <div v-else class="space-y-4">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2"
            >
              <label
                v-for="perm in allPermissions"
                :key="perm.id"
                class="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-all border border-gray-200 dark:border-slate-700/50"
                :class="
                  selectedPermissions.includes(perm.name)
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                    : ''
                "
              >
                <input
                  type="checkbox"
                  :value="perm.name"
                  :checked="selectedPermissions.includes(perm.name)"
                  @change="togglePermission(perm.name)"
                  class="w-4 h-4 text-blue-500 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span
                  class="text-sm font-medium flex-1"
                  :class="
                    selectedPermissions.includes(perm.name)
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-slate-300'
                  "
                >
                  {{ perm.name }}
                </span>
              </label>
            </div>

            <!-- Summary -->
            <div
              class="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg"
            >
              <p class="text-sm text-blue-700 dark:text-blue-300">
                <span class="font-medium">{{
                  selectedPermissions.length
                }}</span>
                permissions selected
              </p>
            </div>

            <!-- Save Button -->
            <button
              class="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
              @click="savePermissions"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>