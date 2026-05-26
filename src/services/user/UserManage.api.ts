import { api } from "../api.api";

export const UserManage = {
    async getProfileData(data: any) {
        const response = await api.post(
            "/UserLocation/getProfileData", data
        );
        return response.data.data;
    },

    async updateProfile(data: any) {
        console.log(data);
        const response = await api.post(
            "/UserManage/updateProfile", data
        );
        return response.data.data;
    }
};

