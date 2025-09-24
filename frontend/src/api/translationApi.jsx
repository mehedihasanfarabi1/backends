import api from "./axios";


export const fetchTranslations = async () => {
const res = await api.get("translations/");
return res.data;
};


export const fetchTranslation = async (id) => {
const res = await api.get(`translations/${id}/`);
return res.data;
};


export const createTranslation = async (payload) => {
const res = await api.post("translations/", payload);
return res.data;
};


export const updateTranslation = async (id, payload) => {
const res = await api.put(`translations/${id}/`, payload);
return res.data;
};


export const patchTranslation = async (id, payload) => {
const res = await api.patch(`translations/${id}/`, payload);
return res.data;
};


export const deleteTranslation = async (id) => {
const res = await api.delete(`translations/${id}/`);
return res.data;
};