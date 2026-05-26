import { api } from "../api.api";

export const logManage = {
    async getLogs(data: any) {
        const response = await api.post(
            "/DevManage/getLogs", data
        );
        return response.data;
    },
};

