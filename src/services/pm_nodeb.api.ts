import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/pmInsert'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const PMApiService = {
    async pre_pm_nodeb(data: any) {
        const response = await api.post("/pm_nodeb", {
            ...data
        });
        return response.data;
    },

    // บันทึก Site Information
    // async pm_site_information(pm_id: string, data: Record<string, any>) {
    //     const response = await api.post('/pm_site_information', {
    //         pm_id,
    //         ...data
    //     });
    //     return response.data;
    // },

    async PmsubmitData(data: any) {
        const response = await api.post("/PmsubmitData",
            data
            , {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        return response.data;
    }
};
