<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref } from "vue";
import { pmDropdownManage } from "../../../services/PmTitle/pmDropdownManage.api";

const router = useRouter();
const route = useRoute();

const Id = ref(route.params.id as string);

const dropdown_member = ref("");

const handleSubmit = async () => {
  const res = await pmDropdownManage.AddDropDownMemberById({
    id: Id.value,
    dropdown_member: dropdown_member.value,
  });
  if (res.data.success) {
    router.push(`/pm_dropdown_member/${Id.value}`);
  } else {
    alert("add dropdown member ไม่สำเร็จ");
  }
};


</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>New Dropdown</div>

    <div>
      <label>Dropdown Member</label>
      <div>
        <input v-model="dropdown_member" type="text" />
      </div>
    </div>

    <button>Submit</button>
  </form>
</template>
