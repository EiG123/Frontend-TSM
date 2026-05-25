<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter();
const goBack = async () => {
  router.back();
}

</script>

<template>
  <div class="text-black dark:text-white text-center px-50">
    <h1>404</h1>
    <p>Page Not Found</p>
    <div @click="goBack"
    class="border">กลับหน้า Home</div>
  </div>
</template>