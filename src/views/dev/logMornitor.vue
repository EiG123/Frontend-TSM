<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { logManage } from "../../services/dev/logManage.api";

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  action: string;
  detail: string;
  endpoint: string;
  method: string;
  success: boolean;
  created_at: string;
}

const loading = ref(false);
const logs = ref<AuditLog[]>([]);

// ── Thai Buddhist Era Date Picker ──────────────────────────────
const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const currentBEYear = new Date().getFullYear() + 543;

// years to show: last 5 years up to current BE year
const beYears = Array.from({ length: 6 }, (_, i) => currentBEYear - 5 + i);

const startDate = reactive({ day: "", month: "", year: "" });
const endDate = reactive({ day: "", month: "", year: "" });

// Convert BE picker → ISO date string (YYYY-MM-DD) for API
function beToISO(d: typeof startDate): string {
  if (!d.year || !d.month) return "";
  const ceYear = parseInt(d.year) - 543;
  const mm = String(d.month).padStart(2, "0");
  const dd = d.day ? String(d.day).padStart(2, "0") : "01";
  return `${ceYear}-${mm}-${dd}`;
}

// Days in month — uses CE year for leap year logic
function daysInMonth(month: string, beYear: string): number {
  if (!month || !beYear) return 31;
  const ceYear = parseInt(beYear) - 543;
  return new Date(ceYear, parseInt(month), 0).getDate();
}

const startDays = computed(() =>
  Array.from(
    { length: daysInMonth(startDate.month, startDate.year) },
    (_, i) => i + 1
  )
);
const endDays = computed(() =>
  Array.from(
    { length: daysInMonth(endDate.month, endDate.year) },
    (_, i) => i + 1
  )
);
// ──────────────────────────────────────────────────────────────

const filters = reactive({
  keyword: "",
  user_id: "",
  username: "",
  email: "",
  action: "",
  start_date: "",
  end_date: "",
});

const fetchLogs = async () => {
  // Sync BE picker → filters before fetch
  filters.start_date = beToISO(startDate);
  filters.end_date = beToISO(endDate);

  try {
    loading.value = true;
    const response = await logManage.getLogs({ ...filters });
    console.log(response.data);
    logs.value = response.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);

const filteredLogs = computed(() =>
  logs.value.filter((log) => {
    const kw = filters.keyword.toLowerCase();
    return (
      (!kw ||
        [log.username, log.email, log.action, log.detail].some((v) =>
          v?.toLowerCase().includes(kw)
        )) &&
      (!filters.user_id || String(log.user_id).includes(filters.user_id)) &&
      (!filters.username ||
        log.username?.toLowerCase().includes(filters.username.toLowerCase())) &&
      (!filters.email ||
        log.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.action ||
        log.action?.toLowerCase().includes(filters.action.toLowerCase()))
    );
  })
);

const formatDate = (date: string) => new Date(date).toLocaleString("th-TH");

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  POST: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PUT: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PATCH: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  DELETE: "bg-red-50 text-red-700 ring-1 ring-red-200",
};
const getMethodClass = (method: string) =>
  METHOD_STYLES[method] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200";

// shared select class
const SELECT_CLS =
  "border border-gray-200 rounded-lg bg-white text-sm text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent " +
  "transition py-2 px-2";

const formatJsonPreview = (data: any) => {
  if (!data) return "-";

  try {
    const text = JSON.stringify(data);

    if (text.length > 60) {
      return text.slice(0, 60) + "...";
    }

    return text;
  } catch {
    return "-";
  }
};

const selectedJson = ref<any>(null);

const modalTitle = ref("");

const openJsonModal = (title: string, data: any) => {
  modalTitle.value = title;

  selectedJson.value = data;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 font-sans">
    <!-- ── HEADER ─────────────────────────────────────── -->
    <div class="mb-7 flex items-center gap-3">
      <div
        class="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md"
      >
        <svg
          class="size-5 text-white"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12h6m-3-3v6M4.5 19.5l15-15M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
          />
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          Audit Log Monitor
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Monitor all user activities and system actions
        </p>
      </div>
    </div>

    <!-- ── FILTER CARD ────────────────────────────────── -->
    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-5">
      <p
        class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4"
      >
        Filters
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- KEYWORD -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Keyword</label>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Search anything…"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <!-- USER ID -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">User ID</label>
          <input
            v-model="filters.user_id"
            type="text"
            placeholder="e.g. 42"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <!-- USERNAME -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Username</label>
          <input
            v-model="filters.username"
            type="text"
            placeholder="Username"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <!-- EMAIL -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Email</label>
          <input
            v-model="filters.email"
            type="text"
            placeholder="user@email.com"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <!-- ACTION -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Action</label>
          <input
            v-model="filters.action"
            type="text"
            placeholder="UPLOAD / DELETE / UPDATE"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <!-- START DATE (BE) -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">
            วันที่เริ่ม <span class="text-gray-300">(พ.ศ.)</span>
          </label>
          <div class="flex gap-1.5">
            <!-- วัน -->
            <select v-model="startDate.day" :class="SELECT_CLS" class="w-16">
              <option value="">วัน</option>
              <option v-for="d in startDays" :key="d" :value="d">
                {{ d }}
              </option>
            </select>
            <!-- เดือน -->
            <select
              v-model="startDate.month"
              :class="SELECT_CLS"
              class="flex-1"
            >
              <option value="">เดือน</option>
              <option v-for="(m, i) in THAI_MONTHS" :key="i" :value="i + 1">
                {{ m }}
              </option>
            </select>
            <!-- ปี พ.ศ. -->
            <select v-model="startDate.year" :class="SELECT_CLS" class="w-24">
              <option value="">ปี</option>
              <option v-for="y in beYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- END DATE (BE) -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">
            วันที่สิ้นสุด <span class="text-gray-300">(พ.ศ.)</span>
          </label>
          <div class="flex gap-1.5">
            <!-- วัน -->
            <select v-model="endDate.day" :class="SELECT_CLS" class="w-16">
              <option value="">วัน</option>
              <option v-for="d in endDays" :key="d" :value="d">{{ d }}</option>
            </select>
            <!-- เดือน -->
            <select v-model="endDate.month" :class="SELECT_CLS" class="flex-1">
              <option value="">เดือน</option>
              <option v-for="(m, i) in THAI_MONTHS" :key="i" :value="i + 1">
                {{ m }}
              </option>
            </select>
            <!-- ปี พ.ศ. -->
            <select v-model="endDate.year" :class="SELECT_CLS" class="w-24">
              <option value="">ปี</option>
              <option v-for="y in beYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- REFRESH -->
        <div class="flex items-end">
          <button
            @click="fetchLogs"
            class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium rounded-lg px-4 py-2 shadow-sm transition-all duration-150"
          >
            <svg
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 4v5h5M20 20v-5h-5M4.93 9A8 8 0 1118.36 15.07"
              />
            </svg>
            Refresh Logs
          </button>
        </div>
      </div>
    </div>

    <!-- ── STATS ROW ───────────────────────────────────── -->
    <div class="flex items-center gap-3 mb-4 text-sm text-gray-500">
      <span
        class="bg-white ring-1 ring-gray-100 rounded-full px-3 py-1 text-xs font-medium shadow-sm"
      >
        {{ filteredLogs.length }} รายการ
      </span>
      <span v-if="loading" class="text-indigo-500 animate-pulse text-xs"
        >กำลังโหลด…</span
      >
    </div>

    <!-- ── TABLE ──────────────────────────────────────── -->
    <div
      class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-gray-100 text-left">
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                เวลา
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                ผู้ใช้
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                Action
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                Method
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                Endpoint
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                Detail
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                OLD DATA
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                NEW DATA
              </th>
              <th
                class="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
              >
                Status
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="hover:bg-slate-50/70 transition-colors duration-100"
            >
              <!-- TIME -->
              <td
                class="px-4 py-3 whitespace-nowrap text-xs text-gray-500 tabular-nums"
              >
                {{ formatDate(log.created_at) }}
              </td>

              <!-- USER -->
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800 text-sm">
                  {{ log.username }}
                </div>
                <div class="text-xs text-gray-400">{{ log.email }}</div>
                <div class="text-xs text-gray-300 tabular-nums">
                  ID: {{ log.user_id }}
                </div>
              </td>

              <!-- ACTION -->
              <td class="px-4 py-3">
                <span
                  class="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md tracking-wide"
                >
                  {{ log.action }}
                </span>
              </td>

              <!-- METHOD -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-block text-xs font-bold px-2 py-1 rounded-md tracking-wide',
                    getMethodClass(log.method),
                  ]"
                >
                  {{ log.method }}
                </span>
              </td>

              <!-- ENDPOINT -->
              <td
                class="px-4 py-3 font-mono text-xs text-gray-500 max-w-[200px] truncate"
                :title="log.endpoint"
              >
                {{ log.endpoint }}
              </td>

              <!-- DETAIL -->
              <td
                class="px-4 py-3 text-xs text-gray-600 max-w-[220px] truncate"
                :title="log.description"
              >
                {{ log.description }}
              </td>

              <!-- OLD data -->
              <td class="px-4 py-3 text-xs">
                <div
                  class="bg-gray-100 rounded-md px-2 py-1 font-mono text-gray-700 truncate max-w-[220px]"
                >
                  {{ formatJsonPreview(log.old_data) }}
                </div>

                <button
                  v-if="log.old_data"
                  @click="openJsonModal('Old Data', log.old_data)"
                  class="text-blue-600 hover:underline mt-1"
                >
                  View
                </button>
              </td>

              <!-- NEW data -->
              <td class="px-4 py-3 text-xs">
                <div
                  class="bg-gray-100 rounded-md px-2 py-1 font-mono text-gray-700 truncate max-w-[220px]"
                >
                  {{ formatJsonPreview(log.new_data) }}
                </div>

                <button
                  v-if="log.new_data"
                  @click="openJsonModal('New Data', log.new_data)"
                  class="text-blue-600 hover:underline mt-1"
                >
                  View
                </button>
              </td>

              <!-- STATUS -->
              <td class="px-4 py-3">
                <span
                  v-if="log.success"
                  class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-1 rounded-md text-xs font-semibold"
                >
                  <span
                    class="size-1.5 rounded-full bg-emerald-500 inline-block"
                  ></span>
                  SUCCESS
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 bg-red-50 text-red-600 ring-1 ring-red-200 px-2 py-1 rounded-md text-xs font-semibold"
                >
                  <span
                    class="size-1.5 rounded-full bg-red-500 inline-block"
                  ></span>
                  FAILED
                </span>
              </td>
            </tr>

            <!-- LOADING -->
            <tr v-if="loading">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-2 text-gray-400">
                  <svg
                    class="size-5 animate-spin text-indigo-400"
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
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span class="text-sm">กำลังโหลด logs…</span>
                </div>
              </td>
            </tr>

            <!-- EMPTY -->
            <tr v-else-if="filteredLogs.length === 0">
              <td colspan="7" class="text-center py-16 text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <svg
                    class="size-8 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12h6M9 16h6M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                    />
                  </svg>
                  <span class="text-sm">ไม่พบ logs ที่ตรงกับเงื่อนไข</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- JSON MODAL -->
    <div
      v-if="selectedJson"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-white w-[900px] max-h-[80vh] rounded-xl shadow-xl overflow-hidden"
      >
        <!-- HEADER -->
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h2 class="font-bold text-lg">
            {{ modalTitle }}
          </h2>

          <button
            @click="selectedJson = null"
            class="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <!-- CONTENT -->
        <div class="p-5 overflow-auto max-h-[70vh]">
          <pre class="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">{{
            JSON.stringify(selectedJson, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>