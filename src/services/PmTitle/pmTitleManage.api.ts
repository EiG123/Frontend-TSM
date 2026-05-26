import { api } from "../api.api";

export const pmTitleManage = {
    async AddpmTitle(
        pm_name: string,
        pm_description: string,
        pm_key: string,
        pm_type: string,
        pm_status: string,
        pm_rank: number
    ) {
        const response = await api.post(
            "/pmTitle/AddPmTitle", {
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
        const response = await api.post(
            "/pmTitle/EditpmTitle", {
            ...data
        }
        );
        return response.data;
    },

    async getAllPmTitle(data: any) {
        const response = await api.post("/pmTitle/getAllPmTitle", { data });
        return response.data;
    },

    async getPmTitleById(id: string) {
        const response = await api.post("/pmTitle/getPmTitleById", { id });
        return response.data;
    },

    async getAllPmTitleChild(data: any) {
        const response = await api.post("/pmTitle/getAllPmTitleChild", { data });
        return response.data;
    },

    async AddpmTitleChild(data: any) {
        const response = await api.post(
            "/pmTitle/AddPmTitleChild",
            { data }
        );
        return response.data;
    },

    async deleteTitleChildById(id: number) {
        const response = await api.post("/pmTitle/deleteTitleChildById", { id });
        return response.data;
    },
    async deleteTitleById(id: number) {
        const response = await api.post("/pmTitle/deleteTitleById", { id });
        return response.data;
    },

    async getTitleByType(data: any) {
        const response = await api.post("/pmTitle/getTitleByType", data);
        return response.data;
    },

    async getTitleChildByTitle(data: any) {
        const response = await api.post("/pmTitle/getTitleChildByTitle", { ...data });
        return response.data;
    },

    async getTitleChildDataByTitle(data: any) {
        const response = await api.post("/pmTitle/getTitleChildDataByTitle", { ...data });
        return response.data;
    },

    // async getTitleChildValueByTitle(data: any) {
    //     const response = await api.post("/pmTitle/getTitleChildValueByTitle", { ...data });
    //     return response.data;
    // },

    async getTitleChildById(data: any) {
        const response = await api.post("/pmTitle/getTitleChildById", { data })
        return response.data;
    },

    async EditpmTitleChild(data: any) {
        const response = await api.post("/pmTitle/EditpmTitleChild", { data })
        return response.data;
    },

    async getTitleChildData(data: any) {
        const response = await api.post("/pmTitle/getTitleChildData", { data })
        return response.data;
    },

    async getAllTitleInfo(data: any) {
        const response = await api.post("/pmTitle/getAllTitleInfo", { data })
        return response.data.data;
    }
};
