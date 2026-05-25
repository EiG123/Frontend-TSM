<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { pmTitleManage } from "../../services/PmTitle/pmTitleManage.api";

const router = useRouter();

const props = defineProps<{
  pmId?: any;
  title?: any;
  title_id?: any;
  order_number?: any;
}>();

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

const pmId = computed(() => props.pmId);
const title = computed(() => props.title);
const title_id = computed(() => props.title_id);
const order_number = computed(() => props.order_number);

const send_order_number = ref(order_number.value ?? 1);

const loading = ref(false);
const title_child_list = ref<any[]>([]);

const goBack = () => {
  router.back();
};

const collapsedGroups = ref<Record<string, boolean>>({});

const toggleGroup = (groupName: string) => {
  collapsedGroups.value[groupName] = !collapsedGroups.value[groupName];
};

const isOpen = (groupName: string) => !collapsedGroups.value[groupName];

const groupedTitleChild = computed(() => {
  const groups: Record<string, any[]> = {};
  title_child_list.value.forEach((item) => {
    const groupName = item.title_child_name || "Uncategorized";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
  });

  // กรองเฉพาะ group ที่มี item อย่างน้อย 1 ตัวที่ active
  return Object.fromEntries(
    Object.entries(groups).filter(([, items]) =>
      items.some(
        (item) => item.status === "active" || item.img_status === "active"
      )
    )
  );
});

const activeValueCount = computed(() => {
  let count = 0;
  title_child_list.value.forEach((item) => {
    if (item.value_status_1 === "active") count++;
    if (item.value_status_2 === "active") count++;
    if (item.value_status_3 === "active") count++;
  });
  return count;
});

const activeValueCountPerGroup = (items: any[]) => {
  let filled = 0;
  let total = 0;

  items.forEach((item) => {
    // นับ total จาก value_status ที่ active (สิ่งที่ต้องกรอก)
    if (item.value_status_1 === "active") total++;
    if (item.value_status_2 === "active") total++;
    if (item.value_status_3 === "active") total++;

    // นับ filled จาก pm_details ที่มีค่าจริง
    const details = item.pm_details ?? [];
    details.forEach((d: any) => {
      if (d.value_1 !== null && d.value_1 !== undefined && d.value_1 !== "")
        filled++;
      if (d.value_2 !== null && d.value_2 !== undefined && d.value_2 !== "")
        filled++;
      if (d.value_3 !== null && d.value_3 !== undefined && d.value_3 !== "")
        filled++;
    });
  });

  return { filled, total };
};

const loadData = async () => {
  const res = await pmTitleManage.getTitleChildByTitle({
    pm_id: pmId.value,
    title: title.value,
    title_id: title_id.value,
    order_number: send_order_number.value,
  });
  title_child_list.value = res.data.result || [];

  console.log(title_child_list.value);
  // ปิดทุก group เริ่มต้น
  Object.keys(groupedTitleChild.value).forEach((name) => {
    collapsedGroups.value[name] = true;
  });
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadData();
  } catch (error) {
    console.error("Failed to load title child:", error);
  } finally {
    loading.value = false;
  }
});

const handleEnterData = (title_id: any, title_child_id: any) => {
  router.push({
    name: "pm_enter_data",
    query: {
      pmId: pmId.value,
      title_id,
      title_child_id,
      order_number: send_order_number.value,
    },
  });
};
</script>

<template>
  <div class="min-h-screen dark:bg-slate-900 p-4 md:p-8">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center h-96 animate-fade-in"
    >
      <div
        class="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-slate-400 text-lg">Loading checklist...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto space-y-6 animate-slide-up">
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
        <span class="font-medium">Back</span>
      </button>

      <!-- Header Section -->
      <div
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
      >
        <div class="relative">
          <div
            class="absolute inset-0 dark:bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          ></div>
          <div class="relative px-8 py-6">
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h1
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                >
                  {{ title }}
                </h1>
                <p class="text-slate-400 mt-1">
                  {{ Object.keys(groupedTitleChild).length }} categories •
                  {{ title_child_list.length }} items •
                  {{ activeValueCount }} active values
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grouped Title Child List -->
      <div class="space-y-6">
        <div
          v-for="(items, groupName) in groupedTitleChild"
          :key="groupName"
          class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden"
        >
          <!-- Group Header -->
          <div
            v-if="items[0].status === 'active'"
            class="dark:bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-slate-700/50 px-6 py-4 cursor-pointer select-none"
            @click="toggleGroup(String(groupName))"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold dark:text-slate-200">
                    {{ groupName }}
                  </h3>
                  <p class="text-sm text-slate-400 mt-0.5">
                    {{ items.length }}
                    {{ items.length === 1 ? "item" : "items" }}
                  </p>
                </div>
              </div>
              <div
                class="px-3 py-1 rounded-lg text-sm font-semibold border"
                :class="
                  activeValueCountPerGroup(items).filled ===
                  activeValueCountPerGroup(items).total
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                "
              >
                {{ activeValueCountPerGroup(items).filled }} /
                {{ activeValueCountPerGroup(items).total }} items
              </div>

              <!-- เพิ่ม chevron icon ข้างขวา -->
              <svg
                class="w-5 h-5 text-slate-400 transition-transform duration-300"
                :class="{ 'rotate-180': isOpen(String(groupName)) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Wrap content ด้วย transition -->
          <Transition name="accordion">
            <div v-if="isOpen(String(groupName))" class="p-6 space-y-4">
              <!-- Group Items -->
              <div class="p-6 space-y-4">
                <div
                  v-for="(item, itemIndex) in items"
                  :key="itemIndex"
                  class="dark:bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <!-- Item Header -->
                  <div
                    v-if="item.status === 'active'"
                    class="px-6 py-4 bg-gray-400 dark:bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-b border-slate-700/50"
                  >
                    <h4 class="text-lg font-semibold dark:text-slate-200">
                      {{ item.title_child_name }}
                    </h4>
                  </div>

                  <!-- Images Grid -->
                  <div
                    v-if="
                      item.pm_images?.length > 0 && item.img_status === 'active'
                    "
                    class="p-6"
                  >
                    <div
                      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <div
                        v-for="(img, imgIndex) in item.pm_images"
                        :key="imgIndex"
                        class="group relative rounded-xl overflow-hidden border border-slate-700/50 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <div
                          class="aspect-square bg-gray-300 dark:bg-slate-900 overflow-hidden"
                        >
                          <img
                            v-if="img.file_path"
                            :src="
                              img.file_path.startsWith('blob:')
                                ? img.file_path
                                : BASE_URL + img.file_path
                            "
                            :alt="img.description || `Image ${imgIndex + 1}`"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-center text-sm text-slate-400 p-4 border border-dashed border-slate-600"
                          >
                            {{ img.description || "No Image Available" }}
                          </div>
                        </div>

                        <!-- Image Overlay -->
                        <div
                          class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <div class="absolute bottom-0 left-0 right-0 p-3">
                            <p
                              v-if="img.description"
                              class="text-xs text-slate-200 font-medium"
                            >
                              {{ img.description }}
                            </p>
                            <p v-else class="text-xs text-slate-400">
                              Image {{ imgIndex + 1 }}
                            </p>
                          </div>
                        </div>

                        <!-- Image Number Badge -->
                        <div
                          class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center"
                        >
                          <span class="text-xs font-bold text-slate-300">{{
                            imgIndex + 1
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Enter Data Button -->
                  <div
                    v-if="
                      item.status === 'active' || item.img_status === 'active'
                    "
                    class="px-6 pb-6"
                  >
                    <button
                      @click="handleEnterData(item.title_id, item.id)"
                      class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:-translate-y-0.5"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Enter Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="Object.keys(groupedTitleChild).length === 0"
        class="dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg p-12"
      >
        <div class="text-center">
          <div
            class="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-300 mb-2">
            No Checklist Items
          </h3>
          <p class="text-slate-400">No items found for this category</p>
        </div>
      </div>
    </div>
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