<script setup lang="ts">
import { onMounted, ref } from "vue";
import { pmTitleManage } from "../../services/PmTitle/pmTitleManage.api";

const TitleList = ref([]);
const type = ref("pm_nodeb");
const loadData = async () => {
    const TitleList = await pmTitleManage.getAllPmTitle({
        type: type.value
    });
    console.log(TitleList.data.result);
}

onMounted(async () => {
    await loadData();
});
</script>

<template>
    <div class="text-black dark:text-white">
        hello Admin Title Management
    </div>
</template>
