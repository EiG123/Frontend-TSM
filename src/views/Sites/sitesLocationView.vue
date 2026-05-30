<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Data State ─────────────────────────────────────────
const sites = ref<any[]>([]);
const searchQuery = ref("");
const visibleSiteIds = ref<Set<number>>(new Set());
const expandedRegions = ref<Record<string, boolean>>({});
const expandedProvinces = ref<Record<string, boolean>>({});

// ── Map State ──────────────────────────────────────────
let map: maplibregl.Map | null = null;
const markersMap = new Map<number, maplibregl.Marker>();

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

// ── Helpers: ดึง site ทั้งหมดใน Region / Province ──────
const getSitesInRegion = (region: string): any[] => {
  return Object.values(groupedSites.value[region] || {}).flatMap((amphurs) =>
    Object.values(amphurs).flat()
  );
};

const getSitesInProvince = (region: string, province: string): any[] => {
  return Object.values(groupedSites.value[region]?.[province] || {}).flat();
};

const getSitesInAmphur = (region: string, province: string, amphur: string): any[] => {
  return groupedSites.value[region]?.[province]?.[amphur] || [];
};

// ── Checkbox State: Region ─────────────────────────────
const regionCheckState = (region: string): "all" | "none" | "indeterminate" => {
  const sitesInRegion = getSitesInRegion(region);
  if (sitesInRegion.length === 0) return "none";
  const visibleCount = sitesInRegion.filter((s) => visibleSiteIds.value.has(s.id)).length;
  if (visibleCount === 0) return "none";
  if (visibleCount === sitesInRegion.length) return "all";
  return "indeterminate";
};

// ── Checkbox State: Province ───────────────────────────
const provinceCheckState = (region: string, province: string): "all" | "none" | "indeterminate" => {
  const sitesInProvince = getSitesInProvince(region, province);
  if (sitesInProvince.length === 0) return "none";
  const visibleCount = sitesInProvince.filter((s) => visibleSiteIds.value.has(s.id)).length;
  if (visibleCount === 0) return "none";
  if (visibleCount === sitesInProvince.length) return "all";
  return "indeterminate";
};

// ── Checkbox State: Amphur ─────────────────────────────
const amphurCheckState = (region: string, province: string, amphur: string): "all" | "none" | "indeterminate" => {
  const sitesInAmphur = getSitesInAmphur(region, province, amphur);
  if (sitesInAmphur.length === 0) return "none";
  const visibleCount = sitesInAmphur.filter((s) => visibleSiteIds.value.has(s.id)).length;
  if (visibleCount === 0) return "none";
  if (visibleCount === sitesInAmphur.length) return "all";
  return "indeterminate";
};

// ── Core: Add / Remove Marker ──────────────────────────
const addMarker = (site: any) => {
  if (!map || !site.latitude || !site.longitude || markersMap.has(site.id)) return;
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
  markersMap.set(site.id, marker);
};

const removeMarker = (siteId: number) => {
  markersMap.get(siteId)?.remove();
  markersMap.delete(siteId);
};

// ── Core: Fit map ──────────────────────────────────────
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

// ── Toggle: Site (คลิกชื่อ) ───────────────────────────
const toggleSite = (site: any) => {
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

// ── Toggle: Amphur Checkbox ────────────────────────────
const toggleAmphurCheckbox = (region: string, province: string, amphur: string) => {
  const sitesInAmphur = getSitesInAmphur(region, province, amphur);
  const state = amphurCheckState(region, province, amphur);
  const newSet = new Set(visibleSiteIds.value);
  const shouldShow = state !== "all"; // ถ้าไม่ครบ → เปิดทั้งหมด; ถ้าครบแล้ว → ปิดทั้งหมด
  sitesInAmphur.forEach((site) => {
    if (shouldShow) {
      addMarker(site);
      newSet.add(site.id);
    } else {
      removeMarker(site.id);
      newSet.delete(site.id);
    }
  });
  visibleSiteIds.value = newSet;
  fitMapToVisible();
};

// ── Toggle: Province Checkbox ──────────────────────────
const toggleProvinceCheckbox = (region: string, province: string) => {
  const sitesInProvince = getSitesInProvince(region, province);
  const state = provinceCheckState(region, province);
  const newSet = new Set(visibleSiteIds.value);
  const shouldShow = state !== "all";
  sitesInProvince.forEach((site) => {
    if (shouldShow) {
      addMarker(site);
      newSet.add(site.id);
    } else {
      removeMarker(site.id);
      newSet.delete(site.id);
    }
  });
  visibleSiteIds.value = newSet;
  fitMapToVisible();
};

// ── Toggle: Region Checkbox ────────────────────────────
const toggleRegionCheckbox = (region: string) => {
  const sitesInRegion = getSitesInRegion(region);
  const state = regionCheckState(region);
  const newSet = new Set(visibleSiteIds.value);
  const shouldShow = state !== "all";
  sitesInRegion.forEach((site) => {
    if (shouldShow) {
      addMarker(site);
      newSet.add(site.id);
    } else {
      removeMarker(site.id);
      newSet.delete(site.id);
    }
  });
  visibleSiteIds.value = newSet;
  fitMapToVisible();
};

// ── Clear All ──────────────────────────────────────────
const clearAll = () => {
  markersMap.forEach((marker) => marker.remove());
  markersMap.clear();
  visibleSiteIds.value = new Set();
};

// ── Directive: v-indeterminate ─────────────────────────
// ใช้กับ <input type="checkbox"> เพื่อตั้ง .indeterminate property
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
          <p class="text-xs text-gray-500">
            แสดง {{ filteredSites.length }} / {{ sites.length }} สถานี
          </p>
          <div v-if="visibleSiteIds.size > 0" class="flex items-center gap-2">
            <span class="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
              📍 {{ visibleSiteIds.size }} จุด
            </span>
            <button
              @click="clearAll"
              class="text-xs text-red-400 hover:text-red-600 transition-colors"
            >✕ ล้าง</button>
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

        <div v-if="Object.keys(groupedSites).length === 0"
          class="text-center text-gray-400 text-xs mt-8">
          ไม่พบสถานีที่ตรงกัน
        </div>

        <!-- ── Region ── -->
        <div v-for="(provinces, region) in groupedSites" :key="region" class="space-y-1">
          <div class="flex items-center gap-1 p-2 hover:bg-gray-100 rounded group">

            <!-- Checkbox Region -->
            <input
              type="checkbox"
              v-indeterminate="regionCheckState(region) === 'indeterminate'"
              :checked="regionCheckState(region) === 'all'"
              @change.stop="toggleRegionCheckbox(region)"
              class="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer shrink-0"
            />

            <!-- Folder label (คลิกเพื่อ expand/collapse) -->
            <div
              @click="toggleRegion(region)"
              class="flex items-center gap-1.5 flex-1 cursor-pointer font-medium text-gray-700 min-w-0"
            >
              <span
                class="text-[10px] inline-block transition-transform duration-200 shrink-0"
                :class="{ 'rotate-90': expandedRegions[region] }"
              >▶</span>
              <span class="truncate">📁 {{ region }}</span>
              <span class="text-[10px] text-gray-400 shrink-0 ml-auto pr-1">
                ({{ getSitesInRegion(region).length }})
              </span>
            </div>
          </div>

          <!-- ── Province ── -->
          <div v-if="expandedRegions[region]" class="pl-4 space-y-1">
            <div v-for="(amphurs, province) in provinces" :key="province" class="space-y-1">
              <div class="flex items-center gap-1 p-2 hover:bg-gray-100 rounded group">

                <!-- Checkbox Province -->
                <input
                  type="checkbox"
                  v-indeterminate="provinceCheckState(region, province) === 'indeterminate'"
                  :checked="provinceCheckState(region, province) === 'all'"
                  @change.stop="toggleProvinceCheckbox(region, province)"
                  class="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer shrink-0"
                />

                <!-- Folder label -->
                <div
                  @click="toggleProvince(province)"
                  class="flex items-center gap-1.5 flex-1 cursor-pointer text-gray-600 min-w-0"
                >
                  <span
                    class="text-[10px] inline-block transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-90': expandedProvinces[province] }"
                  >▶</span>
                  <span class="truncate">📂 {{ province }}</span>
                  <span class="text-[10px] text-gray-400 shrink-0 ml-auto pr-1">
                    ({{ getSitesInProvince(region, province).length }})
                  </span>
                </div>
              </div>

              <!-- ── Amphur + Sites ── -->
              <div v-if="expandedProvinces[province]" class="pl-4 space-y-1">
                <div v-for="(siteList, amphur) in amphurs" :key="amphur">

                  <!-- Amphur label row + checkbox -->
                  <div class="flex items-center gap-1 p-1.5 bg-gray-50 rounded-sm">
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

                  <!-- Site Items -->
                  <div class="pl-2 mt-0.5 space-y-0.5">
                    <div
                      v-for="site in siteList"
                      :key="site.id"
                      @click="toggleSite(site)"
                      :class="[
                        'p-2 rounded text-xs cursor-pointer transition-all flex items-center gap-1.5',
                        visibleSiteIds.has(site.id)
                          ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      ]"
                    >
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