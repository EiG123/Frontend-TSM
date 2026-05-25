<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { networkAVAManage } from "../../services/network_ava/network_ava.api";
import { all_site_list } from "./ALL_site_List.ts";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface Incident {
  subject: string;
  start: string;
  end: string;
}

interface AVADay {
  date: string;
  availability: number;
  incidents: Incident[];
}

const ALL_site = all_site_list;

let OFC_problem = 0;
let PEA_MEA_problem = 0;
let other_problem = 0;

function useAVAChart() {
  const chartData = ref<AVADay[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let abortController: AbortController | null = null;

  const fetchData = async (params: {
    site_codes: string[];
    start_date: string;
    end_date: string;
  }) => {
    if (abortController) abortController.abort();
    abortController = new AbortController();
    loading.value = true;
    error.value = null;
    try {
      const res = await networkAVAManage.AVAChartALL_graph(params);
      chartData.value = res.data as AVADay[];
    } catch (err: any) {
      if (err.name !== "AbortError")
        error.value = err.message ?? "Unknown error";
    } finally {
      loading.value = false;
    }
  };

  const stats = computed(() => {
    if (!chartData.value.length) return null;
    const vals = chartData.value.map((d) => d.availability);
    const avg = vals.reduce((a, b) => a + Number(b), 0) / vals.length;
    return {
      avg: avg.toFixed(3),
      min: Math.min(...vals).toFixed(3),
      max: Math.max(...vals).toFixed(3),
    };
  });

  onUnmounted(() => abortController?.abort());
  return { chartData, loading, error, fetchData, stats };
}

const aggregateChartData = computed(() => {
  const grouped: Record<
    string,
    { total: number; count: number; incidents: any[] }
  > = {};
  for (const row of chartData.value) {
    if (!grouped[row.date])
      grouped[row.date] = { total: 0, count: 0, incidents: [] };
    grouped[row.date].total += Number(row.availability);
    grouped[row.date].count += 1;
    if (row.incidents?.length)
      grouped[row.date].incidents.push(...row.incidents);
  }
  return Object.entries(grouped).map(([date, v]) => ({
    date,
    availability: Number((v.total / v.count).toFixed(3)),
    incidents: v.incidents,
  }));
});

const { chartData, loading, error, fetchData, stats } = useAVAChart();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// ─── Filters ──────────────────────────────────────────────────────────────────
const savedSites = localStorage.getItem("ava_site_codes");
const selectedSites = ref<string[]>(savedSites ? JSON.parse(savedSites) : []);
const dropdownOpen = ref(false);
const startDate = ref(localStorage.getItem("ava_start_date") ?? "");
const endDate = ref(localStorage.getItem("ava_end_date") ?? "");
const selectedDate = ref<string | null>(null);
const incidentData = ref<any[]>([]);
const incidentLoading = ref(false);
const hoveredRow = ref<string | null>(null);
const siteSearch = ref("");

// ─── Pagination ───────────────────────────────────────────────────────────────
const currentPage = ref(1);
const pageSize = 10;

const totalPages = computed(() =>
  Math.ceil(incidentData.value.length / pageSize)
);

const pagedIncidents = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return incidentData.value.slice(start, start + pageSize);
});

// page numbers to display (with ellipsis logic)
const pageNumbers = computed(() => {
  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages.value; p++) {
    if (
      p === 1 ||
      p === totalPages.value ||
      Math.abs(p - currentPage.value) <= 1
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
});

watch(incidentData, () => {
  currentPage.value = 1;
});

// ─── Site helpers ─────────────────────────────────────────────────────────────
const fetchIncidents = async (date: string) => {
  OFC_problem = 0;
  PEA_MEA_problem = 0;
  other_problem = 0;
  let regex_power = /Power/gi;
  let regex_ofc = /Fiber/gi;
  let regex_other = /Other/gi;
  try {
    incidentLoading.value = true;
    const res = await networkAVAManage.AVAChartALL_incident({
      site_codes: selectedSites.value,
      date,
    });
    for (let i in res.data) {
      if (regex_power.test(res.data[i].cause)) {
        PEA_MEA_problem += 1;
      } else if (regex_ofc.test(res.data[i].cause)) {
        OFC_problem += 1;
      } else if (regex_other.test(res.data[i].cause)) {
        other_problem += 1;
      }
    }
    incidentData.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    incidentLoading.value = false;
  }
};

function toggleSite(site: string) {
  const idx = selectedSites.value.indexOf(site);
  if (idx === -1) selectedSites.value.push(site);
  else selectedSites.value.splice(idx, 1);
}

function selectAll() {
  selectedSites.value = [...ALL_site];
}
function clearAll() {
  selectedSites.value = [];
}

const siteLabel = computed(() => {
  if (selectedSites.value.length === 0) return "Select site(s)";
  if (selectedSites.value.length === ALL_site.length) return "All sites";
  if (selectedSites.value.length === 1) return selectedSites.value[0];
  return `${selectedSites.value.length} sites selected`;
});

const filteredSites = computed(() => {
  if (!siteSearch.value) return ALL_site.slice(0, 100);
  return ALL_site.filter((s) =>
    s.toLowerCase().includes(siteSearch.value.toLowerCase())
  ).slice(0, 200);
});

// ─── Color helpers ────────────────────────────────────────────────────────────
function getAvailabilityColor(value: number): string {
  if (value < 95) return "#ef4444";
  if (value < 99.5) return "#f97316";
  return "#22c55e";
}

function getAvailabilityBadgeClass(value: number): string {
  if (value < 95) return "bg-red-100 text-red-700 border border-red-200";
  if (value < 99.5)
    return "bg-orange-100 text-orange-700 border border-orange-200";
  return "bg-green-100 text-green-700 border border-green-200";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function setDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  endDate.value = end.toISOString().split("T")[0];
  startDate.value = start.toISOString().split("T")[0];
}

const formatToReadable = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

// ─── Fetch ────────────────────────────────────────────────────────────────────
const handleFetch = async () => {
  if (!selectedSites.value.length) return;
  localStorage.setItem("ava_site_codes", JSON.stringify(selectedSites.value));
  localStorage.setItem("ava_start_date", startDate.value);
  localStorage.setItem("ava_end_date", endDate.value);
  selectedDate.value = null;
  await fetchData({
    site_codes: selectedSites.value,
    start_date: startDate.value,
    end_date: endDate.value,
  });
  renderChart();
};

// ─── Chart ────────────────────────────────────────────────────────────────────
function calcYRange(values: number[]): { min: number; max: number } {
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const spread = dataMax - dataMin;
  const padding = Math.max(spread * 0.4, 0.5);
  return {
    min: Math.max(0, Math.floor((dataMin - padding) * 10) / 10),
    max: Math.min(100, Math.ceil((dataMax + padding) * 10) / 10),
  };
}

const dynamicHeight = computed(() =>
  Math.min(500, Math.max(320, aggregateChartData.value.length * 12))
);

const buildChartConfig = (): Chart["config"] => {
  const labels = aggregateChartData.value.map((d) => d.date);
  const values = aggregateChartData.value.map((d) => d.availability);
  const { min: yMin, max: yMax } = calcYRange(values);

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Availability (%)",
          data: values,
          tension: 0.4,
          pointBackgroundColor: aggregateChartData.value.map((d) =>
            d.date === selectedDate.value
              ? "#6366f1"
              : getAvailabilityColor(d.availability)
          ),
          pointRadius: aggregateChartData.value.map((d) =>
            d.date === selectedDate.value ? 8 : 4
          ),
          pointHoverRadius: 8,
          borderColor: "#6366f1",
          borderWidth: 2,
          fill: true,
          backgroundColor: "rgba(99,102,241,0.07)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            callback: (v) => `${v}%`,
            font: { family: "monospace" },
            maxTicksLimit: 6,
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "monospace", size: 11 } },
        },
      },
      onClick: async (_evt, elements) => {
        if (!elements.length) return;
        const clicked = aggregateChartData.value[elements[0].index];
        if (selectedDate.value === clicked.date) {
          selectedDate.value = null;
          incidentData.value = [];
          renderChart();
          return;
        }
        selectedDate.value = clicked.date;
        renderChart();
        await fetchIncidents(clicked.date);
      },
      plugins: {
        tooltip: {
          backgroundColor: "#1e1b4b",
          titleFont: { family: "monospace", size: 12 },
          bodyFont: { family: "monospace", size: 11 },
          callbacks: {
            afterBody: (ctx) => {
              const incidents =
                aggregateChartData.value[ctx[0].dataIndex].incidents ?? [];
              if (!incidents.length) return ["", "✓ No incidents"];
              return ["", ...incidents.map((x) => `⚠ ${x.subject}`)];
            },
          },
        },
      },
    },
  } as unknown as Chart["config"];
};

const clearIncidentFilter = () => {
  selectedDate.value = null;
  incidentData.value = [];
  renderChart();
};

const renderChart = () => {
  if (!canvasRef.value || !chartData.value.length) return;
  if (chart) chart.destroy();
  chart = new Chart(canvasRef.value, buildChartConfig());
};

onUnmounted(() => chart?.destroy());

// ─── Export CSV ───────────────────────────────────────────────────────────────
const exportCSV = () => {
  const header = ["Date", "Subject", "Start", "End"];
  const rows = incidentData.value.map((r) => [
    r.date,
    r.subject,
    r.start,
    r.end,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `incidents_${selectedSites.value.join("-")}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-mono p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- ── Header ── -->
      <div class="flex items-baseline justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
            Availability Dashboard
          </h1>
          <p class="text-sm text-slate-400 mt-0.5">Network AVA Monitor</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          <span class="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
          <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
          <span>>99.5% / <99.5% / <95%</span>
        </div>
      </div>

      <!-- ── Filter Card ── -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div class="flex flex-wrap gap-3 items-end">
          <!-- Multi-select Site Dropdown -->
          <div class="flex flex-col gap-1 relative">
            <label
              class="text-xs text-slate-500 font-semibold uppercase tracking-wide"
              >Site Code</label
            >
            <button
              type="button"
              @click="dropdownOpen = !dropdownOpen"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48 text-left flex items-center justify-between"
              :class="
                selectedSites.length ? 'text-slate-700' : 'text-slate-400'
              "
            >
              <span>{{ siteLabel }}</span>
              <span class="text-slate-400 ml-2">{{
                dropdownOpen ? "▲" : "▼"
              }}</span>
            </button>

            <div
              v-if="dropdownOpen"
              class="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg w-56 flex flex-col"
              style="max-height: 320px"
            >
              <!-- Actions row -->
              <div
                class="flex gap-2 px-3 py-2 border-b border-slate-100 shrink-0"
              >
                <button
                  @click="selectAll"
                  class="text-xs text-indigo-600 hover:underline"
                >
                  All
                </button>
                <span class="text-slate-300">|</span>
                <button
                  @click="clearAll"
                  class="text-xs text-slate-400 hover:underline"
                >
                  Clear
                </button>
                <span class="ml-auto text-xs text-slate-400"
                  >{{ selectedSites.length }}/{{ ALL_site.length }}</span
                >
              </div>

              <!-- Search -->
              <div class="px-2 py-1.5 border-b border-slate-100 shrink-0">
                <input
                  v-model="siteSearch"
                  placeholder="Search site..."
                  class="w-full px-2 py-1 text-xs border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <!-- Site list -->
              <div class="overflow-y-auto">
                <label
                  v-for="site in filteredSites"
                  :key="site"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedSites.includes(site)"
                    @change="toggleSite(site)"
                    class="accent-indigo-600"
                  />
                  <span class="text-sm text-slate-700 font-mono">{{
                    site
                  }}</span>
                </label>
                <p
                  v-if="filteredSites.length === 0"
                  class="text-xs text-slate-400 px-3 py-2"
                >
                  No results
                </p>
              </div>
            </div>
          </div>

          <!-- Start Date -->
          <div class="flex flex-col gap-1">
            <label
              class="text-xs text-slate-500 font-semibold uppercase tracking-wide"
              >Start</label
            >
            <input
              type="date"
              v-model="startDate"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <!-- End Date -->
          <div class="flex flex-col gap-1">
            <label
              class="text-xs text-slate-500 font-semibold uppercase tracking-wide"
              >End</label
            >
            <input
              type="date"
              v-model="endDate"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <!-- Load button -->
          <button
            @click="handleFetch"
            :disabled="loading || !selectedSites.length"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-semibold"
          >
            {{ loading ? "Loading..." : "Load" }}
          </button>
        </div>

        <!-- ✅ Summary badge แทน tags -->
        <div v-if="selectedSites.length" class="flex items-center gap-2">
          <span
            class="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full"
          >
            {{ siteLabel }}
          </span>
          <button
            @click="clearAll"
            class="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear all ×
          </button>
        </div>

        <!-- Date shortcut buttons -->
        <div class="flex gap-2 flex-wrap">
          <span class="text-xs text-slate-400 self-center">Quick range:</span>
          <button
            v-for="d in [7, 30, 90]"
            :key="d"
            @click="setDateRange(d)"
            class="text-xs px-3 py-1 rounded-full border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-slate-500"
          >
            Last {{ d }} days
          </button>
        </div>
      </div>

      <!-- ── Error ── -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
      >
        <span>⚠</span> {{ error }}
      </div>

      <!-- ── Skeleton ── -->
      <template v-if="loading">
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
        >
          <div class="h-4 bg-slate-100 rounded w-32 mb-4"></div>
          <div class="h-56 bg-slate-100 rounded-xl"></div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse"
          >
            <div class="h-3 bg-slate-100 rounded w-16 mb-2"></div>
            <div class="h-7 bg-slate-100 rounded w-24"></div>
          </div>
        </div>
      </template>

      <!-- ── Empty ── -->
      <div
        v-else-if="!chartData.length && !error"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center"
      >
        <div class="text-5xl mb-4">📡</div>
        <p class="text-slate-500 font-semibold">No data yet</p>
        <p class="text-slate-400 text-sm mt-1">
          Enter a site code and date range, then click Load
        </p>
      </div>

      <!-- ── Content ── -->
      <template v-else-if="chartData.length">
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="(val, key) in stats"
            :key="key"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
          >
            <p
              class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1"
            >
              {{ key }}
            </p>
            <p
              class="text-2xl font-bold"
              :class="{
                'text-red-500': Number(val) < 95,
                'text-orange-500': Number(val) >= 95 && Number(val) < 99.5,
                'text-green-500': Number(val) >= 99.5,
              }"
            >
              {{ val }}<span class="text-sm font-normal text-slate-400">%</span>
            </p>
          </div>
        </div>

        <!-- Chart -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p
            class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4"
          >
            Availability (%) — click a point to filter incidents
          </p>
          <div :style="{ height: dynamicHeight + 'px' }">
            <canvas ref="canvasRef"></canvas>
          </div>
        </div>

        <div>OFC Promble {{ OFC_problem }}</div>
        <div>PEA ไฟฟ้าดับ {{ PEA_MEA_problem }}</div>
        <div>ปัญหาอื่นๆ {{ other_problem }}</div>

        <!-- ── Incident table ── -->
        <div
          v-if="incidentData.length"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <!-- Table header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-slate-100"
          >
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-bold text-slate-700">Incidents</h3>
              <span
                class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
              >
                {{ incidentData.length }} record{{
                  incidentData.length > 1 ? "s" : ""
                }}
              </span>
              <span
                v-if="selectedDate"
                class="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {{ selectedDate }}
                <button
                  @click="clearIncidentFilter"
                  class="hover:text-indigo-800 font-bold"
                >
                  ×
                </button>
              </span>
            </div>
            <button
              @click="exportCSV"
              class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-slate-500 flex items-center gap-1.5"
            >
              ↓ Export CSV
            </button>
          </div>

          <!-- Table body -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="text-xs uppercase tracking-widest text-slate-400 bg-slate-50"
                >
                  <th class="px-5 py-3 text-left font-semibold">Site</th>
                  <th class="px-5 py-3 text-left font-semibold">Ticket</th>
                  <th class="px-5 py-3 text-left font-semibold">Severity</th>
                  <th class="px-5 py-3 text-left font-semibold">Subject</th>
                  <th class="px-5 py-3 text-left font-semibold">Cause</th>
                  <th class="px-5 py-3 text-left font-semibold">Problem</th>
                  <th class="px-5 py-3 text-left font-semibold">Remedy</th>
                  <th class="px-5 py-3 text-left font-semibold">Fault Date</th>
                  <th class="px-5 py-3 text-left font-semibold">
                    Restoration Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in pagedIncidents"
                  :key="i"
                  @mouseenter="hoveredRow = row.date"
                  @mouseleave="hoveredRow = null"
                  :class="[
                    'border-t border-slate-50 transition-colors cursor-default',
                    hoveredRow === row.date
                      ? 'bg-indigo-50'
                      : 'hover:bg-slate-50',
                  ]"
                >
                  <td class="px-5 py-3 text-slate-700">
                    {{ row.site || "Unknown" }}
                  </td>
                  <td class="px-5 py-3 text-slate-700">{{ row.ticket }}</td>
                  <td class="px-5 py-3 text-slate-700">{{ row.severity }}</td>
                  <td class="px-5 py-3 text-slate-700">{{ row.subject }}</td>
                  <td class="px-5 py-3 text-slate-700">{{ row.cause }}</td>
                  <td class="px-5 py-3 text-slate-700">{{ row.problem }}</td>
                  <td class="px-5 py-3 text-slate-700">{{ row.remedy }}</td>
                  <td class="px-5 py-3 text-slate-500 text-xs">
                    {{ formatToReadable(row.fault_datetime) }}
                  </td>
                  <td class="px-5 py-3 text-slate-500 text-xs">
                    {{ formatToReadable(row.restoration_datetime) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ✅ Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500"
          >
            <span>
              Showing {{ (currentPage - 1) * pageSize + 1 }}–{{
                Math.min(currentPage * pageSize, incidentData.length)
              }}
              of {{ incidentData.length }}
            </span>
            <div class="flex items-center gap-1">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-2 py-1 rounded border border-slate-200 disabled:opacity-30 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                ‹ Prev
              </button>

              <template v-for="p in pageNumbers" :key="p">
                <span v-if="p === '...'" class="px-1.5 text-slate-400">…</span>
                <button
                  v-else
                  @click="currentPage = p"
                  :class="[
                    'px-2.5 py-1 rounded border transition-colors',
                    p === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600',
                  ]"
                >
                  {{ p }}
                </button>
              </template>

              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-2 py-1 rounded border border-slate-200 disabled:opacity-30 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>

        <!-- No incidents -->
        <div
          v-else
          class="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-8 text-center text-slate-400 text-sm"
        >
          ✓ No incidents<span v-if="selectedDate"> on {{ selectedDate }}</span>
        </div>
      </template>
    </div>
  </div>
</template>