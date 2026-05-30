<script setup lang="ts">
import { onMounted, ref } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const sites = ref<any[]>([]);

// ── Map ────────────────────────────────────────────────
let map: maplibregl.Map | null = null;

// โหลดข้อมูล Site
const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();

    sites.value = res.data.result || [];

    console.log("Total Sites:", sites.value.length);

    if (sites.value.length > 0) {
      console.log(sites.value[0]);
    }

    // ถ้า map โหลดแล้ว ให้เพิ่ม marker
    addMarkers();
  } catch (error) {
    console.error("Load site error:", error);
  }
};

// เพิ่ม Marker
const addMarkers = () => {
  if (!map) return;

  sites.value.forEach((site) => {
    if (!site.latitude || !site.longitude) return;

    new maplibregl.Marker()
      .setLngLat([
        Number(site.longitude),
        Number(site.latitude),
      ])
      .setPopup(
        new maplibregl.Popup().setHTML(`
          <div>
            <strong>${site.site_code || "-"}</strong><br>
            ${site.site_name || ""}
          </div>
        `)
      )
      .addTo(map!);
  });
};

// ── Map init ───────────────────────────────────────────
const initMap = () => {
  map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: [98.9853, 18.7883], // เชียงใหม่
    zoom: 10,
  });

  map.addControl(
    new maplibregl.NavigationControl(),
    "top-right"
  );

  map.addControl(
    new maplibregl.ScaleControl(),
    "bottom-left"
  );

  map.on("load", () => {
    addMarkers();
  });
};

onMounted(async () => {
  initMap();
  await loadData();
});
</script>

<template>
  <div class="w-full h-screen">
    <div id="map" class="w-full h-full"></div>
  </div>
</template>