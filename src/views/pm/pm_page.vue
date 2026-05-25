<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { getPmList } from "../../services/pm_nodeb_list.api";
import { pmServiceManage } from "../../services/pmServiceManage.api";
import PmNodebCard from "./pmNodebCard.vue";

import { useAuthStore } from "./../../stores/auth";

const authStore = useAuthStore();

const router = useRouter();
const props = defineProps<{
  type: string;
}>();

let type = computed(() => props.type);
const showType = ref("");
if(type.value === 'pm_nodeb'){
  showType.value = "NodeB";
}
if(type.value === 'pm_small'){
  showType.value = "Small";
}
if(type.value === 'pm_medium'){
  showType.value = "Medium";
}
const goNew = () => router.push({
  name: `pm_nodeb_new`,
  query: {
    type: props.type,
  },
});
const goEdit = (id: string) => router.push(`/pm_nodeb_edit/${id}`);
const goView = (id: string) => router.push({
  name: `pm_site_detail`,
  query: {
    id: id,
    type: props.type,
  },
});
const goBack = () => router.back();

const handleDelete = async (e: Event, id: number) => {
  e.stopPropagation();
  if (!window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;
  loading.value = true;
  try {
    await pmServiceManage.deletePmById(id);
    await loadData();
  } catch {
    alert("ไม่สามารถลบข้อมูลได้");
  } finally {
    loading.value = false;
  }
};

// ===== state =====
const siteList = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const selectedProgress = ref("");
const selectedService = ref("");
const selectedYear = ref("2025/2026");
const currentPage = ref(1);
const pageSize = 10;

const loadData = async () => {
  const res = await getPmList.getPmList({
    type: type.value,
    region: authStore.userRegion,
  });
  siteList.value = res.data;
  console.log(siteList.value);
};

const isMobile = ref(window.innerWidth < 768);

const onResize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(async () => {
  window.addEventListener("resize", onResize);
  loading.value = true;
  try {
    await loadData();
  } catch {
    alert("ไม่เจอ API SiteList");
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => window.removeEventListener("resize", onResize));

watch([searchQuery, selectedYear, selectedProgress, selectedService], () => {
  currentPage.value = 1;
});

const filteredList = computed(() =>
  siteList.value.filter((s) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchSearch =
        (s.site_id ?? "").toLowerCase().includes(q) ||
        (s.site_name ?? "").toLowerCase().includes(q) ||
        (s.region ?? "").toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (selectedProgress.value && s.progress_status !== selectedProgress.value)
      return false;

    if (selectedService.value && s.service_status !== selectedService.value)
      return false;

    return true;
  })
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize))
);
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const fmtDate = (d: string) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));
};

const listVal = (arr: any[], key: string) =>
  arr?.length ? arr.map((i) => i[key] ?? "—").join(", ") : "—";

// badge configs
const serviceBadge: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  onService: { label: "On Service", cls: "badge-green", dot: "dot-green" },
  Cancel: { label: "Cancel", cls: "badge-red", dot: "dot-red" },
};
const progressBadge: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  pending: { label: "Pending", cls: "badge-green", dot: "dot-green" },
  Inprogress: { label: "In Progress", cls: "badge-amber", dot: "dot-amber" },
  checkedin: { label: "Check In", cls: "badge-blue", dot: "dot-blue" },
  checkout: { label: "Check Out", cls: "badge-gray", dot: "dot-gray" },
  cancel: { label: "Cancel", cls: "badge-red", dot: "dot-red" },
};
</script>

<template>
  <div
    class="page-root bg-white dark:bg-slate-900 transition-colors duration-300"
  >
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
    <!-- ── Header ── -->
    <header
      class="page-header bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700/50"
    >
      <div>
        <h1 class="page-title text-gray-900 dark:text-slate-100">
          PM {{showType}} List
        </h1>
        <p class="page-sub text-gray-600 dark:text-slate-400">
          {{ filteredList.length }} sites · {{ selectedYear }}
        </p>
      </div>

      <div class="controls">
        <!-- Year -->
        <select
          v-model="selectedYear"
          class="ctrl-select bg-white dark:bg-slate-800/60 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>2025/2026</option>
          <option>2026/2027</option>
          <option>2027/2028</option>
        </select>

        <!-- Progress filter -->
        <select
          v-model="selectedProgress"
          class="ctrl-select bg-white dark:bg-slate-800/60 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-700/50"
        >
          <option value="">All Progress</option>
          <option value="pending">Pending</option>
          <option value="Inprogress">In Progress</option>
          <option value="checkedin">Check In</option>
          <option value="checkout">Check Out</option>
        </select>

        <!-- Service filter -->
        <select
          v-model="selectedService"
          class="ctrl-select bg-white dark:bg-slate-800/60 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-700/50"
        >
          <option value="">All Service</option>
          <option value="onService">On Service</option>
          <option value="Cancel">Cancel</option>
        </select>

        <!-- Search -->
        <div
          class="search-wrap bg-white dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/50"
        >
          <svg
            class="search-icon text-gray-400 dark:text-slate-500"
            width="14"
            height="14"
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
            placeholder="Site ID / Region…"
            class="search-input bg-transparent text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        <button
          @click="
            selectedProgress = '';
            selectedService = '';
            searchQuery = '';
          "
          class="ctrl-select text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Clear
        </button>

        <!-- New -->
        <button
          @click="goNew"
          class="btn-new bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          New Site PM
        </button>
      </div>
    </header>

    <!-- ── Loading ── -->
    <div v-if="loading" class="state-center">
      <div class="spinner border-blue-500/30 border-t-blue-500"></div>
      <span class="state-text text-gray-600 dark:text-slate-400">Loading…</span>
    </div>

    <!-- ── Content ── -->
    <div v-else class="table-wrap bg-white dark:bg-slate-900">
      <!-- Empty -->
      <div v-if="paginatedList.length === 0" class="state-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 64 64"
          fill="none"
          class="empty-icon text-gray-400 dark:text-slate-600"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M20 32h24M32 20v24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span class="state-text text-gray-600 dark:text-slate-400"
          >ไม่พบข้อมูล</span
        >
      </div>

      <!-- Table -->
      <!-- Mobile: แสดงเมื่อมีข้อมูล + จอเล็ก -->
      <div
        v-if="!loading && paginatedList.length > 0"
        v-show="isMobile"
        class="flex flex-col gap-3"
      >
        <PmNodebCard
          v-for="row in paginatedList"
          :key="row.id"
          :row="row"
          :format-date="fmtDate"
          @view="goView"
          @edit="goEdit"
          @delete="handleDelete"
        />
      </div>
      <!-- Desktop: แสดงเมื่อมีข้อมูล + จอใหญ่ -->
      <div
        v-if="!loading && paginatedList.length > 0"
        v-show="!isMobile"
        class="table-wrap hidden md:block"
      >
        <div class="overflow-x-auto">
          <table
            class="data-table bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200"
          >
            <thead class="bg-gray-50 dark:bg-slate-800/60">
              <tr class="border-b border-gray-200 dark:border-slate-700/50">
                <th class="text-gray-700 dark:text-slate-300">Site</th>
                <th class="text-gray-700 dark:text-slate-300">Cabinets</th>
                <th class="text-gray-700 dark:text-slate-300">Mowing</th>
                <th class="text-gray-700 dark:text-slate-300">Broadband</th>
                <th class="text-gray-700 dark:text-slate-300">SolarCell</th>
                <th class="text-gray-700 dark:text-slate-300">Region</th>
                <th class="text-gray-700 dark:text-slate-300">Province</th>
                <th class="text-gray-700 dark:text-slate-300">Vendor</th>
                <th class="text-gray-700 dark:text-slate-300">Created By</th>
                <th class="text-gray-700 dark:text-slate-300">Created At</th>
                <th class="text-gray-700 dark:text-slate-300">Updated By</th>
                <th class="text-gray-700 dark:text-slate-300">Updated At</th>
                <th class="text-gray-700 dark:text-slate-300">Service</th>
                <th class="text-gray-700 dark:text-slate-300">PM Date</th>
                <th class="text-gray-700 dark:text-slate-300">Progress</th>
                <th class="text-gray-700 dark:text-slate-300">Verify</th>
                <th class="th-actions text-gray-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-slate-700/30">
              <tr
                v-for="row in paginatedList"
                :key="row.id"
                class="data-row hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                @click="goView(row.id)"
              >
                <!-- Site -->
                <td class="td-site">
                  <span
                    class="site-name text-gray-900 dark:text-slate-100 font-medium"
                    >{{ row.site_name || "N/A" }}</span
                  >
                  <span
                    class="site-id text-gray-500 dark:text-slate-500 text-xs"
                    >{{ row.site_id }}</span
                  >
                </td>

                <td class="text-gray-800 dark:text-slate-300">
                  {{ row.cabinets.length }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ listVal(row.mowing, "round") }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ listVal(row.broadband, "count") }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ listVal(row.solarcell, "status") }}
                </td>

                <!-- Region -->
                <td>
                  <span class="cell-region text-gray-700 dark:text-slate-300">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      class="text-blue-500 dark:text-blue-400"
                    >
                      <path
                        d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334z"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path
                        d="M1.333 8h13.334M8 1.333A10.2 10.2 0 0 1 10.667 8 10.2 10.2 0 0 1 8 14.667 10.2 10.2 0 0 1 5.333 8 10.2 10.2 0 0 1 8 1.333z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    {{ row.region || "—" }}
                  </span>
                </td>

                <td class="text-gray-800 dark:text-slate-300">
                  {{ row.province || "—" }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ row.vendor || "—" }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ row.created_by || "—" }}
                </td>
                <td class="td-mono text-gray-700 dark:text-slate-400">
                  {{ fmtDate(row.created_at) }}
                </td>
                <td class="text-gray-800 dark:text-slate-300">
                  {{ row.updated_by || "—" }}
                </td>
                <td class="td-mono text-gray-700 dark:text-slate-400">
                  {{ fmtDate(row.updated_at) }}
                </td>

                <!-- Service Status -->
                <td class="td-center">
                  <span
                    class="badge"
                    :class="
                      serviceBadge[row.service_status]?.cls ?? 'badge-gray'
                    "
                  >
                    <i
                      class="dot"
                      :class="
                        serviceBadge[row.service_status]?.dot ?? 'dot-gray'
                      "
                    ></i>
                    {{ serviceBadge[row.service_status]?.label ?? "Unknown" }}
                  </span>
                </td>

                <td class="td-mono text-gray-700 dark:text-slate-400">
                  {{ fmtDate(row.date) }}
                </td>

                <!-- Progress -->
                <td class="td-center">
                  <span
                    class="badge"
                    :class="
                      progressBadge[row.progress_status]?.cls ?? 'badge-gray'
                    "
                  >
                    <i
                      class="dot"
                      :class="
                        progressBadge[row.progress_status]?.dot ?? 'dot-gray'
                      "
                    ></i>
                    {{
                      progressBadge[row.progress_status]?.label ??
                      row.progress_status
                    }}
                  </span>
                </td>

                <td class="td-center text-gray-800 dark:text-slate-300">
                  {{ row.verify || "—" }}
                </td>

                <!-- Actions -->
                <td class="td-actions" @click.stop>
                  <div class="action-group">
                    <button
                      @click="goView(row.id)"
                      class="act-btn act-view bg-blue-500/10 dark:bg-blue-500/15 hover:bg-blue-500/20 dark:hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      title="View"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="2"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                      </svg>
                    </button>
                    <button
                      @click="goEdit(row.id)"
                      class="act-btn act-edit bg-yellow-500/10 dark:bg-yellow-500/15 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/25 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30"
                      title="Edit"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                    <button
                      @click="handleDelete($event, row.id)"
                      class="act-btn act-del bg-red-500/10 dark:bg-red-500/15 hover:bg-red-500/20 dark:hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30"
                      title="Delete"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state: แสดงเมื่อไม่มีข้อมูล (ทั้ง mobile และ desktop) -->
        <div v-if="!loading && paginatedList.length === 0" class="state-center">
          <span class="state-text text-gray-600 dark:text-slate-400"
            >ไม่พบข้อมูล</span
          >
        </div>

        <!-- Footer -->
        <div
          class="table-footer bg-gray-50 dark:bg-slate-800/60 border-t border-gray-200 dark:border-slate-700/50"
        >
          <span class="footer-count text-gray-700 dark:text-slate-300">
            {{ (currentPage - 1) * pageSize + 1 }}–{{
              Math.min(currentPage * pageSize, filteredList.length)
            }}
            of {{ filteredList.length }}
          </span>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="page-btn bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15l-5-5 5-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <span class="page-info text-gray-700 dark:text-slate-300"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="page-btn bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 15l5-5-5-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ── */
.page-root {
  min-height: 100vh;
  padding: 1.5rem 2rem;
  font-family: "DM Sans", "Noto Sans Thai", sans-serif;
  font-size: 13px;
}
:global(.dark) .page-root {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.page-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ── Controls ── */
.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.ctrl-select,
.search-input {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ctrl-select:focus,
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
:global(.dark) .ctrl-select,
:global(.dark) .search-input {
  border-color: rgba(100, 116, 139, 0.35);
  color: #e2e8f0;
}
.search-wrap {
  position: relative;
  width: 200px;
}
.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.search-input {
  padding-left: 28px;
  width: 100%;
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
.btn-new:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* ── States ── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 12px;
}
.state-text {
  font-size: 13px;
  color: #94a3b8;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.empty-icon {
  color: #cbd5e1;
}

/* ── Table wrapper ── */
.table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* ── Table ── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.data-table thead tr {
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.th-actions {
  text-align: center;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.1s;
}
:global(.dark) .data-row {
  border-bottom-color: rgba(100, 116, 139, 0.15);
}
.data-row:last-child {
  border-bottom: none;
}
.data-row:hover {
  background: rgba(59, 130, 246, 0.04);
}
:global(.dark) .data-row:hover {
  background: rgba(59, 130, 246, 0.07);
}

.data-table td {
  padding: 7px 12px;
  white-space: nowrap;
  vertical-align: middle;
}

/* ── Special cells ── */
.td-site {
  min-width: 130px;
}
.site-name {
  display: block;
  font-weight: 600;
  font-size: 12px;
}

.site-id {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 1px;
}

.td-mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
}

.td-center {
  text-align: center;
}

.cell-region {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #3b82f6;
}

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-green {
  background: #dcfce7;
  color: #15803d;
}
.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}
.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
.badge-amber {
  background: #fef9c3;
  color: #a16207;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-purple {
  background: #ede9fe;
  color: #6d28d9;
}
.badge-slate {
  background: #f1f5f9;
  color: #475569;
}

:global(.dark) .badge-green {
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
}
:global(.dark) .badge-red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
:global(.dark) .badge-gray {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}
:global(.dark) .badge-amber {
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
}
:global(.dark) .badge-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}
:global(.dark) .badge-purple {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}
:global(.dark) .badge-slate {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.dot-green {
  background: #22c55e;
}
.dot-red {
  background: #ef4444;
}
.dot-gray {
  background: #94a3b8;
}
.dot-amber {
  background: #f59e0b;
}
.dot-blue {
  background: #3b82f6;
}
.dot-purple {
  background: #8b5cf6;
}
.dot-slate {
  background: #64748b;
}

/* ── Actions ── */
.td-actions {
  text-align: center;
  padding: 6px 12px;
}
.action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.act-btn:hover {
  transform: translateY(-1px);
}

.act-view {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
}
.act-edit {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.25);
  color: #7c3aed;
}
.act-del {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}
.act-view:hover {
  background: rgba(59, 130, 246, 0.2);
}
.act-edit:hover {
  background: rgba(139, 92, 246, 0.2);
}
.act-del:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ── Footer ── */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid #f1f5f9;
}

.footer-count {
  font-size: 11px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
:global(.dark) .page-btn {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(100, 116, 139, 0.35);
  color: #94a3b8;
}
.page-info {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  min-width: 52px;
  text-align: center;
}
:global(.dark) .page-info {
  color: #94a3b8;
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Animations ── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
