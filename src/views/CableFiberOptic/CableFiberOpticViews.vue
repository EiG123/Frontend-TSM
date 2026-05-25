<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CableFiberOpticManage } from "../../services/CableFiberOptic/CableFiberOpticManage.api";

// ─── Filters ───────────────────────────────────────────────────────────────────
const searchQuery = ref("");
const selectedCableCode = ref<string>("");

// ── Types ──────────────────────────────────────────────
interface CableProperties {
  cable_code: string;
  [key: string]: unknown;
}

interface Cable {
  id?: number | string;
  geom: GeoJSON.LineString | GeoJSON.MultiLineString | null;
  cable_code: string;
  [key: string]: unknown;
}

type CableFeature = GeoJSON.Feature<
  GeoJSON.LineString | GeoJSON.MultiLineString,
  CableProperties
>;

type CableGeom = GeoJSON.LineString | GeoJSON.MultiLineString;

// ── Router ─────────────────────────────────────────────
const router = useRouter();

// ── State ──────────────────────────────────────────────
let map: maplibregl.Map | null = null;
let popup: maplibregl.Popup | null = null;

const isLoading = ref(true);
const error = ref<string | null>(null);
const cables = ref<Cable[]>([]);

// ── Filtered cables (search + select) ──────────────────
const filteredCables = computed(() => {
  let list = cables.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((c) => c.cable_code.toLowerCase().includes(q));
  }
  return list;
});

// Dropdown options derived from all cables (unique cable_code)
const cableOptions = computed(() => {
  const seen = new Set<string>();
  return cables.value
    .filter((c) => {
      if (seen.has(c.cable_code)) return false;
      seen.add(c.cable_code);
      return true;
    })
    .map((c) => ({ label: c.cable_code, value: c.cable_code }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 50);
});

// ── Pagination ─────────────────────────────────────────
const PAGE_SIZE = 20;
const currentPage = ref(1);

// Reset to page 1 when search changes
watch([searchQuery, selectedCableCode], () => {
  currentPage.value = 1;
});

const paginatedSource = computed(() => {
  // If a cable is selected from dropdown, show only that one in the table
  if (selectedCableCode.value) {
    return cables.value.filter((c) => c.cable_code === selectedCableCode.value);
  }
  return filteredCables.value;
});

const totalPages = computed(() =>
  Math.ceil(paginatedSource.value.length / PAGE_SIZE)
);

const pagedCables = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return paginatedSource.value.slice(start, start + PAGE_SIZE);
});

// Show max 7 page buttons with ellipsis
const pageButtons = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (cur > 3) pages.push("…");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
    pages.push(p);
  }
  if (cur < total - 2) pages.push("…");
  pages.push(total);
  return pages;
});

const goToPage = (page: number | "…") => {
  if (typeof page !== "number") return;
  currentPage.value = page;
};

// ── Map init ───────────────────────────────────────────
const initMap = () => {
  map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: [98.9853, 18.7883],
    zoom: 13,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl(), "bottom-left");

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on("load", loadCables);
};

// ── Data ───────────────────────────────────────────────
const loadCables = async () => {
  if (!map) return;

  try {
    isLoading.value = true;
    error.value = null;

    const response = await CableFiberOpticManage.getAllCable();
    cables.value = (response.data ?? []) as Cable[];

    const features: CableFeature[] = cables.value
      .filter((c): c is Cable & { geom: CableGeom } => Boolean(c.geom))
      .map((c) => ({
        type: "Feature" as const,
        geometry: c.geom,
        properties: { cable_code: c.cable_code },
      }));

    // map OLD
    map.addSource("cables", {
      type: "geojson",
      data: { type: "FeatureCollection", features },
    });

    // map NEW
    // map.addSource("cables", {
    //   type: "vector",
    //   tiles: ["https://your-tile-server/cables/{z}/{x}/{y}.pbf"],
    //   minzoom: 0,
    //   maxzoom: 14,
    // });

    // Glow layer
    map.addLayer({
      id: "cables-glow",
      type: "line",
      source: "cables",
      paint: {
        "line-color": "#38bdf8",
        "line-width": 8,
        "line-opacity": 0.2,
        "line-blur": 4,
      },
    });

    // Base layer
    map.addLayer({
      id: "cables-layer",
      type: "line",
      source: "cables",
      paint: {
        "line-color": "#0ea5e9",
        "line-width": 2.5,
        "line-opacity": 0.9,
      },
    });

    // Hover layer
    map.addLayer({
      id: "cables-hover",
      type: "line",
      source: "cables",
      paint: {
        "line-color": "#fbbf24",
        "line-width": 4,
        "line-opacity": 0,
      },
    });

    // Selected highlight layer
    map.addLayer({
      id: "cables-selected",
      type: "line",
      source: "cables",
      filter: ["==", ["get", "cable_code"], ""],
      paint: {
        "line-color": "#f97316",
        "line-width": 5,
        "line-opacity": 1,
      },
    });

    setupInteractions();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to load cable data";
    console.error("[CableMap] loadCables error:", err);
  } finally {
    isLoading.value = false;
  }
};

// ── Watch selectedCableCode → highlight + fly ──────────
watch(selectedCableCode, (code) => {
  if (!map) return;

  if (!code) {
    // Clear highlight
    map.setFilter("cables-selected", ["==", ["get", "cable_code"], ""]);
    return;
  }

  // Update highlight filter
  map.setFilter("cables-selected", ["==", ["get", "cable_code"], code]);

  // Fly to the selected cable's geometry
  const cable = cables.value.find((c) => c.cable_code === code);
  if (!cable?.geom) return;

  const coords: number[][] =
    cable.geom.type === "LineString"
      ? (cable.geom.coordinates as number[][])
      : (cable.geom as GeoJSON.MultiLineString).coordinates.flat();

  if (coords.length === 0) return;

  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const bounds = new maplibregl.LngLatBounds(
    [lngs.length ? Math.min(...lngs) : 0, lats.length ? Math.min(...lats) : 0],
    [lngs.length ? Math.max(...lngs) : 0, lats.length ? Math.max(...lats) : 0]
  );

  map.fitBounds(bounds, { padding: 80, duration: 900, maxZoom: 17 });
});

// ── Clear filters ──────────────────────────────────────
const clearFilters = () => {
  searchQuery.value = "";
  selectedCableCode.value = "";
};

// ── Interactions ───────────────────────────────────────
const setupInteractions = () => {
  if (!map || !popup) return;

  map.on("mousemove", "cables-layer", (e) => {
    if (!map || !popup || !e.features?.length) return;
    map.getCanvas().style.cursor = "pointer";
    const props = e.features[0].properties as CableProperties;
    map.setPaintProperty("cables-hover", "line-opacity", 1);
    popup
      .setLngLat(e.lngLat)
      .setHTML(
        `<div style="font-family:monospace;font-size:13px;padding:4px 10px;background:#0f172a;color:#38bdf8;border-radius:6px;border:1px solid #1e3a5f;">
          📡 ${props.cable_code}
        </div>`
      )
      .addTo(map);
  });

  map.on("mouseleave", "cables-layer", () => {
    if (!map || !popup) return;
    map.getCanvas().style.cursor = "";
    map.setPaintProperty("cables-hover", "line-opacity", 0);
    popup.remove();
  });

  map.on("click", "cables-layer", (e) => {
    if (!map || !e.features?.length) return;
    const props = e.features[0].properties as CableProperties;
    const cable = cables.value.find((c) => c.cable_code === props.cable_code);
    if (cable) goToDetail(cable);
  });
};

// ── Navigate ───────────────────────────────────────────
const goToDetail = (cable: Cable) => {
  router.push({
    name: "CableFiberOpticDetail",
    query: { id: cable.id ?? cable.cable_code },
  });
};

// ── Retry ──────────────────────────────────────────────
const retry = () => {
  if (!map) return;
  ["cables-selected", "cables-hover", "cables-layer", "cables-glow"].forEach(
    (id) => {
      if (map!.getLayer(id)) map!.removeLayer(id);
    }
  );
  if (map.getSource("cables")) map.removeSource("cables");
  loadCables();
};

// ── Lifecycle ──────────────────────────────────────────
onMounted(initMap);

onUnmounted(() => {
  popup?.remove();
  map?.remove();
  map = null;
  popup = null;
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Header -->
    <header class="flex items-center gap-3">
      <h1 class="m-0 text-2xl font-semibold">Cable Fiber Optic GIS</h1>
      <span
        v-if="!isLoading && !error"
        class="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-0.5 text-xs text-sky-400"
      >
        {{ cables.length.toLocaleString() }} cables
      </span>
    </header>

    <!-- ── Filter bar ── -->
    <div
      class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <!-- Search input -->
      <div class="flex min-w-[200px] flex-1 flex-col gap-1">
        <label class="text-xs font-medium text-slate-500 dark:text-slate-400">
          🔍 ค้นหา Cable Code
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="พิมพ์เพื่อค้นหา..."
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Select dropdown -->
      <div class="flex min-w-[220px] flex-1 flex-col gap-1">
        <label class="text-xs font-medium text-slate-500 dark:text-slate-400">
          📡 เลือก Cable (แสดงบนแผนที่)
        </label>
        <select
          v-model="selectedCableCode"
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">— ทั้งหมด —</option>
          <option
            v-for="opt in cableOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Active filter badges + clear -->
      <div class="flex items-center gap-2">
        <span
          v-if="selectedCableCode"
          class="flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-500"
        >
          <span class="h-2 w-2 rounded-full bg-orange-400" />
          {{ selectedCableCode }}
        </span>

        <button
          v-if="searchQuery || selectedCableCode"
          class="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:hover:bg-red-900/20"
          @click="clearFilters"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </div>

    <!-- Map wrapper -->
    <div class="relative h-[500px] w-full overflow-hidden rounded-xl">
      <div id="map" class="h-full w-full" />

      <!-- Selected cable badge on map -->
      <div
        v-if="selectedCableCode"
        class="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-orange-400/40 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-orange-400 backdrop-blur-sm"
      >
        <span class="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
        กำลังแสดง: {{ selectedCableCode }}
        <button
          class="ml-1 text-slate-400 hover:text-white"
          @click="selectedCableCode = ''"
        >
          ✕
        </button>
      </div>

      <!-- Loading overlay -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900/65 backdrop-blur-sm"
        >
          <div
            class="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-700 border-t-sky-400"
          />
          <p class="text-sm text-slate-300">Loading cables…</p>
        </div>
      </Transition>

      <!-- Error overlay -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="error"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-red-950/75 backdrop-blur-sm"
        >
          <p class="text-sm text-red-300">⚠️ {{ error }}</p>
          <button
            class="rounded-lg border border-red-300/60 px-4 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10"
            @click="retry"
          >
            Retry
          </button>
        </div>
      </Transition>
    </div>

    <!-- ── Table section ── -->
    <div
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <!-- Table header bar -->
      <div
        class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
          รายการ Cable
          <span
            v-if="searchQuery || selectedCableCode"
            class="ml-2 text-xs font-normal text-sky-500"
            >(กรองแล้ว {{ paginatedSource.length }} รายการ)</span
          >
        </p>
        <p class="text-xs text-slate-400">
          หน้า {{ currentPage }} / {{ totalPages || 1 }} &nbsp;·&nbsp; ทั้งหมด
          {{ paginatedSource.length.toLocaleString() }} รายการ
        </p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
            >
              <th class="w-14 px-4 py-3">#</th>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Cable Code</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading skeleton rows -->
            <template v-if="isLoading">
              <tr
                v-for="i in PAGE_SIZE"
                :key="i"
                class="border-b border-slate-100 dark:border-slate-800"
              >
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-6 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                  />
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                  />
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                  />
                </td>
                <td class="px-4 py-3" />
              </tr>
            </template>

            <!-- Actual data -->
            <template v-else>
              <tr
                v-for="(cable, i) in pagedCables"
                :key="cable.id ?? cable.cable_code"
                class="border-b border-slate-100 transition-colors hover:bg-sky-50/60 dark:border-slate-800 dark:hover:bg-sky-900/10"
                :class="{
                  'bg-orange-50/60 dark:bg-orange-900/10':
                    selectedCableCode && cable.cable_code === selectedCableCode,
                }"
              >
                <!-- Row number -->
                <td class="px-4 py-3 text-xs text-slate-400">
                  {{ (currentPage - 1) * PAGE_SIZE + i + 1 }}
                </td>

                <!-- ID -->
                <td
                  class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400"
                >
                  {{ cable.id ?? "—" }}
                </td>

                <!-- Cable Code -->
                <td
                  class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200"
                >
                  <!-- Highlight matched search text -->
                  <template v-if="searchQuery">
                    <span
                      v-html="
                        cable.cable_code.replace(
                          new RegExp(
                            `(${searchQuery.replace(
                              /[.*+?^${}()|[\]\\]/g,
                              '\\$&'
                            )})`,
                            'gi'
                          ),
                          '<mark class=\'bg-sky-200 dark:bg-sky-700 rounded px-0.5\'>$1</mark>'
                        )
                      "
                    />
                  </template>
                  <template v-else>
                    {{ cable.cable_code }}
                  </template>
                </td>

                <!-- Action buttons -->
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Focus on map -->
                    <button
                      class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      :title="'แสดงบนแผนที่'"
                      @click="selectedCableCode = cable.cable_code"
                    >
                      🗺️
                    </button>

                    <!-- Detail -->
                    <button
                      class="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-400"
                      @click="goToDetail(cable)"
                    >
                      ดูรายละเอียด
                      <span class="text-[10px] opacity-70">→</span>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="paginatedSource.length === 0">
                <td
                  colspan="4"
                  class="px-4 py-12 text-center text-sm text-slate-400"
                >
                  ไม่พบข้อมูล cable
                  <span v-if="searchQuery">สำหรับ "{{ searchQuery }}"</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination bar ── -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700"
      >
        <!-- Prev -->
        <button
          :disabled="currentPage === 1"
          class="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          @click="currentPage--"
        >
          ← ก่อนหน้า
        </button>

        <!-- Page number buttons -->
        <div class="flex items-center gap-1">
          <button
            v-for="(page, idx) in pageButtons"
            :key="idx"
            :disabled="page === '…'"
            class="min-w-[32px] rounded-lg border px-2 py-1.5 text-xs transition"
            :class="
              page === currentPage
                ? 'border-sky-500 bg-sky-500 font-semibold text-white'
                : page === '…'
                ? 'cursor-default border-transparent text-slate-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
            "
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <!-- Next -->
        <button
          :disabled="currentPage === totalPages"
          class="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          @click="currentPage++"
        >
          ถัดไป →
        </button>
      </div>
    </div>
  </div>
</template>