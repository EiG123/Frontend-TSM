<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Data State ────────────────────────────────────────
const sites = ref<any[]>([]);
const selectedSite = ref<any>(null);

// ใช้สำหรับเก็บสถานะ เปิด/ปิด ของเมนู Folder แต่ละชั้น
const expandedRegions = ref<Record<string, boolean>>({});
const expandedProvinces = ref<Record<string, boolean>>({});

// ── Map State ─────────────────────────────────────────
let map: maplibregl.Map | null = null;
let currentMarker: maplibregl.Marker | null = null;

// โหลดข้อมูล Site
const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();
    sites.value = res.data.result || [];
    console.log("Total Sites:", sites.value.length);
  } catch (error) {
    console.error("Load site error:", error);
  }
};

// ── Computed: จัดกลุ่มข้อมูลเป็น Folder Structure ──────
// โครงสร้างที่ได้: { "ภาคเหนือ": { "เชียงใหม่": { "เมืองเชียงใหม่": [ site1, site2 ] } } }
const groupedSites = computed(() => {
  const tree: Record<string, Record<string, Record<string, any[]>>> = {};

  sites.value.forEach((site) => {
    // กำหนดค่าเริ่มต้นหากข้อมูลใน DB ไม่มีพิกัดหรือชื่อระบุย่อย
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

// ── ฟังก์ชันควบคุมแผงเมนู Folder ────────────────────────
const toggleRegion = (region: string) => {
  expandedRegions.value[region] = !expandedRegions.value[region];
};

const toggleProvince = (province: string) => {
  expandedProvinces.value[province] = !expandedProvinces.value[province];
};

// ── ฟังก์ชันเมื่อคลิกเลือก Site (ซูมแผนที่ไปที่จุดนั้น) ──
const selectSite = (site: any) => {
  if (!map || !site.latitude || !site.longitude) return;

  selectedSite.value = site;
  const lng = Number(site.longitude);
  const lat = Number(site.latitude);

  // 1. เลื่อนแผนที่ไปที่พิกัดของ Site นั้น
  map.flyTo({
    center: [lng, lat],
    zoom: 15, // ซูมเข้าไปใกล้ๆ เห็นระดับถนน
    essential: true,
    duration: 1500 // ความเร็วในการเลื่อน (มิลลิวินาที)
  });

  // 2. เคลียร์หมุดเก่า (ถ้ามี) แล้วปักหมุดใหม่จุดที่เลือกจุดเดียวพอ เพื่อความลื่นไหล
  if (currentMarker) currentMarker.remove();

  currentMarker = new maplibregl.Marker({ color: "#ef4444" }) // หมุดสีแดงเด่นๆ
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
    center: [100.5018, 13.7563], // เริ่มต้นที่ กรุงเทพฯ
    zoom: 6, // ซูมออกแบบเห็นภาพรวมประเทศ
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
    
    <div class="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
      <div class="p-4 border-b border-gray-100 bg-gray-50">
        <h2 class="text-lg font-bold text-gray-900">รายชื่อโครงข่าย (Sites)</h2>
        <p class="text-xs text-gray-500 mt-1">ทั้งหมด {{ sites.length }} สถานี</p>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1 select-none text-sm">
        
        <div v-for="(provinces, region) in groupedSites" :key="region" class="space-y-1">
          <div 
            @click="toggleRegion(region)"
            class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer font-medium text-gray-700"
          >
            <span class="mr-2 transition-transform duration-200" :class="{ 'rotate-90': expandedRegions[region] }">▶</span>
            📁 {{ region }}
          </div>

          <div v-if="expandedRegions[region]" class="pl-4 space-y-1">
            <div v-for="(amphurs, province) in provinces" :key="province" class="space-y-1">
              <div 
                @click="toggleProvince(province)"
                class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600"
              >
                <span class="mr-2 transition-transform duration-200" :class="{ 'rotate-90': expandedProvinces[province] }">▶</span>
                📂 {{ province }}
              </div>

              <div v-if="expandedProvinces[province]" class="pl-4 space-y-1">
                <div v-for="(siteList, amphur) in amphurs" :key="amphur">
                  <div class="p-1.5 pl-2 text-xs font-semibold text-gray-400 bg-gray-50 rounded-sm">
                    📍 {{ amphur }} ({{ siteList.length }})
                  </div>

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

    <div class="flex-1 h-full relative">
      <div id="map" class="w-full h-full"></div>
    </div>

  </div>
</template>

<style scoped>
/* สไตล์สำหรับการหมุนลูกศรเปิด/ปิดโฟลเดอร์ */
.rotate-90 {
  transform: rotate(90deg);
}
</style>