import { api } from "../api.api";

export const UserLocation = {
    async sendLocation(data: any) {
        const response = await api.post(
            "/UserLocation/location", data
        );
        return response.data.data;
    },

    async getLocation() {
        const response = await api.get("/UserLocation/location");
        return response.data.data;
    }
};

