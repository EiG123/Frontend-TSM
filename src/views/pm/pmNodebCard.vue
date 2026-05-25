<!-- components/PmNodebCard.vue -->
<script setup lang="ts">
defineProps<{
  row: any;
  formatDate: (d: string) => string;
}>();

const emit = defineEmits<{
  view: [id: string];
  edit: [id: string];
  delete: [e: Event, id: number];
}>();

const serviceBadge: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  onService: {
    label: "On Service",
    cls: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    dot: "bg-green-500",
  },
  cancel: {
    label: "Cancelled",
    cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const progressBadge: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  pending: {
    label: "Pending",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  Inprogress: {
    label: "In Progress",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  checkin: {
    label: "Check In",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  checkout: {
    label: "Check Out",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    dot: "bg-purple-500",
  },
};

const defaultBadge = {
  label: "Unknown",
  cls: "bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400",
  dot: "bg-gray-400",
};
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all duration-150 cursor-pointer"
    @click="emit('view', row.id)"
  >
    <!-- ── Badges ── -->
    <div class="flex flex-wrap gap-1.5 mb-3">
      <!-- Service -->
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
        :class="(serviceBadge[row.service_status] ?? defaultBadge).cls"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="(serviceBadge[row.service_status] ?? defaultBadge).dot"
        ></span>
        {{ (serviceBadge[row.service_status] ?? defaultBadge).label }}
      </span>
      <!-- Progress -->
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
        :class="(progressBadge[row.progress_status] ?? defaultBadge).cls"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="(progressBadge[row.progress_status] ?? defaultBadge).dot"
        ></span>
        {{ (progressBadge[row.progress_status] ?? defaultBadge).label }}
      </span>
      <!-- Verify -->
      <span
        v-if="row.verify"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
      >
        ✓ {{ row.verify }}
      </span>
    </div>

    <!-- ── Site Name + ID ── -->
    <div class="mb-3">
      <p
        class="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight"
      >
        {{ row.site_name || "N/A" }}
      </p>
      <p class="text-[11px] font-mono text-slate-400 mt-0.5">
        {{ row.site_id || "" }}
      </p>
    </div>

    <!-- ── Info Grid 2 cols ── -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          Region
        </p>
        <p class="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
          {{ row.region || "—" }}
        </p>
      </div>

      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          Province
        </p>
        <p class="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
          {{ row.province || "—" }}
        </p>
      </div>

      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          Vendor
        </p>
        <p class="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
          {{ row.vendor || "—" }}
        </p>
      </div>

      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          PM Date
        </p>
        <p
          class="text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-0.5"
        >
          {{ formatDate(row.date) || "ยังไม่กำหนด" }}
        </p>
      </div>

      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          Cabinets
        </p>
        <p class="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
          {{ row.cabinets?.map((c: any) => c.cabinet_name).join(", ") || "—" }}
        </p>
      </div>

      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          SolarCell
        </p>
        <p class="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
          {{ row.solarcell?.map((s: any) => s.status).join(", ") || "—" }}
        </p>
      </div>
    </div>

    <!-- ── Footer: meta + actions ── -->
    <div
      class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/40"
      @click.stop
    >
      <!-- Meta -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[11px] text-slate-400"
          >By {{ row.created_by || "—" }}</span
        >
        <span class="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
        <span class="text-[11px] text-slate-400 font-mono">{{
          formatDate(row.created_at)
        }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5">
        <!-- View -->
        <button
          @click="emit('view', row.id)"
          class="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/25 text-blue-500 active:bg-blue-500/20 transition-all"
          title="View"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle
              cx="8"
              cy="8"
              r="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </button>
        <!-- Edit -->
        <button
          @click="emit('edit', row.id)"
          class="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-purple-500/10 border border-purple-500/25 text-purple-500 active:bg-purple-500/20 transition-all"
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <!-- Delete -->
        <button
          @click="emit('delete', $event, row.id)"
          class="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-red-500/10 border border-red-500/25 text-red-500 active:bg-red-500/20 transition-all"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.card:active {
  transform: scale(0.99);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Top */
.card-top {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

/* Title */
.card-title {
  margin-bottom: 10px;
}
.site-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}
:global(.dark) .site-name {
  color: #f1f5f9;
}
.site-id {
  font-size: 11px;
  font-family: "JetBrains Mono", monospace;
  color: #94a3b8;
}

/* Info grid — 2 cols */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.info-value {
  font-size: 12px;
  color: #334155;
}
:global(.dark) .info-value {
  color: #cbd5e1;
}
.mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}
:global(.dark) .card-footer {
  border-top-color: rgba(100, 116, 139, 0.2);
}
.meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.meta-label {
  font-size: 11px;
  color: #94a3b8;
}
.meta-sep {
  color: #cbd5e1;
  font-size: 10px;
}

/* Actions */
.action-group {
  display: flex;
  gap: 6px;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px; /* นิ้วกดได้สบาย */
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.act-btn:active {
  transform: scale(0.92);
}
.act-view {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
}
.act-edit {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.25);
  color: #7c3aed;
}
.act-del {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}
.act-view:active {
  background: rgba(59, 130, 246, 0.2);
}
.act-edit:active {
  background: rgba(139, 92, 246, 0.2);
}
.act-del:active {
  background: rgba(239, 68, 68, 0.2);
}

/* Badges — copy จาก parent ได้เลย */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}
.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
.badge-amber {
  background: #fef9c3;
  color: #a16207;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-purple {
  background: #ede9fe;
  color: #6d28d9;
}
.badge-slate {
  background: #f1f5f9;
  color: #475569;
}
.badge-verify {
  background: #f0fdf4;
  color: #166534;
}

:global(.dark) .badge-green {
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
}
:global(.dark) .badge-red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
:global(.dark) .badge-gray {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}
:global(.dark) .badge-amber {
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
}
:global(.dark) .badge-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}
:global(.dark) .badge-purple {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}
:global(.dark) .badge-slate {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}
:global(.dark) .badge-verify {
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
}

.dot-green {
  background: #22c55e;
}
.dot-red {
  background: #ef4444;
}
.dot-gray {
  background: #94a3b8;
}
.dot-amber {
  background: #f59e0b;
}
.dot-blue {
  background: #3b82f6;
}
.dot-purple {
  background: #8b5cf6;
}
.dot-slate {
  background: #64748b;
}
</style>