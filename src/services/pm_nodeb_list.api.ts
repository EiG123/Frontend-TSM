import { api } from "./api.api";

export const getPmList = {
  async getPmList(data: any){
    const res = await api.post(
      "/pmGetPmData/pmGetPmList", data
    );
    return res.data;
  },
  async getPmById(id: any) {
    const res = await api.post(
      "/pmGetPmData/getPmDataById", {id}
    );
    return res.data;
  },
};
