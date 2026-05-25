import axios from "axios";

export const pmServiceManage = {
    async deletePmById(id: any) {
        const response = await axios.delete(
            "http://localhost:3000/api/pmServiceManage/deletePmById",
            { data: { id } }
        );
        return response.data;
    },

    async checkIn(pmId: any, userId: any) {
        const response = await axios.post(
            "http://localhost:3000/api/pmCheckInOut/checkIn",
            { pmId, userId }
        );
        return response.data;
    },

    async checkOut(pmId: any, userId: any) {
        const response = await axios.post(
            "http://localhost:3000/api/pmCheckInOut/checkOut",
            { pmId, userId }
        );
        return response.data;
    },

    async updateProgressStatus(data: any){
        const response = await axios.post(
            "http://localhost:3000/api/pmCheckInOut/updateProgressStatus",
            { data }
        );
        return response.data;
    },

    // async progress_status(pmId: any, status: any) {
    //     const response = await axios.post(
    //         "http://localhost:3000/api/pmCheckInOut/progress_status",
    //         { pmId, status }
    //     );
    //     return response.data;
    // },

    // async valuePmByIdTitleIdTitleChildId(data: any) {
    //     const response = await axios.post(
    //         "http://localhost:3000/api/pmServiceManage/valuePmByIdTitleIdTitleChildId",
    //         { ...data }
    //     );
    //     return response.data;
    // },

    async AddCabinet(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/pmCabinet/AddCabinet",
            { data }
        );
        return response.data;
    },

    async deleteCabinet(data: any) {
        const response = await axios.delete(
            "http://localhost:3000/api/pmCabinet/deleteCabinet",
            { data }
        );
        return response.data;
    },

    async getPmCabinetById(id: any) {
        const res = await axios.post(
            "http://localhost:3000/api/pmCabinet/getPmCabinetById", { id }
        );
        return res.data;
    },

    async getCabinetDetailByCabinetId(id: any) {
        const res = await axios.post(
            "http://localhost:3000/api/pmCabinet/getCabinetDetailByCabinetId", { id }
        );
        return res.data;
    },
};

