<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Types ──────────────────────────────────────────────
interface Operator {
  operator_id: number;
  operator_name: string;
}

interface Site {
  id: number;
  site_code: string;
  site_name: string;
  region?: string;
  province?: string;
  amphur?: string;
  latitude?: number | string;
  longitude?: number | string;
  operators?: Operator[];
}

// ── Data State ─────────────────────────────────────────
const sites = ref<Site[]>([]);
const searchQuery = ref("");
const visibleSiteIds = ref<Set<number>>(new Set());
const expandedRegions = ref<Record<string, boolean>>({});
const expandedProvinces = ref<Record<string, boolean>>({});

// ── Map State ──────────────────────────────────────────
let map: maplibregl.Map | null = null;
const markersMap = new Map<number, maplibregl.Marker>();

// ── Operator Color Logic ───────────────────────────────
// Priority: TRUE(แดง) > DTAC(ฟ้า) > อื่น(เทา)
const getMarkerColor = (operators?: Operator[]): string => {
  if (!operators || operators.length === 0) return "#9ca3af"; // เทา
  const names = operators.map((o) => o.operator_name?.toUpperCase());
  if (names.includes("TRUE")) return "#ef4444";  // แดง
  if (names.includes("DTAC")) return "#3b82f6";  // ฟ้า
  return "#9ca3af"; // เทา
};

// Badge สำหรับแสดงใน Sidebar
const getOperatorBadges = (operators?: Operator[]) => {
  if (!operators || operators.length === 0) return [];
  return operators.map((o) => {
    const name = o.operator_name?.toUpperCase();
    if (name === "TRUE") return { label: o.operator_name, color: "bg-red-100 text-red-600" };
    if (name === "DTAC") return { label: o.operator_name, color: "bg-blue-100 text-blue-600" };
    return { label: o.operator_name, color: "bg-gray-100 text-gray-500" };
  });
};

// Dot color สำหรับ indicator ใน sidebar
const getSiteDotColor = (site: Site): string => {
  if (!site.operators || site.operators.length === 0) return "bg-gray-300";
  const names = site.operators.map((o) => o.operator_name?.toUpperCase());
  if (names.includes("TRUE")) return "bg-red-500";
  if (names.includes("DTAC")) return "bg-blue-500";
  return "bg-gray-400";
};

// Popup HTML
const buildPopupHTML = (site: Site): string => {
  const operatorRows =
    site.operators && site.operators.length > 0
      ? site.operators
          .map((o) => {
            const name = o.operator_name?.toUpperCase();
            const color =
              name === "TRUE"
                ? "#ef4444"
                : name === "DTAC"
                ? "#3b82f6"
                : "#9ca3af";
            return `
              <span style="
                display:inline-flex;align-items:center;gap:4px;
                background:${color}18;color:${color};
                font-size:10px;font-weight:600;
                padding:2px 6px;border-radius:9999px;
                border:1px solid ${color}40;
              ">
                <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block"></span>
                ${o.operator_name}
              </span>`;
          })
          .join(" ")
      : `<span style="font-size:10px;color:#9ca3af">ไม่มีข้อมูล Operator</span>`;

  return `
    <div style="padding:6px 4px;min-width:160px">
      <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:2px">
        ${site.site_code || "-"}
      </div>
      <div style="font-size:11px;color:#555;margin-bottom:6px">
        ${site.site_name || ""}
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:6px">
        ${site.amphur || ""} · ${site.province || ""}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${operatorRows}
      </div>
    </div>
  `;
};

// ── Load Data ──────────────────────────────────────────
const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();
    console.log(res);
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
      s.amphur?.toLowerCase().includes(q) ||
      s.operators?.some((o) => o.operator_name?.toLowerCase().includes(q))
  );
});

// ── Computed: Folder Tree ──────────────────────────────
const groupedSites = computed(() => {
  const tree: Record<string, Record<string, Record<string, Site[]>>> = {};
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

// ── Helpers ────────────────────────────────────────────
const getSitesInRegion = (region: string): Site[] =>
  Object.values(groupedSites.value[region] || {}).flatMap((amphurs) =>
    Object.values(amphurs).flat()
  );

const getSitesInProvince = (region: string, province: string): Site[] =>
  Object.values(groupedSites.value[region]?.[province] || {}).flat();

const getSitesInAmphur = (region: string, province: string, amphur: string): Site[] =>
  groupedSites.value[region]?.[province]?.[amphur] || [];

// ── Checkbox States ────────────────────────────────────
const checkState = (siteList: Site[]): "all" | "none" | "indeterminate" => {
  if (siteList.length === 0) return "none";
  const count = siteList.filter((s) => visibleSiteIds.value.has(s.id)).length;
  if (count === 0) return "none";
  if (count === siteList.length) return "all";
  return "indeterminate";
};

const regionCheckState = (region: string) => checkState(getSitesInRegion(region));
const provinceCheckState = (region: string, province: string) => checkState(getSitesInProvince(region, province));
const amphurCheckState = (region: string, province: string, amphur: string) => checkState(getSitesInAmphur(region, province, amphur));

// ── Core: Add / Remove Marker ──────────────────────────
const addMarker = (site: Site) => {
  if (!map || !site.latitude || !site.longitude || markersMap.has(site.id)) return;

  const color = getMarkerColor(site.operators);
  const marker = new maplibregl.Marker({ color })
    .setLngLat([Number(site.longitude), Number(site.latitude)])
    .setPopup(
      new maplibregl.Popup({ offset: 25 }).setHTML(buildPopupHTML(site))
    )
    .addTo(map);

  markersMap.set(site.id, marker);
};

const removeMarker = (siteId: number) => {
  markersMap.get(siteId)?.remove();
  markersMap.delete(siteId);
};

// ── Core: Fit Map ──────────────────────────────────────
const fitMapToVisible = () => {
  if (!map || visibleSiteIds.value.size === 0) return;
  const coords: [number, number][] = [];
  visibleSiteIds.value.forEach((id) => {
    const site = sites.value.find((s) => s.id === id);
    if (site?.latitude && site?.longitude)
      coords.push([Number(site.longitude), Number(site.latitude)]);
  });
  if (coords.length === 0) return;
  if (coords.length === 1) {
    map.flyTo({ center: coords[0], zoom: 15, duration: 1000 });
    return;
  }
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  map.fitBounds(
    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
    { padding: 80, duration: 1000, maxZoom: 14 }
  );
};

// ── Toggle Site ────────────────────────────────────────
const toggleSite = (site: Site) => {
  if (!site.latitude || !site.longitude) return;
  const newSet = new Set(visibleSiteIds.value);
  if (newSet.has(site.id)) {
    removeMarker(site.id);
    newSet.delete(site.id);
  } else {
    addMarker(site);
    newSet.add(site.id);
  }
  visibleSiteIds.value = newSet;
  fitMapToVisible();
};

// ── Toggle Folder Checkboxes ───────────────────────────
const toggleBulk = (siteList: Site[], state: "all" | "none" | "indeterminate") => {
  const newSet = new Set(visibleSiteIds.value);
  const shouldShow = state !== "all";
  siteList.forEach((site) => {
    if (shouldShow) { addMarker(site); newSet.add(site.id); }
    else { removeMarker(site.id); newSet.delete(site.id); }
  });
  visibleSiteIds.value = newSet;
  fitMapToVisible();
};

const toggleRegionCheckbox = (region: string) =>
  toggleBulk(getSitesInRegion(region), regionCheckState(region));

const toggleProvinceCheckbox = (region: string, province: string) =>
  toggleBulk(getSitesInProvince(region, province), provinceCheckState(region, province));

const toggleAmphurCheckbox = (region: string, province: string, amphur: string) =>
  toggleBulk(getSitesInAmphur(region, province, amphur), amphurCheckState(region, province, amphur));

// ── Clear All ──────────────────────────────────────────
const clearAll = () => {
  markersMap.forEach((m) => m.remove());
  markersMap.clear();
  visibleSiteIds.value = new Set();
};

// ── Directive: v-indeterminate ─────────────────────────
const vIndeterminate = {
  updated(el: HTMLInputElement, binding: { value: boolean }) {
    el.indeterminate = binding.value;
  },
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
          <p class="text-xs text-gray-500">แสดง {{ filteredSites.length }} / {{ sites.length }} สถานี</p>
          <div v-if="visibleSiteIds.size > 0" class="flex items-center gap-2">
            <span class="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
              📍 {{ visibleSiteIds.size }} จุด
            </span>
            <button @click="clearAll" class="text-xs text-red-400 hover:text-red-600 transition-colors">
              ✕ ล้าง
            </button>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="px-3 py-2 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
        <span class="text-[10px] text-gray-400 font-medium">สี Operator:</span>
        <span class="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> TRUE
        </span>
        <span class="flex items-center gap-1 text-[10px] text-blue-500 font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> DTAC
        </span>
        <span class="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span> อื่นๆ
        </span>
      </div>

      <!-- Search Bar -->
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="relative">
          <span class="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา site, จังหวัด, operator..."
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
        <button @click="toggleAll" class="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors">
          {{ isAllExpanded ? "ปิดทั้งหมด ▲" : "เปิดทั้งหมด ▼" }}
        </button>
      </div>

      <!-- Tree List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1 select-none text-sm">

        <div v-if="Object.keys(groupedSites).length === 0"
          class="text-center text-gray-400 text-xs mt-8">
          ไม่พบสถานีที่ตรงกัน
        </div>

        <!-- ── Region ── -->
        <div v-for="(provinces, region) in groupedSites" :key="region" class="space-y-1">
          <div class="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded group">
            <input
              type="checkbox"
              v-indeterminate="regionCheckState(region) === 'indeterminate'"
              :checked="regionCheckState(region) === 'all'"
              @change.stop="toggleRegionCheckbox(region)"
              class="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer shrink-0"
            />
            <div @click="toggleRegion(region)"
              class="flex items-center gap-1.5 flex-1 cursor-pointer font-medium text-gray-700 min-w-0">
              <span class="text-[10px] inline-block transition-transform duration-200 shrink-0"
                :class="{ 'rotate-90': expandedRegions[region] }">▶</span>
              <span class="truncate">📁 {{ region }}</span>
              <span class="text-[10px] text-gray-400 shrink-0 ml-auto pr-1">
                ({{ getSitesInRegion(region).length }})
              </span>
            </div>
          </div>

          <!-- ── Province ── -->
          <div v-if="expandedRegions[region]" class="pl-4 space-y-1">
            <div v-for="(amphurs, province) in provinces" :key="province" class="space-y-1">
              <div class="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded group">
                <input
                  type="checkbox"
                  v-indeterminate="provinceCheckState(region, province) === 'indeterminate'"
                  :checked="provinceCheckState(region, province) === 'all'"
                  @change.stop="toggleProvinceCheckbox(region, province)"
                  class="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer shrink-0"
                />
                <div @click="toggleProvince(province)"
                  class="flex items-center gap-1.5 flex-1 cursor-pointer text-gray-600 min-w-0">
                  <span class="text-[10px] inline-block transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-90': expandedProvinces[province] }">▶</span>
                  <span class="truncate">📂 {{ province }}</span>
                  <span class="text-[10px] text-gray-400 shrink-0 ml-auto pr-1">
                    ({{ getSitesInProvince(region, province).length }})
                  </span>
                </div>
              </div>

              <!-- ── Amphur ── -->
              <div v-if="expandedProvinces[province]" class="pl-4 space-y-1">
                <div v-for="(siteList, amphur) in amphurs" :key="amphur">
                  <div class="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-sm">
                    <input
                      type="checkbox"
                      v-indeterminate="amphurCheckState(region, province, amphur) === 'indeterminate'"
                      :checked="amphurCheckState(region, province, amphur) === 'all'"
                      @change.stop="toggleAmphurCheckbox(region, province, amphur)"
                      class="w-3 h-3 rounded accent-blue-500 cursor-pointer shrink-0"
                    />
                    <span class="text-xs font-semibold text-gray-400 truncate">
                      📍 {{ amphur }} ({{ siteList.length }})
                    </span>
                  </div>

                  <!-- ── Site Items ── -->
                  <div class="pl-2 mt-0.5 space-y-0.5">
                    <div
                      v-for="site in siteList"
                      :key="site.id"
                      @click="toggleSite(site)"
                      :class="[
                        'p-2 rounded text-xs cursor-pointer transition-all border-l-4',
                        visibleSiteIds.has(site.id)
                          ? 'bg-blue-50 font-semibold border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 border-transparent'
                      ]"
                    >
                      <!-- Row 1: dot + site_code + site_name -->
                      <div class="flex items-center gap-1.5 min-w-0">
                        <!-- dot สีตาม operator -->
                        <span class="shrink-0 w-2 h-2 rounded-full transition-colors"
                          :class="visibleSiteIds.has(site.id) ? getSiteDotColor(site) : 'bg-gray-300'"
                        />
                        <span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-500 shrink-0">
                          {{ site.site_code }}
                        </span>
                        <span class="truncate" :class="visibleSiteIds.has(site.id) ? 'text-blue-700' : 'text-gray-700'">
                          {{ site.site_name }}
                        </span>
                      </div>

                      <!-- Row 2: Operator badges -->
                      <div v-if="site.operators && site.operators.length > 0"
                        class="flex flex-wrap gap-1 mt-1.5 pl-3.5">
                        <span
                          v-for="badge in getOperatorBadges(site.operators)"
                          :key="badge.label"
                          :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded-full', badge.color]"
                        >
                          {{ badge.label }}
                        </span>
                      </div>
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