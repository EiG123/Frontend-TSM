<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref } from "vue";
import { pmDropdownManage } from "../../../services/PmTitle/pmDropdownManage.api";

const router = useRouter();
const route = useRoute();

const dropdown_head = ref("");
const dropdown_member = ref("N/A");

const handleSubmit = async () => {
  const res = await pmDropdownManage.AddDropDown({
    dropdown_head: dropdown_head.value,
    dropdown_member: dropdown_member.value,
  });
  if (res.data.success) {
    router.push(`/pm_dropdown`);
  } else {
    alert("add dropdown ไม่สำเร็จ");
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>New Dropdown</div>

    <div>
      <label>Dropdown Name</label>
      <div>
        <input v-model="dropdown_head" type="text" />
      </div>
    </div>

    <div>
      <label>Dropdown Value</label>
      <div>
        <input v-model="dropdown_member" type="text" disabled />
      </div>
    </div>

    <button>Submit</button>
  </form>
</template>
