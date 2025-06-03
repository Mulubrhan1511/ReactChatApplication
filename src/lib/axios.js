// In axios.js
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://backendchatapplication-1.onrender.com/api/v1/",
    withCredentials: true,
});
