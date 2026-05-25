import axios from "axios";

export const UserLocation = {
    async sendLocation(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/UserLocation/location", data
        );
        return response.data.data;
    },

    async getLocation() {
        const response = await axios.get("http://localhost:3000/api/UserLocation/location");
        return response.data.data;
    }
};

