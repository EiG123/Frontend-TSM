<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { UserManage } from "../services/user/UserManage.api";

const authStore = useAuthStore();

const userId = computed(() => authStore.user?.id || "ไม่มี ID");
const username = computed(() => authStore.user?.username || "User");
const userEmail = computed(() => authStore.user?.email || "none@none.com");
const userRegion = computed(() => authStore.user?.region || "none");
const userPhone = ref("");
const userCompany = ref("");

const userPassword = ref("");
const userConfirmedPassword = ref("");
const showPassword = ref(false);
const showConfirmedPassword = ref(false);
const NewUsername = ref("");

const loading = ref(false);
const isEditing = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const userData = await UserManage.getProfileData({
      userId: userId.value,
    });
    NewUsername.value = username.value;
    // userRegion.value = userData.region || "R0";
    userPhone.value = userData.phone || "";
    userCompany.value = userData.company || "";
  } catch (error) {
    console.error("Failed to load profile:", error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (userPassword.value && userPassword.value !== userConfirmedPassword.value) {
    alert("รหัสผ่านไม่ตรงกัน");
    return;
  }

  try {
    console.log(NewUsername.value);
    await UserManage.updateProfile({
      userId: userId.value,
      username: NewUsername.value,
      password: userPassword.value,
    });
    alert("บันทึกข้อมูลสำเร็จ");
    isEditing.value = false;
    userPassword.value = "";
    userConfirmedPassword.value = "";
    await loadData();
  } catch (error) {
    alert("บันทึกข้อมูลไม่สำเร็จ");
  }
};

const handleCancel = () => {
  isEditing.value = false;
  userPassword.value = "";
  userConfirmedPassword.value = "";
};

onMounted(async () => {
  console.log("load Data ...");
  await loadData();
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3"
        >
          User Profile
        </h1>
        <p class="text-gray-600 dark:text-slate-400 text-lg">
          Manage your account information
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-16"
      >
        <div
          class="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"
        ></div>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Profile Card -->
        <div
          class="bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden"
        >
          <!-- Card Header -->
          <div
            class="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-gray-200 dark:border-slate-700/50 px-6 py-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                >
                  {{ username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-800 dark:text-slate-200">
                    {{ username }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    {{ userEmail }}
                  </p>
                </div>
              </div>

              <!-- Edit Button -->
              <button
                v-if="!isEditing"
                @click="isEditing = true"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="px-6 py-6 space-y-6">
            <!-- User Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- User ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  User ID
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-300 font-mono text-sm"
                >
                  {{ userId }}
                </div>
              </div>

              <!-- Username -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  Username
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-300"
                >
                  {{ username }}
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  Email
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-300"
                >
                  {{ userEmail }}
                </div>
              </div>

              <!-- Region -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  Region
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg"
                >
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300"
                  >
                    {{ userRegion }}
                  </span>
                </div>
              </div>

              <!-- Phone (if available) -->
              <div v-if="userPhone">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  Phone
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-300 font-mono"
                >
                  {{ userPhone }}
                </div>
              </div>

              <!-- Company (if available) -->
              <div v-if="userCompany">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                  Company
                </label>
                <div
                  class="px-4 py-3 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-300"
                >
                  {{ userCompany.toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Password Change Section (Only when editing) -->
            <div
              v-if="isEditing"
              class="border-t border-gray-200 dark:border-slate-700/50 pt-6 mt-6"
            >
            <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
                Change Username
              </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- New Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                    New Username
                  </label>
                  <div class="relative">
                    <input
                      v-model="NewUsername"
                      placeholder="Enter new Username"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-900/40 border border-gray-300 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    />
                  </div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
                Change Password
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- New Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                    New Password
                  </label>
                  <div class="relative">
                    <input
                      v-model="userPassword"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Enter new password"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-900/40 border border-gray-300 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <svg
                        v-if="!showPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                    Confirm Password
                  </label>
                  <div class="relative">
                    <input
                      v-model="userConfirmedPassword"
                      :type="showConfirmedPassword ? 'text' : 'password'"
                      placeholder="Confirm new password"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-900/40 border border-gray-300 dark:border-slate-700/50 rounded-lg text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      @click="showConfirmedPassword = !showConfirmedPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <svg
                        v-if="!showConfirmedPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 mt-6">
                <button
                  @click="handleCancel"
                  type="button"
                  class="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  @click="handleSave"
                  type="button"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
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

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>