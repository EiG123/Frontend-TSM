

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";

// ── External libs (loaded via CDN in index.html or vite config) ──
// Make sure to include these in your index.html:

const PAGE_SIZE = 50

// ── Theme ──
const theme = ref(localStorage.getItem('theme') || 'dark')
function setTheme(t) {
  theme.value = t
  localStorage.setItem('theme', t)
}

// ── Upload state ──
const isDragging = ref(false)
const fileName = ref('')
const rawData = ref([])

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) loadFile(file)
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) loadFile(file)
}

function loadFile(file) {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = window.XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rawData.value = window.XLSX.utils.sheet_to_json(sheet)
    initFilters()
    showToast(`✅ Loaded ${rawData.value.length} records`)
  }
  reader.readAsArrayBuffer(file)
}

// ── Filters ──
const filterChain = [
  { id: 'region',   field: 'REGION',   label: 'Region'   },
  { id: 'province', field: 'PROVINCE', label: 'Province' },
  { id: 'amphur',   field: 'AMPHUR',   label: 'Amphur'   },
  { id: 'tambol',   field: 'TAMBOL',   label: 'Tambol'   },
  { id: 'system',   field: 'system',   label: 'System'   },
  { id: 'operator', field: 'operator', label: 'Operator' },
]

const filters = reactive({
  region: '', province: '', amphur: '', tambol: '', system: '', operator: ''
})

const filterOptions = reactive({
  region: [], province: [], amphur: [], tambol: [], system: [], operator: []
})

function unique(field, data) {
  return [...new Set(data.map(d => d[field]))].filter(v => v !== undefined && v !== null && v !== '').sort()
}

function poolUpTo(stopField) {
  let pool = [...rawData.value]
  for (const step of filterChain) {
    if (step.field === stopField) break
    const v = filters[step.id]
    if (v) pool = pool.filter(d => String(d[step.field]) === v)
  }
  return pool
}

function initFilters() {
  filterChain.forEach(({ id, field }) => {
    filterOptions[id] = unique(field, rawData.value)
    filters[id] = ''
  })
}

function onFilterChange(changedId) {
  const changedIdx = filterChain.findIndex(s => s.id === changedId)
  for (let i = changedIdx + 1; i < filterChain.length; i++) {
    const step = filterChain[i]
    const pool = poolUpTo(step.field)
    filterOptions[step.id] = unique(step.field, pool)
    // Reset value if no longer valid
    if (filters[step.id] && !filterOptions[step.id].includes(filters[step.id])) {
      filters[step.id] = ''
    }
  }
}

function getFiltered() {
  let data = [...rawData.value]
  filterChain.forEach(({ id, field }) => {
    const v = filters[id]
    if (v) data = data.filter(d => String(d[field]) === v)
  })
  return data
}

// ── Targets ──
const target = ref(99.90)
const maxVal = ref(99.90)

// ── Simulation state ──
const showStats  = ref(false)
const showChart  = ref(false)
const showTable  = ref(false)
const allSiteData = ref([])
const fixSiteSet  = ref(new Set())
const stats = reactive({
  totalSystems: 0,
  totalSites: null,
  avgDisplay: '—',
  avgClass: '',
  fixSystems: 0,
  fixSites: null,
  postAvg: '—',
})

// ── Pagination ──
const currentPage = ref(1)
const filterShow  = ref('all')

const displayData = computed(() => {
  const show = filterShow.value
  if (show === 'fix') return allSiteData.value.filter(d => fixSiteSet.value.has(d._idx))
  if (show === 'ok')  return allSiteData.value.filter(d => !fixSiteSet.value.has(d._idx))
  return allSiteData.value
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayData.value.length / PAGE_SIZE)))

const pageInfo = computed(() => {
  const total = displayData.value.length
  const start = (currentPage.value - 1) * PAGE_SIZE
  return `${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total}`
})

const pageRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return displayData.value.slice(start, start + PAGE_SIZE)
})

const dataColKeys = computed(() => {
  if (!allSiteData.value.length) return []
  return Object.keys(allSiteData.value[0]).filter(k => k !== 'availability' && k !== '_idx')
})

const tableCols = computed(() => ['availability', 'status', ...dataColKeys.value])

function renderPage(page) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}

function changePage(dir) {
  renderPage(currentPage.value + dir)
}

// ── Simulate ──
function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function simulate() {
  if (!rawData.value.length) { showToast('⚠️ Please upload a file first'); return }

  let data = getFiltered().map((d, i) => ({
    ...d,
    _idx: i,
    availability: parseFloat(d['Average of site_availability']) || 0
  }))

  if (!data.length) { showToast('⚠️ No data matches filters'); return }

  data.sort((a, b) => a.availability - b.availability)

  const t = target.value
  const m = maxVal.value

  let values = data.map(d => d.availability)
  let current = avg(values)
  const initial = current
  const newFixSet = new Set()

  for (let i = 0; i < values.length; i++) {
    if (current >= t) break
    values[i] = m
    newFixSet.add(data[i]._idx)
    current = avg(values)
  }

  fixSiteSet.value = newFixSet
  allSiteData.value = data

  const totalSystems = data.length
  const siteField = ['site', 'SITE', 'site_id', 'SITE_ID', 'siteid', 'SITEID', 'site_name', 'SITE_NAME']
    .find(f => data.length > 0 && data[0][f] !== undefined) || null

  const totalSites = siteField
    ? new Set(data.map(d => d[siteField]).filter(v => v !== undefined && v !== null && v !== '')).size
    : null

  const fixData = data.filter(d => newFixSet.has(d._idx))
  const fixSystems = fixData.length
  const fixSites = siteField
    ? new Set(fixData.map(d => d[siteField]).filter(v => v !== undefined && v !== null && v !== '')).size
    : null

  stats.totalSystems = totalSystems
  stats.totalSites   = totalSites
  stats.avgDisplay   = initial.toFixed(4) + '%'
  stats.avgClass     = initial >= t ? 'good' : initial >= t - 0.1 ? 'warn' : 'bad'
  stats.fixSystems   = fixSystems
  stats.fixSites     = fixSites
  stats.postAvg      = current.toFixed(4) + '%'

  showStats.value = true
  showChart.value = true
  showTable.value = true
  filterShow.value = 'all'
  renderPage(1)

  nextTick(() => drawChart(data, t))
  showToast(`✅ Simulation done — ${newFixSet.size} row(s) to fix`)
}

function availClass(av) {
  if (av >= target.value) return 'avail-good'
  if (av >= target.value - 0.1) return 'avail-warn'
  return 'avail-bad'
}

// ── Chart ──
const chartCanvas = ref(null)
let chartInstance = null

function drawChart(data, tgt) {
  const isDark = theme.value === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#6b7494' : '#7a84a8'

  const labels = data.map(d => d.site || d.SITE || '—')
  const vals   = data.map(d => d.availability)
  const colors = vals.map(v => v >= tgt ? '#30d98a' : v >= tgt - 0.1 ? '#f7b94f' : '#f75a5a')

  if (chartInstance) chartInstance.destroy()

  chartInstance = new window.Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Availability (%)',
        data: vals,
        backgroundColor: colors,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(4)}%` },
          backgroundColor: isDark ? '#1e2330' : '#fff',
          titleColor: isDark ? '#e8eaf0' : '#1a1e2e',
          bodyColor: isDark ? '#6b7494' : '#7a84a8',
          borderColor: isDark ? '#2a3045' : '#d0d8ee',
          borderWidth: 1,
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { family: 'DM Mono', size: 10 }, maxRotation: 45 },
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: textColor, font: { family: 'DM Mono', size: 11 }, callback: v => v.toFixed(2) + '%' },
          grid: { color: gridColor },
          min: Math.max(0, Math.min(...vals) - 0.1),
        }
      }
    }
  })
}

// Redraw chart when theme changes (if chart is visible)
watch(theme, () => {
  if (showChart.value && allSiteData.value.length) {
    nextTick(() => drawChart(allSiteData.value, target.value))
  }
})

// ── Toast ──
const toastMsg     = ref('')
const toastVisible = ref(false)
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 3000)
}
</script>

<template>
  <div :data-theme="theme">
    <!-- Header -->
    <header class="app-header">
      <div class="brand">
        <div class="brand-icon">📡</div>
        <span class="brand-title">Availability Dashboard</span>
      </div>
    </header>

    <!-- Upload -->
    <div
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input type="file" accept=".xlsx,.xls,.csv" @change="onFileChange" />
      <div class="upload-icon">📂</div>
      <div class="upload-label">Drop your Excel / CSV file here</div>
      <div class="upload-sub">Click to browse or drag &amp; drop</div>
      <div v-if="fileName" class="file-name">📄 {{ fileName }}</div>
    </div>

    <div class="main">

      <!-- Stats -->
      <div v-if="showStats" class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total System</div>
          <div class="stat-value neutral">{{ stats.totalSystems }}</div>
          <div class="stat-sub">in selection</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Sites</div>
          <div class="stat-value neutral">{{ stats.totalSites !== null ? stats.totalSites : '—' }}</div>
          <div class="stat-sub">in selection</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Availability</div>
          <div class="stat-value" :class="stats.avgClass">{{ stats.avgDisplay }}</div>
          <div class="stat-sub">current</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">System To Fix</div>
          <div class="stat-value bad">{{ stats.fixSystems }}</div>
          <div class="stat-sub">below target</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Sites To Fix</div>
          <div class="stat-value bad">{{ stats.fixSites !== null ? stats.fixSites : '—' }}</div>
          <div class="stat-sub">below target</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Post-Fix Avg</div>
          <div class="stat-value good">{{ stats.postAvg }}</div>
          <div class="stat-sub">after simulation</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-title">Filters</div>
        <div class="filters-grid">
          <div class="filter-group" v-for="f in filterChain" :key="f.id">
            <label class="filter-label">{{ f.label }}</label>
            <select v-model="filters[f.id]" @change="onFilterChange(f.id)">
              <option value="">ALL</option>
              <option v-for="opt in filterOptions[f.id]" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
        <div class="target-row">
          <div class="filter-group">
            <label class="filter-label">Target Availability (%)</label>
            <input v-model.number="target" type="number" step="0.01" min="0" max="100" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Max Availability (%)</label>
            <input v-model.number="maxVal" type="number" step="0.01" min="0" max="100" />
          </div>
          <button class="btn-simulate" @click="simulate">▶ Simulate</button>
        </div>
      </div>

      <!-- Chart -->
      <div v-if="showChart" class="card">
        <div class="card-title">Availability Distribution</div>
        <div class="chart-wrap">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Site Table -->
      <div v-if="showTable" class="card">
        <div class="card-header-row">
          <div class="card-title" style="margin-bottom:0">
            All Sites
            <span v-if="fixSiteSet.size > 0" class="badge badge-fix">{{ fixSiteSet.size }} need fix</span>
          </div>
          <div class="table-controls">
            <label class="filter-label" style="white-space:nowrap">Show</label>
            <select v-model="filterShow" style="width:auto;min-width:130px" @change="renderPage(1)">
              <option value="all">All Sites</option>
              <option value="fix">Need to Fix Only</option>
              <option value="ok">OK Sites Only</option>
            </select>
            <span class="page-info">{{ pageInfo }}</span>
            <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(-1)">&#8249; Prev</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(1)">Next &#8250;</button>
          </div>
        </div>
        <div class="table-wrap" style="margin-top:16px">
          <table>
            <thead>
              <tr>
                <th v-for="col in tableCols" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pageRows.length">
                <td :colspan="tableCols.length">
                  <div class="empty-state"><span>🎉</span>No sites in this view!</div>
                </td>
              </tr>
              <tr
                v-for="(row, i) in pageRows"
                :key="i"
                :class="{ 'row-fix': fixSiteSet.has(row._idx) }"
              >
                <td class="avail-cell" :class="availClass(row.availability)">
                  {{ isNaN(row.availability) ? '—' : row.availability.toFixed(4) + '%' }}
                </td>
                <td>
                  <span v-if="fixSiteSet.has(row._idx)" class="fix-pill">NEED FIX</span>
                  <span v-else style="color:var(--success);font-size:11px;font-family:'DM Mono',monospace;font-weight:700;">✓ OK</span>
                </td>
                <td v-for="col in dataColKeys" :key="col">{{ row[col] ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --transition: 0.25s ease;
}

[data-theme="dark"] {
  --bg: #0d0f14;
  --surface: #161a23;
  --surface2: #1e2330;
  --border: #2a3045;
  --text: #e8eaf0;
  --text-muted: #6b7494;
  --accent: #4f8ef7;
  --accent2: #7c5af7;
  --success: #30d98a;
  --warning: #f7b94f;
  --danger: #f75a5a;
  --chart-grid: rgba(255,255,255,0.05);
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
  --glow: 0 0 20px rgba(79,142,247,0.15);
}

[data-theme="light"] {
  --bg: #f0f2f8;
  --surface: #ffffff;
  --surface2: #e8edf8;
  --border: #d0d8ee;
  --text: #1a1e2e;
  --text-muted: #7a84a8;
  --accent: #2563eb;
  --accent2: #6c3af0;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --chart-grid: rgba(0,0,0,0.06);
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
  --glow: 0 0 20px rgba(37,99,235,0.1);
}

/* Root wrapper inherits theme via :data-theme on div */
div[data-theme] {
  font-family: 'Syne', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background var(--transition), color var(--transition);
}

/* ── Layout ── */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 36px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}

.brand { display: flex; align-items: center; gap: 12px; }

.brand-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}

.brand-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions { display: flex; align-items: center; gap: 12px; }

.theme-toggle {
  display: flex;
  align-items: center;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 4px;
  gap: 2px;
}

.theme-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  display: flex; align-items: center; gap: 5px;
}

.theme-btn.active { background: var(--accent); color: #fff; }

/* Upload */
.upload-zone {
  margin: 28px 36px;
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  background: var(--surface);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: var(--accent);
  background: var(--surface2);
  box-shadow: var(--glow);
}

.upload-zone input[type="file"] {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  opacity: 0; cursor: pointer;
}

.upload-icon { font-size: 32px; margin-bottom: 8px; }

.upload-label { font-size: 15px; font-weight: 600; color: var(--text); }

.upload-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: 'DM Mono', monospace;
}

.file-name {
  display: inline-block;
  margin-top: 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--accent);
}

/* Main */
.main {
  padding: 0 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cards */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
  transition: background var(--transition), border-color var(--transition);
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 8px;
}

.card-title::before {
  content: '';
  display: inline-block;
  width: 14px; height: 3px;
  border-radius: 2px;
  background: var(--accent);
}

/* Filters */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.filter-group { display: flex; flex-direction: column; gap: 5px; }

.filter-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: 'DM Mono', monospace;
}

select,
input[type="number"] {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  padding: 9px 12px;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7494' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

input[type="number"] {
  background-image: none;
  padding-right: 12px;
}

select:focus,
input[type="number"]:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,142,247,0.15);
}

.target-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.target-row .filter-group {
  flex: 1;
  min-width: 160px;
  max-width: 220px;
}

.btn-simulate {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity var(--transition), transform var(--transition), box-shadow var(--transition);
  white-space: nowrap;
  align-self: flex-end;
}

.btn-simulate:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79,142,247,0.35);
}

.btn-simulate:active { transform: translateY(0); }

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px;
  transition: all var(--transition);
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: 'DM Mono', monospace;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
}

.stat-value.good    { color: var(--success); }
.stat-value.warn    { color: var(--warning); }
.stat-value.bad     { color: var(--danger); }
.stat-value.neutral { color: var(--accent); }

.stat-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: 'DM Mono', monospace;
}

/* Chart */
.chart-wrap { position: relative; width: 100%; height: 320px; }

/* Table */
.table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: 'DM Mono', monospace;
}

thead tr { background: var(--surface2); }

th {
  padding: 11px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  transition: background var(--transition);
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface2); }

.avail-cell { font-weight: 600; }
.avail-good { color: var(--success); }
.avail-warn { color: var(--warning); }
.avail-bad  { color: var(--danger); }

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.empty-state span { font-size: 36px; display: block; margin-bottom: 12px; }

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
}

.badge-fix {
  background: rgba(247, 90, 90, 0.15);
  color: var(--danger);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: var(--shadow);
  transform: translateY(80px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 999;
  max-width: 300px;
}

.toast.show { transform: translateY(0); opacity: 1; }

/* Card header */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-info {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 90px;
  text-align: center;
}

.page-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all var(--transition);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

tr.row-fix td { background: rgba(247,90,90,0.06); }
tr.row-fix:hover td { background: rgba(247,90,90,0.12); }

.fix-pill {
  display: inline-block;
  background: rgba(247,90,90,0.18);
  color: var(--danger);
  font-size: 10px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
  padding: 1px 7px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  vertical-align: middle;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>