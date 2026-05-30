<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Data State ─────────────────────────────────────────
const sites = ref<any[]>([]);
const searchQuery = ref("");

// เก็บ Set ของ site.id ที่กำลัง "แสดง" อยู่บนแผนที่
const visibleSiteIds = ref<Set<number>>(new Set());

const expandedRegions = ref<Record<string, boolean>>({});
const expandedProvinces = ref<Record<string, boolean>>({});

// ── Map State ──────────────────────────────────────────
let map: maplibregl.Map | null = null;
// Map ของ marker แต่ละ site: { siteId -> Marker }
const markersMap = ref<Map<number, maplibregl.Marker>>(new Map());

// ── Load Data ──────────────────────────────────────────
const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();
    sites.value = res.data.result || [];
  } catch (error) {
    console.error("Load site error:", error);
  }
};

// ── Computed: Filter ───────────────────────────────────
const filteredSites = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return sites.value;
  return sites.value.filter(
    (s) =>
      s.site_code?.toLowerCase().includes(q) ||
      s.site_name?.toLowerCase().includes(q) ||
      s.province?.toLowerCase().includes(q) ||
      s.amphur?.toLowerCase().includes(q)
  );
});

// ── Computed: Folder Tree ──────────────────────────────
const groupedSites = computed(() => {
  const tree: Record<string, Record<string, Record<string, any[]>>> = {};
  filteredSites.value.forEach((site) => {
    const region = site.region || "ไม่ระบุภาค";
    const province = site.province || "ไม่ระบุจังหวัด";
    const amphur = site.amphur || "ไม่ระบุอำเภอ";
    if (!tree[region]) tree[region] = {};
    if (!tree[region][province]) tree[region][province] = {};
    if (!tree[region][province][amphur]) tree[region][province][amphur] = [];
    tree[region][province][amphur].push(site);
  });
  return tree;
});

// ── Auto-expand เมื่อค้นหา ─────────────────────────────
watch(searchQuery, (q) => {
  if (q.trim()) {
    Object.keys(groupedSites.value).forEach((region) => {
      expandedRegions.value[region] = true;
      Object.keys(groupedSites.value[region]).forEach((province) => {
        expandedProvinces.value[province] = true;
      });
    });
  }
});

// ── Toggle Folder ──────────────────────────────────────
const toggleRegion = (region: string) => {
  expandedRegions.value[region] = !expandedRegions.value[region];
};
const toggleProvince = (province: string) => {
  expandedProvinces.value[province] = !expandedProvinces.value[province];
};

// ── Expand / Collapse All ──────────────────────────────
const isAllExpanded = computed(() => {
  const regions = Object.keys(groupedSites.value);
  return (
    regions.length > 0 &&
    regions.every(
      (r) =>
        expandedRegions.value[r] &&
        Object.keys(groupedSites.value[r]).every(
          (p) => expandedProvinces.value[p]
        )
    )
  );
});

const toggleAll = () => {
  const shouldExpand = !isAllExpanded.value;
  Object.keys(groupedSites.value).forEach((region) => {
    expandedRegions.value[region] = shouldExpand;
    Object.keys(groupedSites.value[region]).forEach((province) => {
      expandedProvinces.value[province] = shouldExpand;
    });
  });
};

// ── Core: Fit map ให้ครอบทุก marker ที่ visible ────────
const fitMapToVisible = () => {
  if (!map || visibleSiteIds.value.size === 0) return;

  const coords: [number, number][] = [];
  visibleSiteIds.value.forEach((id) => {
    const site = sites.value.find((s) => s.id === id);
    if (site?.latitude && site?.longitude) {
      coords.push([Number(site.longitude), Number(site.latitude)]);
    }
  });

  if (coords.length === 0) return;

  if (coords.length === 1) {
    // จุดเดียว → flyTo ปกติ
    map.flyTo({ center: coords[0], zoom: 15, duration: 1000 });
    return;
  }

  // หลายจุด → คำนวณ bounding box แล้ว fitBounds
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const bounds: maplibregl.LngLatBoundsLike = [
    [Math.min(...lngs), Math.min(...lats)], // SW
    [Math.max(...lngs), Math.max(...lats)], // NE
  ];

  map.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 14 });
};

// ── Toggle Site Marker ─────────────────────────────────
const toggleSite = (site: any) => {
  if (!map || !site.latitude || !site.longitude) return;

  const id = site.id;

  if (visibleSiteIds.value.has(id)) {
    // --- ซ่อน: เอา marker ออก ---
    markersMap.value.get(id)?.remove();
    markersMap.value.delete(id);
    visibleSiteIds.value.delete(id);
    // trigger reactivity
    visibleSiteIds.value = new Set(visibleSiteIds.value);
  } else {
    // --- แสดง: สร้าง marker ใหม่ ---
    const marker = new maplibregl.Marker({ color: "#3b82f6" })
      .setLngLat([Number(site.longitude), Number(site.latitude)])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding:4px 2px">
            <strong style="font-size:13px">${site.site_code || "-"}</strong><br/>
            <span style="font-size:11px;color:#555">${site.site_name || ""}</span><br/>
            <span style="font-size:10px;color:#888">${site.amphur || ""} · ${site.province || ""}</span>
          </div>
        `)
      )
      .addTo(map);

    markersMap.value.set(id, marker);
    visibleSiteIds.value = new Set(visibleSiteIds.value);
    visibleSiteIds.value.add(id);
    visibleSiteIds.value = new Set(visibleSiteIds.value);
  }

  fitMapToVisible();
};

// ── Clear ทั้งหมด ──────────────────────────────────────
const clearAll = () => {
  markersMap.value.forEach((marker) => marker.remove());
  markersMap.value.clear();
  visibleSiteIds.value = new Set();
};

// ── Map init ───────────────────────────────────────────
const initMap = () => {
  map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: [100.5018, 13.7563],
    zoom: 6,
  });
  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl(), "bottom-left");
};

onMounted(async () => {
  initMap();
  await loadData();
});
</script>

<template>
  <div class="flex w-full h-screen font-sans antialiased text-gray-800">

    <!-- ── Sidebar ── -->
    <div class="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">

      <!-- Header -->
      <div class="p-4 border-b border-gray-100 bg-gray-50">
        <h2 class="text-lg font-bold text-gray-900">รายชื่อโครงข่าย (Sites)</h2>
        <div class="flex items-center justify-between mt-1">
          <p class="text-xs text-gray-500">
            แสดง {{ filteredSites.length }} / {{ sites.length }} สถานี
          </p>
          <!-- Badge + Clear -->
          <div v-if="visibleSiteIds.size > 0" class="flex items-center gap-2">
            <span class="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
              📍 {{ visibleSiteIds.size }} จุด
            </span>
            <button
              @click="clearAll"
              class="text-xs text-red-400 hover:text-red-600 transition-colors"
              title="ล้างหมุดทั้งหมด"
            >
              ✕ ล้าง
            </button>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="relative">
          <span class="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา site code, ชื่อ, จังหวัด..."
            class="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
        </div>
      </div>

      <!-- Expand / Collapse All -->
      <div class="px-3 py-1.5 border-b border-gray-100 flex justify-end">
        <button
          @click="toggleAll"
          class="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
        >
          {{ isAllExpanded ? "ปิดทั้งหมด ▲" : "เปิดทั้งหมด ▼" }}
        </button>
      </div>

      <!-- Tree List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1 select-none text-sm">

        <div v-if="Object.keys(groupedSites).length === 0" class="text-center text-gray-400 text-xs mt-8">
          ไม่พบสถานีที่ตรงกัน
        </div>

        <div v-for="(provinces, region) in groupedSites" :key="region" class="space-y-1">

          <!-- Region Row -->
          <div
            @click="toggleRegion(region)"
            class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer font-medium text-gray-700"
          >
            <span
              class="mr-2 text-[10px] inline-block transition-transform duration-200"
              :class="{ 'rotate-90': expandedRegions[region] }"
            >▶</span>
            📁 {{ region }}
          </div>

          <div v-if="expandedRegions[region]" class="pl-4 space-y-1">
            <div v-for="(amphurs, province) in provinces" :key="province" class="space-y-1">

              <!-- Province Row -->
              <div
                @click="toggleProvince(province)"
                class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600"
              >
                <span
                  class="mr-2 text-[10px] inline-block transition-transform duration-200"
                  :class="{ 'rotate-90': expandedProvinces[province] }"
                >▶</span>
                📂 {{ province }}
              </div>

              <div v-if="expandedProvinces[province]" class="pl-4 space-y-1">
                <div v-for="(siteList, amphur) in amphurs" :key="amphur">

                  <!-- Amphur label -->
                  <div class="p-1.5 pl-2 text-xs font-semibold text-gray-400 bg-gray-50 rounded-sm">
                    📍 {{ amphur }} ({{ siteList.length }})
                  </div>

                  <!-- Site Items -->
                  <div class="pl-2 mt-1 space-y-0.5">
                    <div
                      v-for="site in siteList"
                      :key="site.id"
                      @click="toggleSite(site)"
                      :class="[
                        'p-2 rounded text-xs cursor-pointer transition-all truncate flex items-center gap-1.5',
                        visibleSiteIds.has(site.id)
                          ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      ]"
                    >
                      <!-- dot indicator -->
                      <span
                        class="shrink-0 w-1.5 h-1.5 rounded-full transition-colors"
                        :class="visibleSiteIds.has(site.id) ? 'bg-blue-500' : 'bg-gray-300'"
                      />
                      <span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-500 shrink-0">
                        {{ site.site_code }}
                      </span>
                      <span class="truncate">{{ site.site_name }}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ── Map ── -->
    <div class="flex-1 h-full relative">
      <div id="map" class="w-full h-full"></div>
    </div>

  </div>
</template>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>