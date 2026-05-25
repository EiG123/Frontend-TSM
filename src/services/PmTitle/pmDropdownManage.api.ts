import axios from "axios";

export const pmDropdownManage = {
    async AddDropDown(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/pmDropdown/AddDropDown",
            { ...data }
        );
        return response.data;
    },

    async deleteDropdownById(id: any) {
        const response = await axios.post("http://localhost:3000/api/pmDropdown/deleteDropdownById", { id });
        return response.data;
    },

    async deleteDropdownMemberById(id: any) {
        const response = await axios.post("http://localhost:3000/api/pmDropdown/deleteDropdownMemberById", { id });
        return response.data;
    },

    async getAllDropdown() {
        const response = await axios.get("http://localhost:3000/api/pmDropdown/getAllDropdown");
        return response.data;
    },

    async getDropdownMemberById(id: any) {
        const response = await axios.post("http://localhost:3000/api/pmDropdown/getDropdownMemberById", { id });
        return response.data;
    },

    async AddDropDownMemberById(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmDropdown/AddDropDownMemberById",
            { ...data });
        return response.data;
    },

    async getAllDropdownNameAndValue() {
        const response = await axios.get("http://localhost:3000/api/pmDropdown/getAllDropdownNameAndValue");
        return response.data;
    }
};
