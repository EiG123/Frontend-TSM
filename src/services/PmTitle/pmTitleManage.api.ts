import axios from "axios";

export const pmTitleManage = {
    async AddpmTitle(
        pm_name: string,
        pm_description: string,
        pm_key: string,
        pm_type: string,
        pm_status: string,
        pm_rank: number
    ) {
        const response = await axios.post(
            "http://localhost:3000/api/pmTitle/AddPmTitle", {
            pm_name,
            pm_description,
            pm_key,
            pm_type,
            pm_status,
            pm_rank
        }
        );
        return response.data;
    },

    async EditpmTitle(
        data: any
    ) {
        const response = await axios.post(
            "http://localhost:3000/api/pmTitle/EditpmTitle", {
            ...data
        }
        );
        return response.data;
    },

    async getAllPmTitle(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getAllPmTitle", { data });
        return response.data;
    },

    async getPmTitleById(id: string) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getPmTitleById", { id });
        return response.data;
    },

    async getAllPmTitleChild(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getAllPmTitleChild", { data });
        return response.data;
    },

    async AddpmTitleChild(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/pmTitle/AddPmTitleChild",
            { data }
        );
        return response.data;
    },

    async deleteTitleChildById(id: number) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/deleteTitleChildById", { id });
        return response.data;
    },
    async deleteTitleById(id: number) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/deleteTitleById", { id });
        return response.data;
    },

    async getTitleByType(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleByType", data);
        return response.data;
    },

    async getTitleChildByTitle(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleChildByTitle", { ...data });
        return response.data;
    },

    async getTitleChildDataByTitle(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleChildDataByTitle", { ...data });
        return response.data;
    },

    // async getTitleChildValueByTitle(data: any) {
    //     const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleChildValueByTitle", { ...data });
    //     return response.data;
    // },

    async getTitleChildById(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleChildById", { data })
        return response.data;
    },

    async EditpmTitleChild(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/EditpmTitleChild", { data })
        return response.data;
    },

    async getTitleChildData(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getTitleChildData", { data })
        return response.data;
    },

    async getAllTitleInfo(data: any) {
        const response = await axios.post("http://localhost:3000/api/pmTitle/getAllTitleInfo", { data })
        return response.data.data;
    }
};
