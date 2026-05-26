import { api } from "../api.api";

export const pmDropdownManage = {
    async AddDropDown(data: any) {
        const response = await api.post(
            "/pmDropdown/AddDropDown",
            { ...data }
        );
        return response.data;
    },

    async deleteDropdownById(id: any) {
        const response = await api.post("/pmDropdown/deleteDropdownById", { id });
        return response.data;
    },

    async deleteDropdownMemberById(id: any) {
        const response = await api.post("/pmDropdown/deleteDropdownMemberById", { id });
        return response.data;
    },

    async getAllDropdown() {
        const response = await api.get("/pmDropdown/getAllDropdown");
        return response.data;
    },

    async getDropdownMemberById(id: any) {
        const response = await api.post("/pmDropdown/getDropdownMemberById", { id });
        return response.data;
    },

    async AddDropDownMemberById(data: any) {
        const response = await api.post("/pmDropdown/AddDropDownMemberById",
            { ...data });
        return response.data;
    },

    async getAllDropdownNameAndValue() {
        const response = await api.get("/pmDropdown/getAllDropdownNameAndValue");
        return response.data;
    }
};
