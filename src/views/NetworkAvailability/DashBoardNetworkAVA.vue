<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { networkAVAManage } from "../../services/network_ava/network_ava.api";
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

const ALL_site = [
  "CMI1000",
  "CMI0010",
  "CMI0097",
]

// ─── Composable: useAVAChart ──────────────────────────────────────────────────

function useAVAChart() {
  const chartData = ref<AVADay[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let abortController: AbortController | null = null;

  const fetchData = async (
    params: {
      site_code: string;
      start_date: string;
      end_date: string;
    },
  ) => {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const res = await networkAVAManage.AVAChart(params);
      console.log(res);
      chartData.value = res.data as AVADay[];
    } catch (err: any) {
      if (err.name !== "AbortError") {
        error.value = err.message ?? "Unknown error";
      }
    } finally {
      loading.value = false;
    }
  };

  const stats = computed(() => {
    if (!chartData.value.length) return null;
    const vals = chartData.value.map((d) => d.availability);
    let cal_avg = 0;
    console.log(vals);
    for (let x in vals) {
      // ใช้ parseFloat เพื่อแปลง string ให้เป็นตัวเลขก่อนนำมาบวก
      cal_avg += parseFloat(vals[x]);
      console.log("ผลรวมย่อย:", cal_avg);
    }

    // หารเฉลี่ยหากต้องการหาค่าเฉลี่ย
    cal_avg = cal_avg / Object.keys(vals).length;

    return {
      avg: cal_avg.toFixed(3),
      min: Math.min(...vals).toFixed(3),
      max: Math.max(...vals).toFixed(3),
    };
  });

  onUnmounted(() => abortController?.abort());

  return { chartData, loading, error, fetchData, stats };
}

// ─── Component ────────────────────────────────────────────────────────────────

const { chartData, loading, error, fetchData, stats } = useAVAChart();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// Filters
const siteCode = ref(localStorage.getItem("ava_site_code") ?? "");
const startDate = ref(localStorage.getItem("ava_start_date") ?? "");
const endDate = ref(localStorage.getItem("ava_end_date") ?? "");
const selectedDate = ref<string | null>(null);
const hoveredRow = ref<string | null>(null);

// ─── Availability color helpers ───────────────────────────────────────────────

function getAvailabilityColor(value: number): string {
  if (value < 95) return "#ef4444"; // red-500
  if (value < 99.5) return "#f97316"; // orange-500
  return "#22c55e"; // green-500
}

function getAvailabilityBadgeClass(value: number): string {
  if (value < 95) return "bg-red-100 text-red-700 border border-red-200";
  if (value < 99.5)
    return "bg-orange-100 text-orange-700 border border-orange-200";
  return "bg-green-100 text-green-700 border border-green-200";
}

// ─── Date shortcuts ───────────────────────────────────────────────────────────

function setDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  endDate.value = end.toISOString().split("T")[0];
  startDate.value = start.toISOString().split("T")[0];
}

// ─── Fetch + persist ──────────────────────────────────────────────────────────

const handleFetch = async () => {
  if (!siteCode.value) return;
  localStorage.setItem("ava_site_code", siteCode.value);
  localStorage.setItem("ava_start_date", startDate.value);
  localStorage.setItem("ava_end_date", endDate.value);
  selectedDate.value = null;

  await fetchData({
    site_code: siteCode.value,
    start_date: startDate.value,
    end_date: endDate.value,
  });

  renderChart();
};

// ─── Chart ────────────────────────────────────────────────────────────────────

// คำนวณ y-axis range แบบ dynamic — ขยาย padding รอบ min/max จริง
function calcYRange(values: number[]): { min: number; max: number } {
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const spread = dataMax - dataMin;

  // ถ้าข้อมูลเกาะกัน (spread < 1) ให้ขยาย padding ออก ±0.5 อย่างน้อย
  const padding = Math.max(spread * 0.4, 0.5);

  const yMin = Math.max(0, Math.floor((dataMin - padding) * 10) / 10);
  const yMax = Math.min(100, Math.ceil((dataMax + padding) * 10) / 10);

  return { min: yMin, max: yMax };
}

const dynamicHeight = Math.min(500, Math.max(300, chartData.value.length * 20));

const buildChartConfig = (): Chart["config"] => {
  const labels = chartData.value.map((d) => d.date);
  const values = chartData.value.map((d) => d.availability);
  const { min: yMin, max: yMax } = calcYRange(values);

  const pointColors = chartData.value.map((d) => {
    if (d.date === selectedDate.value) return "#6366f1";
    return getAvailabilityColor(d.availability);
  });

  const pointRadius = chartData.value.map((d) =>
    d.date === selectedDate.value ? 8 : 4
  );

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Availability (%)",
          data: values,
          tension: 0.4,
          pointBackgroundColor: pointColors,
          pointRadius,
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
      maintainAspectRatio: false, // 🔥 สำคัญมาก
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            callback: (v) => `${v}%`,
            font: { family: "monospace" },
            // จำนวน tick สูงสุด ป้องกัน tick ถี่เกินไปตอน range แคบ
            maxTicksLimit: 6,
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "monospace", size: 11 } },
        },
      },
      onClick: (_evt, elements) => {
        if (!elements.length) return;
        const clicked = chartData.value[elements[0].index];
        selectedDate.value =
          selectedDate.value === clicked.date ? null : clicked.date;
        renderChart();
      },
      plugins: {
        tooltip: {
          backgroundColor: "#1e1b4b",
          titleFont: { family: "monospace", size: 12 },
          bodyFont: { family: "monospace", size: 11 },
          callbacks: {
            afterBody: (ctx) => {
              const incidents =
                chartData.value[ctx[0].dataIndex].incidents ?? [];
              if (!incidents.length) return ["", "✓ No incidents"];
              return ["", ...incidents.map((x) => `⚠ ${x.subject}`)];
            },
          },
        },
      },
    },
  } as unknown as Chart["config"];
};

// ─── Clear filter ─────────────────────────────────────────────────────────────

const clearIncidentFilter = () => {
  selectedDate.value = null;
  renderChart();
};

const clearFilter = () => {
  selectedDate.value = null;
  renderChart();
};

const renderChart = () => {
  if (!canvasRef.value || !chartData.value.length) return;
  if (chart) chart.destroy();
  chart = new Chart(canvasRef.value, buildChartConfig());
};

onUnmounted(() => chart?.destroy());

// ─── Incident table ───────────────────────────────────────────────────────────

const incidentTable = computed<(Incident & { date: string })[]>(() => {
  const rows: (Incident & { date: string })[] = [];
  for (const day of chartData.value) {
    if (selectedDate.value && day.date !== selectedDate.value) continue;
    for (const inc of day.incidents ?? []) {
      rows.push({ date: day.date, ...inc });
    }
  }
  return rows;
});

// ─── Export CSV ───────────────────────────────────────────────────────────────

const exportCSV = () => {
  const header = ["Date", "Subject", "Start", "End"];
  const rows = incidentTable.value.map((r) => [
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
  a.download = `incidents_${siteCode.value}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const formatToReadable = (isoString) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
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
          <span>&gt;99.5% / &lt;99.5% / &lt;95%</span>
        </div>
      </div>

      <!-- ── Filter Card ── -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div class="flex flex-wrap gap-3 items-end">
          <!-- Site Code -->
          <div class="flex flex-col gap-1">
            <label
              class="text-xs text-slate-500 font-semibold uppercase tracking-wide"
              >Site Code</label
            >
            <input
              v-model="siteCode"
              placeholder="e.g. CNX123"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36"
            />
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
            :disabled="loading || !siteCode"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-semibold"
          >
            {{ loading ? "Loading..." : "Load" }}
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

      <!-- ── Skeleton loading ── -->
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

      <!-- ── Empty state ── -->
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

      <!-- ── Content (only when data exists) ── -->
      <template v-else-if="chartData.length">
        <!-- Stats bar -->
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
          <div
            class="h-[320px] md:h-[380px] lg:h-[420px]"
            :style="{ height: dynamicHeight + 'px' }"
          >
            <canvas ref="canvasRef"></canvas>
          </div>
        </div>

        <!-- Incident table -->
        <div
          v-if="incidentTable.length"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-slate-100"
          >
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-bold text-slate-700">Incidents</h3>
              <span
                class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
              >
                {{ incidentTable.length }} record{{
                  incidentTable.length > 1 ? "s" : ""
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
              <button
                v-if="selectedDate"
                @click="clearIncidentFilter"
                class="text-xs px-2 py-1 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition"
              >
                Clear Filter
              </button>
            </div>
            <button
              @click="exportCSV"
              class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-slate-500 flex items-center gap-1.5"
            >
              ↓ Export CSV
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="text-xs uppercase tracking-widest text-slate-400 bg-slate-50"
                >
                  <th class="px-5 py-3 text-left font-semibold">Date</th>
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
                  v-for="(row, i) in incidentTable"
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
                  <td class="px-5 py-3">
                    <span
                      :class="[
                        'text-xs px-2 py-0.5 rounded-full font-mono',
                        getAvailabilityBadgeClass(
                          chartData.find((d) => d.date === row.date)
                            ?.availability ?? 100
                        ),
                      ]"
                    >
                      {{ row.date }}
                    </span>
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
        </div>

        <!-- No incidents message -->
        <div
          v-else
          class="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-8 text-center text-slate-400 text-sm"
        >
          ✓ No incidents
          <span v-if="selectedDate"> on {{ selectedDate }}</span>
        </div>
      </template>
    </div>
  </div>
</template>