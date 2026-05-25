import axios from "axios";

export const UserManage = {
    async getProfileData(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/UserManage/getProfileData", data
        );
        return response.data.data;
    },

    async updateProfile(data: any) {
        console.log(data);
        const response = await axios.post(
            "http://localhost:3000/api/UserManage/updateProfile", data
        );
        return response.data.data;
    }
};

