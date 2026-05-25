import axios from "axios";

export const logManage = {
    async getLogs(data: any) {
        const response = await axios.post(
            "http://localhost:3000/api/DevManage/getLogs", data
        );
        return response.data;
    },
};

