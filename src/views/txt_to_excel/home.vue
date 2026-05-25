<script setup lang="ts">
import { ref } from "vue";
import { v } from "vue-router/dist/router-CWoNjPRp.mjs";
import { txt_to_excelManage } from "../../services/TxtToExcel/txt_to_excelManage.api";
import { onUnmounted } from "vue";

const taskId = ref<string | null>(null);
const progress = ref<number>(0);
const progressMessage = ref<string>("");

let progressTimer: number | null = null;

const selectedFile = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const isLoading = ref(false); // เพิ่มสถานะ Loading

onUnmounted(() => {
  stopProgressPolling();
});

const startProgressPolling = () => {
  if (!taskId.value) return;

  progressTimer = window.setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:8000/progress/${taskId.value}`);
      const data = await res.json();

      progress.value = data.progress ?? 0;
      progressMessage.value = data.message ?? "";

      console.log(data);

      if (data.status === "done") {
        stopProgressPolling();
        isLoading.value = false;
        downloadResult();
      }

      if (data.status === "error") {
        stopProgressPolling();
        isLoading.value = false;
        alert("เกิดข้อผิดพลาดระหว่างแปลงไฟล์");
      }
    } catch (err) {
      console.error("Progress error:", err);
    }
  }, 1500);
};

const stopProgressPolling = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
};

const downloadResult = async () => {
  if (!taskId.value) return;

  try {
    const res = await fetch(`http://localhost:8000/download/${taskId.value}`);

    if (!res.ok) {
      throw new Error("Download failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `result_${taskId.value}.xlsx`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
    alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
  }
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    alert("กรุณาเลือกไฟล์ก่อนครับ");
    return;
  }

  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const response = await txt_to_excelManage.txt_to_excel(formData);

    taskId.value = response.task_id;

    startProgressPolling();

    selectedFile.value = null;
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    isLoading.value = false; // ปิดเฉพาะกรณี error
  }
};
</script>


<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        type="file"
        accept=".txt"
        @change="handleFileChange"
        :disabled="isLoading"
      />
    </div>

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? "กำลังประมวลผล..." : "Convert" }}
    </button>

    <div v-if="isLoading" class="w-full bg-gray-200 rounded h-3">
      <p>{{ progressMessage }}</p>
      <div
        class="bg-blue-500 h-3 rounded transition-all duration-300"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </form>
</template>

