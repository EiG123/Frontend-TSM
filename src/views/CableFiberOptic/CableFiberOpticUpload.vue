<script setup lang="ts">
import { ref } from 'vue'
import { CableFiberOpticManage } from "../../services/CableFiberOptic/CableFiberOpticManage.api";

const selectedFiles = ref<File[]>([])

const uploading = ref(false)

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement

    if (target.files) {
        selectedFiles.value = Array.from(target.files)
    }
}

const uploadFile = async () => {
    if (selectedFiles.value.length === 0) {
        alert('Please select KML/KMZ files')
        return
    }

    try {
        uploading.value = true

        for (const file of selectedFiles.value) {
            console.log('Uploading:', file.name)

            await CableFiberOpticManage.UploadCable(file)
        }

        alert('Upload success')

        selectedFiles.value = []

    } catch (error) {
        console.error(error)

        alert('Upload error')
    } finally {
        uploading.value = false
    }
}
</script>

<template>
    <div class="container">
        <div class="card">

            <h1>
                Cable Fiber Optic Upload
            </h1>

            <p class="description">
                Upload multiple KML / KMZ files
            </p>

            <input
                type="file"
                accept=".kml,.kmz"
                multiple
                @change="handleFileChange"
            >

            <div
                v-if="selectedFiles.length > 0"
                class="file-list"
            >
                <div
                    v-for="file in selectedFiles"
                    :key="file.name"
                    class="file-item"
                >
                    {{ file.name }}
                </div>
            </div>

            <button
                @click="uploadFile"
                :disabled="uploading"
            >
                {{
                    uploading
                        ? 'Uploading...'
                        : 'Upload'
                }}
            </button>

        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.card {
    width: 600px;
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background: #fff;
}

h1 {
    margin-bottom: 12px;
}

.description {
    margin-bottom: 20px;
    color: #666;
}

input {
    margin-bottom: 16px;
}

.file-list {
    margin-bottom: 20px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #eee;
    padding: 12px;
    border-radius: 8px;
}

.file-item {
    padding: 6px 0;
    border-bottom: 1px solid #f3f3f3;
}

.file-item:last-child {
    border-bottom: none;
}

button {
    padding: 10px 16px;
    cursor: pointer;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>