<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Data State ────────────────────────────────────────
const sites = ref<any[]>([]);
const selectedSite = ref<any>(null);
const searchQuery = ref("");

const expandedRegions = ref<Record<string, boolean>>({});
const expandedProvinces = ref<Record<string, boolean>>({});

// ── Map State ─────────────────────────────────────────
let map: maplibregl.Map | null = null;
let currentMarker: maplibregl.Marker | null = null;

const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();
    sites.value = res.data.result || [];
  } catch (error) {
    console.error("Load site error:", error);
  }
};

// ── Computed: กรองข้อมูลตาม search ──────────────────
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

// ── Computed: Folder Tree จาก filteredSites ──────────
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

// ── Auto-expand เมื่อมีการค้นหา ───────────────────────
watch(searchQuery, (q) => {
  if (q.trim()) {
    // เปิดทุก folder อัตโนมัติเมื่อค้นหา
    Object.keys(groupedSites.value).forEach((region) => {
      expandedRegions.value[region] = true;
      Object.keys(groupedSites.value[region]).forEach((province) => {
        expandedProvinces.value[province] = true;
      });
    });
  }
});

// ── เปิด / ปิด ทั้งหมด ───────────────────────────────
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

// ── Toggle folder ─────────────────────────────────────
const toggleRegion = (region: string) => {
  expandedRegions.value[region] = !expandedRegions.value[region];
};

const toggleProvince = (province: string) => {
  expandedProvinces.value[province] = !expandedProvinces.value[province];
};

// ── Select Site ───────────────────────────────────────
const selectSite = (site: any) => {
  if (!map || !site.latitude || !site.longitude) return;
  selectedSite.value = site;
  const lng = Number(site.longitude);
  const lat = Number(site.latitude);

  map.flyTo({ center: [lng, lat], zoom: 15, essential: true, duration: 1500 });

  if (currentMarker) currentMarker.remove();
  currentMarker = new maplibregl.Marker({ color: "#ef4444" })
    .setLngLat([lng, lat])
    .setPopup(
      new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-1">
          <strong class="text-sm">${site.site_code || "-"}</strong><br>
          <span class="text-xs text-gray-600">${site.site_name || ""}</span>
        </div>
      `)
    )
    .addTo(map);
  currentMarker.togglePopup();
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
        <p class="text-xs text-gray-500 mt-1">
          แสดง {{ filteredSites.length }} / {{ sites.length }} สถานี
        </p>
      </div>

      <!-- Search Bar -->
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="relative">
          <span class="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
            🔍
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา site code, ชื่อ, จังหวัด..."
            class="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
          />
          <!-- ปุ่ม Clear -->
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
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

        <!-- Empty state -->
        <div v-if="Object.keys(groupedSites).length === 0" class="text-center text-gray-400 text-xs mt-8">
          ไม่พบสถานีที่ตรงกัน
        </div>

        <div v-for="(provinces, region) in groupedSites" :key="region" class="space-y-1">

          <!-- Region -->
          <div
            @click="toggleRegion(region)"
            class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer font-medium text-gray-700"
          >
            <span
              class="mr-2 text-[10px] transition-transform duration-200 inline-block"
              :class="{ 'rotate-90': expandedRegions[region] }"
            >▶</span>
            📁 {{ region }}
          </div>

          <div v-if="expandedRegions[region]" class="pl-4 space-y-1">
            <div v-for="(amphurs, province) in provinces" :key="province" class="space-y-1">

              <!-- Province -->
              <div
                @click="toggleProvince(province)"
                class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600"
              >
                <span
                  class="mr-2 text-[10px] transition-transform duration-200 inline-block"
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
                      @click="selectSite(site)"
                      :class="[
                        'p-2 rounded text-xs cursor-pointer transition-colors truncate',
                        selectedSite?.id === site.id
                          ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      ]"
                    >
                      <span class="font-mono bg-gray-100 px-1 py-0.5 rounded mr-1 text-[10px] text-gray-500">
                        {{ site.site_code }}
                      </span>
                      {{ site.site_name }}
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