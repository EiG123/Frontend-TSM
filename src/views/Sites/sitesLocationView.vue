<script setup lang="ts">
import { onMounted, ref } from "vue";
import { siteManage } from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const sites = ref<any[]>([]);

// ── Map ────────────────────────────────────────────────
let map: maplibregl.Map | null = null;
const SOURCE_ID = "sites-source";
const LAYER_CLUSTER_ID = "clusters";
const LAYER_CLUSTER_COUNT_ID = "cluster-count";
const LAYER_UNCLUSTERED_ID = "unclustered-point";

// โหลดข้อมูล Site
const loadData = async () => {
  try {
    const res = await siteManage.getAllSite();
    sites.value = res.data.result || [];

    console.log("Total Sites:", sites.value.length);
    console.log(sites);

    // อัปเดตข้อมูลเข้า Map Source โดยตรง
    updateMapSource();
  } catch (error) {
    console.error("Load site error:", error);
  }
};

// แปลงข้อมูลเป็น GeoJSON และอัปเดต Source ของ Map
const updateMapSource = () => {
  if (!map || !map.isStyleLoaded()) return;

  // กรองเฉพาะ site ที่มีพิกัดครบถ้วน
  const validSites = sites.value.filter(site => site.latitude && site.longitude);

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: validSites.map((site) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(site.longitude), Number(site.latitude)],
      },
      properties: {
        site_code: site.site_code || "-",
        site_name: site.site_name || "",
      },
    })),
  };

  const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData(geojson);
  }
};

// ตั้งค่า Layer และ Event ต่างๆ ของ Map
const setupMapLayers = () => {
  if (!map) return;

  // 1. เพิ่ม GeoJSON Source พร้อมเปิดใช้งาน Cluster
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }, // เริ่มต้นว่างๆ
    cluster: true,
    clusterMaxZoom: 14, // ซูมถึงระดับนี้แล้วจะกระจายตัวออกทั้งหมด
    clusterRadius: 50,  // รัศมีในการรวมกลุ่มหมุด (พิกเซล)
  });

  // 2. Layer สำหรับกลุ่มหมุด (Clusters)
  map.addLayer({
    id: LAYER_CLUSTER_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6", 100,  // ถ้าหมุด < 100 สีฟ้า
        "#f1f075", 750,  // ถ้าหมุด 100 - 749 สีเหลือง
        "#f28cb1",       // ถ้าหมุด >= 750 สีชมพู
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20, 100,         // ขนาดวงกลมตามจำนวนหมุด
        30, 750,
        40,
      ],
    },
  });

  // 3. Layer ตัวเลขแสดงจำนวนในกลุ่ม (Cluster Count)
  map.addLayer({
    id: LAYER_CLUSTER_COUNT_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  // 4. Layer สำหรับหมุดเดี่ยวๆ ที่ไม่ได้รวมกลุ่ม (Unclustered Point)
  map.addLayer({
    id: LAYER_UNCLUSTERED_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // ── MAP EVENTS ───────────────────────────────────────

  // คลิกที่ Cluster แล้วให้ Zoom เข้าไปจุดนั้น
  map.on("click", LAYER_CLUSTER_ID, async (e) => {
    const features = map!.queryRenderedFeatures(e.point, {
      layers: [LAYER_CLUSTER_ID],
    });
    const clusterId = features[0].properties.cluster_id;
    
    const source = map!.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    const zoom = await source.getClusterExpansionZoom(clusterId);
    
    const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;

    map!.easeTo({
      center: coordinates as [number, number],
      zoom: zoom,
    });
  });

  // คลิกที่หมุดเดี่ยว เพื่อแสดง Popup
  map.on("click", LAYER_UNCLUSTERED_ID, (e) => {
    if (!e.features || e.features.length === 0) return;
    
    const feature = e.features[0];
    const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
    const { site_code, site_name } = feature.properties!;

    // ป้องกันปัญหาเรื่อง Wrap-around ของแผนที่โลก
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div style="color: #333; font-family: sans-serif;">
          <strong>${site_code}</strong><br>
          ${site_name}
        </div>
      `)
      .addTo(map!);
  });

  // เปลี่ยน Cursor เป็นรูปมือเวลา Hover หมุด
  const onMouseEnter = () => (map!.getCanvas().style.cursor = "pointer");
  const onMouseLeave = () => (map!.getCanvas().style.cursor = "");
  
  map.on("mouseenter", LAYER_CLUSTER_ID, onMouseEnter);
  map.on("mouseleave", LAYER_CLUSTER_ID, onMouseLeave);
  map.on("mouseenter", LAYER_UNCLUSTERED_ID, onMouseEnter);
  map.on("mouseleave", LAYER_UNCLUSTERED_ID, onMouseLeave);
};

// ── Map init ───────────────────────────────────────────
const initMap = () => {
  map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: [98.9853, 18.7883], // เชียงใหม่
    zoom: 10,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl(), "bottom-left");

  // เมื่อ Map สไตล์โหลดเสร็จแล้วค่อยสร้าง Layer
  map.on("load", () => {
    setupMapLayers();
    // ถ้าข้อมูล API มาถึงก่อน Map โหลดเสร็จ ให้รีเฟรชข้อมูลใส่ซ้ำอีกรอบ
    if (sites.value.length > 0) {
      updateMapSource();
    }
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