<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CableFiberOpticManage } from "../../services/CableFiberOptic/CableFiberOpticManage.api";

// ── Props ──────────────────────────────────────────────
const props = defineProps<{ id: string | number }>();
const router = useRouter();

// ── Types ──────────────────────────────────────────────
interface Cable {
  id?: number | string;
  geom: GeoJSON.LineString | GeoJSON.MultiLineString | null;
  cable_code: string;
  [key: string]: unknown;
}

type CableGeom = GeoJSON.LineString | GeoJSON.MultiLineString;

// ── Map ────────────────────────────────────────────────
let map: maplibregl.Map | null = null;

// ── State ──────────────────────────────────────────────
const isLoading = ref(true);
const error = ref<string | null>(null);
const cable = ref<Cable | null>(null);

// Edit dialog
const editOpen = ref(false);
const editCableCode = ref("");
const editFile = ref<File | null>(null);
const editFileName = ref("");
const isSaving = ref(false);
const editError = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Delete dialog
const deleteOpen = ref(false);
const isDeleting = ref(false);

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

// ── Fit map to cable geom ──────────────────────────────
const fitToGeom = (geom: GeoJSON.LineString | GeoJSON.MultiLineString) => {
  if (!map) return;
  const coords =
    geom.type === "LineString" ? geom.coordinates : geom.coordinates.flat(1);
  if (!coords.length) return;
  const bounds = coords.reduce(
    (b, c) => b.extend(c as [number, number]),
    new maplibregl.LngLatBounds(
      coords[0] as [number, number],
      coords[0] as [number, number]
    )
  );
  map.fitBounds(bounds, { padding: 60, maxZoom: 17, duration: 800 });
};

// ── Render cable on map ────────────────────────────────
const renderCable = (c: Cable) => {
  if (!map) return;

  // Clear previous layers/source
  ["cables-hover", "cables-layer", "cables-glow"].forEach((id) => {
    if (map!.getLayer(id)) map!.removeLayer(id);
  });
  if (map.getSource("cables")) map.removeSource("cables");

  if (!c.geom) return;

  map.addSource("cables", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: c.geom,
          properties: { cable_code: c.cable_code },
        },
      ],
    },
  });

  map.addLayer({
    id: "cables-glow",
    type: "line",
    source: "cables",
    paint: {
      "line-color": "#38bdf8",
      "line-width": 10,
      "line-opacity": 0.18,
      "line-blur": 5,
    },
  });
  map.addLayer({
    id: "cables-layer",
    type: "line",
    source: "cables",
    paint: { "line-color": "#0ea5e9", "line-width": 3, "line-opacity": 0.95 },
  });
  map.addLayer({
    id: "cables-hover",
    type: "line",
    source: "cables",
    paint: { "line-color": "#f59e0b", "line-width": 5, "line-opacity": 0 },
  });

  // Hover tooltip
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  map.on("mousemove", "cables-layer", (e) => {
    map!.getCanvas().style.cursor = "pointer";
    map!.setPaintProperty("cables-hover", "line-opacity", 0.8);
    popup
      .setLngLat(e.lngLat)
      .setHTML(
        `<div style="font-family:monospace;font-size:13px;padding:4px 10px;background:#0f172a;color:#38bdf8;border-radius:6px;border:1px solid #1e3a5f;">
          📡 ${c.cable_code}
        </div>`
      )
      .addTo(map!);
  });
  map.on("mouseleave", "cables-layer", () => {
    map!.getCanvas().style.cursor = "";
    map!.setPaintProperty("cables-hover", "line-opacity", 0);
    popup.remove();
  });

  fitToGeom(c.geom as CableGeom);
};

// ── Load data ──────────────────────────────────────────
const loadCable = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await CableFiberOpticManage.getCableById(props.id);
    // Support both single object and array response
    const raw = response.data;
    cable.value = (Array.isArray(raw) ? raw[0] : raw) as Cable;

    console.log(response);

    if (cable.value) renderCable(cable.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load cable";
    console.error("[CableDetail] loadCable error:", err);
  } finally {
    isLoading.value = false;
  }
};

// ── Edit ───────────────────────────────────────────────
const openEdit = () => {
  if (!cable.value) return;
  editCableCode.value = cable.value.cable_code;
  editFile.value = null;
  editFileName.value = "";
  editError.value = null;
  editOpen.value = true;
};

const closeEdit = () => {
  editOpen.value = false;
  editError.value = null;
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["kml", "kmz"].includes(ext ?? "")) {
    editError.value = "รองรับเฉพาะไฟล์ .kml หรือ .kmz เท่านั้น";
    input.value = "";
    return;
  }
  editError.value = null;
  editFile.value = file;
  editFileName.value = file.name;
};

const clearFile = () => {
  editFile.value = null;
  editFileName.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const saveEdit = async () => {
  if (!cable.value) return;

  if (!editCableCode.value.trim()) {
    editError.value = "กรุณากรอก Cable Code";

    return;
  }

  isSaving.value = true;

  editError.value = null;

  try {
    const formData = new FormData();

    formData.append("id", String(cable.value.id));
    formData.append("cable_code", editCableCode.value);

    // IMPORTANT
    if (editFile.value) {
      formData.append("file", editFile.value);
    }

    await CableFiberOpticManage.updateCable(formData);

    closeEdit();

    await loadCable();
  } catch (err) {
    editError.value =
      err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ";

    console.error(err);
  } finally {
    isSaving.value = false;
  }
};

// ── Delete ─────────────────────────────────────────────
const confirmDelete = async () => {
  if (!cable.value) return;
  isDeleting.value = true;
  try {
    await CableFiberOpticManage.deleteCable(
      cable.value.id ?? cable.value.cable_code
    );
    router.back();
  } catch (err) {
    console.error("[CableDetail] confirmDelete error:", err);
    alert("ลบข้อมูลไม่สำเร็จ");
  } finally {
    isDeleting.value = false;
  }
};

// ── Download ─────────────────────────────────────────────
const handleDownload = async () => {
  try {
    const blob = await CableFiberOpticManage.downloadCable(
      cable.value.id ?? cable.value.cable_code
    );

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `cable_${cable.value.id}.kmz`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[CableCable] Download error:", err);
    alert("โหลด KML ไม่สำเร็จ");
  }
};

// ── Lifecycle ──────────────────────────────────────────
onMounted(initMap);
onUnmounted(() => {
  map?.remove();
  map = null;
});

// ── Close dialogs on Escape ────────────────────────────
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeEdit();
    deleteOpen.value = false;
  }
};
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const formatDate = (date: string) => new Date(date).toLocaleString("th-TH");
</script>

<template>
  <div class="flex min-h-screen flex-col gap-0 bg-slate-50 dark:bg-slate-950">
    <!-- ── Top Bar ── -->
    <header
      class="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900"
    >
      <button
        class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        @click="router.back()"
      >
        ← กลับ
      </button>

      <span class="text-slate-300 dark:text-slate-700">/</span>

      <span class="text-sm text-slate-500 dark:text-slate-400"
        >Cable Fiber Optic GIS</span
      >

      <span class="text-slate-300 dark:text-slate-700">/</span>

      <span
        v-if="cable"
        class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {{ cable.cable_code }}
      </span>
      <div
        v-else-if="isLoading"
        class="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
      />

      <div class="ml-auto flex items-center gap-2">
        <button @click="handleDownload">✏️ โหลด KML</button>
        <button
          :disabled="isLoading || !cable"
          class="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-600 transition hover:bg-sky-500/20 disabled:pointer-events-none disabled:opacity-40 dark:text-sky-400"
          @click="openEdit"
        >
          ✏️ แก้ไข
        </button>
        <button
          :disabled="isLoading || !cable"
          class="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-500 transition hover:bg-red-500/20 disabled:pointer-events-none disabled:opacity-40"
          @click="deleteOpen = true"
        >
          🗑️ ลบ
        </button>
      </div>
    </header>

    <!-- ── Body ── -->
    <div class="flex flex-1 flex-col gap-4 p-5 lg:flex-row">
      <!-- Left: info card -->
      <aside class="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
        <!-- Cable info -->
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            ข้อมูล Cable
          </p>

          <!-- Skeleton -->
          <template v-if="isLoading">
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="flex flex-col gap-1">
                <div
                  class="h-2.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                />
                <div
                  class="h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                />
              </div>
            </div>
          </template>

          <!-- Data -->
          <template v-else-if="cable">
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-xs text-slate-400">Cable Code</dt>
                <dd
                  class="mt-0.5 font-mono font-semibold text-slate-800 dark:text-slate-100"
                >
                  {{ cable.cable_code }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-400">ID</dt>
                <dd class="mt-0.5 font-mono text-slate-600 dark:text-slate-300">
                  {{ cable.id ?? "—" }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-400">Geometry Type</dt>
                <dd class="mt-0.5 text-slate-600 dark:text-slate-300">
                  <span
                    class="inline-block rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-500"
                  >
                    {{ cable.geom?.type ?? "No geometry" }}
                  </span>
                </dd>
              </div>
              <div v-if="cable.geom">
                <dt class="text-xs text-slate-400">Coordinates</dt>
                <dd class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {{
                    cable.geom.type === "LineString"
                      ? cable.geom.coordinates.length
                      : cable.geom.coordinates.reduce((s, c) => s + c.length, 0)
                  }}
                  จุด
                </dd>
              </div>
            </dl>

            <!-- Extra fields (anything that's not id/geom/cable_code) -->
            <template
              v-if="
                Object.keys(cable).filter(
                  (k) => !['id', 'geom', 'cable_code'].includes(k)
                ).length
              "
            >
              <hr class="my-3 border-slate-200 dark:border-slate-700" />
              <dl class="space-y-3 text-sm">
                <div
                  v-for="key in Object.keys(cable).filter(
                    (k) => !['id', 'geom', 'cable_code'].includes(k)
                  )"
                  :key="key"
                >
                  <dt class="text-xs capitalize text-slate-400">{{ key }}</dt>
                  <dd
                    v-if="
                      key != 'survey_date' &&
                      key != 'created_at' &&
                      key != 'updated_at'
                    "
                    class="mt-0.5 truncate text-slate-600 dark:text-slate-300"
                  >
                    {{ cable[key] ?? "—" }}
                  </dd>
                  <div
                    v-if="
                      key === 'survey_date' ||
                      key === 'created_at' ||
                      key === 'updated_at'
                    "
                  >
                    {{ formatDate(cable[key]) }}
                  </div>
                </div>
              </dl>
            </template>
          </template>

          <!-- Error state -->
          <p v-else class="text-sm text-red-400">ไม่พบข้อมูล</p>
        </div>
      </aside>

      <!-- Right: map -->
      <div
        class="relative flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700"
        style="min-height: 420px"
      >
        <div id="map" class="h-full w-full" style="min-height: 420px" />

        <!-- Loading overlay -->
        <Transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isLoading"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-sm"
          >
            <div
              class="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-700 border-t-sky-400"
            />
            <p class="text-sm text-slate-300">กำลังโหลด…</p>
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
              @click="loadCable"
            >
              Retry
            </button>
          </div>
        </Transition>

        <!-- No geom notice -->
        <div
          v-if="!isLoading && cable && !cable.geom"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-900/40 backdrop-blur-sm"
        >
          <span class="text-3xl">📍</span>
          <p class="text-sm text-slate-300">ไม่มีข้อมูล Geometry</p>
          <p class="text-xs text-slate-400">
            อัปโหลดไฟล์ KML/KMZ เพื่อเพิ่มเส้นทาง
          </p>
          <button
            class="mt-1 rounded-lg border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/20"
            @click="openEdit"
          >
            ✏️ แก้ไข / อัปโหลดไฟล์
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         Edit Dialog
    ══════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="editOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
        @click.self="closeEdit"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          @click.stop
        >
          <!-- Dialog header -->
          <div
            class="flex items-center justify-between border-b border-slate-700/60 px-5 py-4"
          >
            <h2 class="text-sm font-semibold text-slate-100">✏️ แก้ไข Cable</h2>
            <button
              class="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
              @click="closeEdit"
            >
              ✕
            </button>
          </div>

          <!-- Dialog body -->
          <div class="flex flex-col gap-5 px-5 py-5">
            <!-- Cable Code -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">
                Cable Code <span class="text-red-400">*</span>
              </label>
              <input
                v-model="editCableCode"
                type="text"
                placeholder="เช่น FOC-CM-001"
                class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <!-- KML / KMZ upload -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">
                อัปโหลดไฟล์ KML / KMZ
                <span class="ml-1 text-slate-500"
                  >(ถ้าต้องการอัปเดต Geometry)</span
                >
              </label>

              <!-- Drop zone -->
              <div
                class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 px-4 py-6 text-center transition hover:border-sky-500/60 hover:bg-sky-500/5"
                @click="fileInputRef?.click()"
                @dragover.prevent
                @drop.prevent="
                  (e) => {
                    const f = e.dataTransfer?.files?.[0];
                    if (f) {
                      const ext = f.name.split('.').pop()?.toLowerCase();
                      if (['kml', 'kmz'].includes(ext ?? '')) {
                        editFile = f;
                        editFileName = f.name;
                        editError = null;
                      } else {
                        editError = 'รองรับเฉพาะไฟล์ .kml หรือ .kmz เท่านั้น';
                      }
                    }
                  }
                "
              >
                <span class="text-2xl">📂</span>
                <p class="text-xs text-slate-400">
                  คลิกเพื่อเลือกไฟล์ หรือลากวางที่นี่
                </p>
                <p class="text-[11px] text-slate-600">.kml, .kmz เท่านั้น</p>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".kml,.kmz"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>

              <!-- Selected file chip -->
              <div
                v-if="editFileName"
                class="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2"
              >
                <span class="text-sm">📄</span>
                <span class="flex-1 truncate font-mono text-xs text-sky-300">
                  {{ editFileName }}
                </span>
                <button
                  class="text-slate-400 transition hover:text-red-400"
                  @click.stop="clearFile"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Error message -->
            <p
              v-if="editError"
              class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400"
            >
              ⚠️ {{ editError }}
            </p>
          </div>

          <!-- Dialog footer -->
          <div
            class="flex justify-end gap-2 border-t border-slate-700/60 px-5 py-4"
          >
            <button
              class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:bg-slate-800"
              @click="closeEdit"
            >
              ยกเลิก
            </button>
            <button
              :disabled="isSaving"
              class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
              @click="saveEdit"
            >
              <span
                v-if="isSaving"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ isSaving ? "กำลังบันทึก…" : "บันทึก" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════
         Delete Confirm Dialog
    ══════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="deleteOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
        @click.self="deleteOpen = false"
      >
        <div
          class="w-full max-w-sm rounded-2xl border border-red-900/40 bg-slate-900 p-6 shadow-2xl"
        >
          <div class="mb-3 text-3xl">🗑️</div>
          <h2 class="mb-1 text-base font-semibold text-slate-100">
            ยืนยันการลบ Cable
          </h2>
          <p class="mb-6 text-sm text-slate-400">
            คุณต้องการลบ
            <span class="font-mono font-semibold text-red-400">
              {{ cable?.cable_code }}
            </span>
            ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <div class="flex justify-end gap-2">
            <button
              class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:bg-slate-800"
              @click="deleteOpen = false"
            >
              ยกเลิก
            </button>
            <button
              :disabled="isDeleting"
              class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
              @click="confirmDelete"
            >
              <span
                v-if="isDeleting"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ isDeleting ? "กำลังลบ…" : "ลบ" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>