import axios from "axios";

export const txt_to_excelManage = {
    async txt_to_excel(txt_file: FormData) { // เปลี่ยน type เป็น FormData ให้ชัดเจน
        console.log("Checking FormData before send...");

        // วิธีการส่งที่ถูกต้องคือส่ง Object FormData ไปเพียวๆ เลยครับ
        const response = await axios.post(
            "http://localhost:8000/txt-to-excel",
            txt_file,
            {
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    console.log("upload:", percent);
                }
            }
        );


        return response.data;
    }
}