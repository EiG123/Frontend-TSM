<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserLocation } from "../../services/user/UserLoaction.api";

interface UserLocationData {
  user_id: number;
  latitude: number | string;
  longitude: number | string;
  updated_at?: string;
}

const map = ref<L.Map | null>(null);
const markers = ref<Map<number, L.Marker>>(new Map());
const locations = ref<UserLocationData[]>([]);
const selectedUserId = ref<number | null>(null);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const initMap = () => {
  map.value = L.map("map").setView([18.78, 98.98], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map.value);
};

const normalizeLocations = (res: unknown): UserLocationData[] => {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    for (const key of ["data", "locations", "results"]) {
      const val = (res as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val;
    }
  }
  console.warn("Unexpected response format:", res);
  return [];
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

// Default icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Highlighted icon (สีแดง)
const highlightIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const updateMarkers = (data: UserLocationData[]) => {
  if (!map.value) return;

  const activeIds = new Set(data.map((u) => u.user_id));

  markers.value.forEach((marker, id) => {
    if (!activeIds.has(id)) {
      marker.remove();
      markers.value.delete(id);
    }
  });

  data.forEach((user) => {
    const lat = Number(user.latitude);
    const lng = Number(user.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const isSelected = selectedUserId.value === user.user_id;
    const icon = isSelected ? highlightIcon : defaultIcon;

    const existing = markers.value.get(user.user_id);
    if (existing) {
      existing.setLatLng([lat, lng]);
      existing.setIcon(icon);
    } else {
      const marker = L.marker([lat, lng], { icon }).addTo(map.value!)
        .bindPopup(`
          <b>User ID:</b> ${user.user_id}<br/>
          <b>Lat:</b> ${lat}<br/>
          <b>Lng:</b> ${lng}<br/>
          <b>Updated:</b> ${formatDate(user.updated_at)}
        `);
      markers.value.set(user.user_id, marker);
    }
  });
};

// กด user ใน list
const selectUser = (user: UserLocationData) => {
  const lat = Number(user.latitude);
  const lng = Number(user.longitude);
  if (!map.value || isNaN(lat) || isNaN(lng)) return;

  // Reset icon ของ user เก่า
  if (selectedUserId.value !== null) {
    const prev = markers.value.get(selectedUserId.value);
    prev?.setIcon(defaultIcon);
  }

  selectedUserId.value = user.user_id;

  // Highlight marker ใหม่
  const marker = markers.value.get(user.user_id);
  if (marker) {
    marker.setIcon(highlightIcon);
    map.value.setView([lat, lng], 16, { animate: true });
    marker.openPopup();
  }
};

const fetchAndUpdate = async () => {
  try {
    const res = await UserLocation.getLocation();
    const normalized = normalizeLocations(res);
    locations.value = normalized;
    updateMarkers(normalized);
  } catch (err) {
    console.error("Failed to fetch locations:", err);
  }
};

const startPolling = () => {
  pollingInterval = setInterval(fetchAndUpdate, 5000);
};

onMounted(async () => {
  initMap();
  await fetchAndUpdate();
  startPolling();
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  map.value?.remove();
});
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-semibold">User Location Dashboard</h1>
      <span class="text-sm text-gray-500">Auto refresh every 5s</span>
    </div>

    <!-- Content -->
    <div class="flex-1 grid grid-cols-4 gap-4 p-4 bg-gray-100 overflow-hidden">
      <!-- Sidebar -->
      <div
        class="col-span-1 bg-white rounded-2xl shadow p-4 flex flex-col overflow-hidden"
      >
        <h2 class="font-medium mb-3">
          Users
          <span class="ml-1 text-xs text-gray-400 font-normal"
            >({{ locations.length }})</span
          >
        </h2>

        <!-- Empty state -->
        <div
          v-if="locations.length === 0"
          class="text-sm text-gray-400 text-center mt-6"
        >
          ไม่มีข้อมูล
        </div>

        <!-- List -->
        <ul class="space-y-2 text-sm overflow-y-auto flex-1">
          <li
            v-for="user in locations"
            :key="user.user_id"
            @click="selectUser(user)"
            :class="[
              'p-3 rounded-xl border cursor-pointer transition-all',
              selectedUserId === user.user_id
                ? 'bg-blue-50 border-blue-400'
                : 'hover:bg-gray-50 border-transparent hover:border-gray-200',
            ]"
          >
            <!-- User ID -->
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-gray-800">
                👤 {{ user.username }}
              </span>
              <span
                v-if="selectedUserId === user.user_id"
                class="text-xs text-blue-500 font-medium"
              >
                selected
              </span>
            </div>

            <!-- Lat / Lng -->
            <div class="text-gray-500 text-xs space-y-0.5">
              <div>
                🌐 {{ Number(user.latitude).toFixed(5) }},
                {{ Number(user.longitude).toFixed(5) }}
              </div>
              <div>🕒 {{ formatDate(user.updated_at) }}</div>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>Go to {{ user.job }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Map -->
      <div class="col-span-3 bg-white rounded-2xl shadow overflow-hidden">
        <div id="map" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<style>
#map {
  height: 100%;
}
</style>