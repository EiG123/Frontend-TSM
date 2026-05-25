<script setup lang="ts">
import { onMounted } from "vue";
import {siteManage} from "../../services/sites/siteManage.api";
import maplibregl from "maplibre-gl";

const loadData = async () => {
    const res = await siteManage.getAllSite();
    console.log(res);
    console.log(res.data.result[1000].latitude);
    console.log(res.data.result[1000].longitude);
}

// ── Map ────────────────────────────────────────────────
let map: maplibregl.Map | null = null;

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
  map.on("load", loadCable);
};

onMounted(async () => {
    await loadData();
});
</script>

<template>
    <div>
        
    </div>
</template>
