import { api } from "./api.api";


export const pmServiceManage = {
    async deletePmById(id: any) {
        const response = await api.delete(
            "/pmServiceManage/deletePmById",
            { data: { id } }
        );
        return response.data;
    },

    async checkIn(pmId: any, userId: any) {
        const response = await api.post(
            "/pmCheckInOut/checkIn",
            { pmId, userId }
        );
        return response.data;
    },

    async checkOut(pmId: any, userId: any) {
        const response = await api.post(
            "/pmCheckInOut/checkOut",
            { pmId, userId }
        );
        return response.data;
    },

    async updateProgressStatus(data: any){
        const response = await api.post(
            "/pmCheckInOut/updateProgressStatus",
            { data }
        );
        return response.data;
    },

    // async progress_status(pmId: any, status: any) {
    //     const response = await api.post(
    //         "/pmCheckInOut/progress_status",
    //         { pmId, status }
    //     );
    //     return response.data;
    // },

    // async valuePmByIdTitleIdTitleChildId(data: any) {
    //     const response = await api.post(
    //         "/pmServiceManage/valuePmByIdTitleIdTitleChildId",
    //         { ...data }
    //     );
    //     return response.data;
    // },

    async AddCabinet(data: any) {
        const response = await api.post(
            "/pmCabinet/AddCabinet",
            { data }
        );
        return response.data;
    },

    async deleteCabinet(data: any) {
        const response = await api.delete(
            "/pmCabinet/deleteCabinet",
            { data }
        );
        return response.data;
    },

    async getPmCabinetById(id: any) {
        const res = await api.post(
            "/pmCabinet/getPmCabinetById", { id }
        );
        return res.data;
    },

    async getCabinetDetailByCabinetId(id: any) {
        const res = await api.post(
            "/pmCabinet/getCabinetDetailByCabinetId", { id }
        );
        return res.data;
    },
};

