import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIng: false,
    isUpdatingProfile: false,
    


    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            console.log("res", res);
            set ({ authUser: res.data.user});
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({ authUser: null });

        } finally {
            set({ isCheckingAuth: false });
        }

    },

    signup: async (formData) => {
        set({ isSigningUp: true });

        try {
            const res = await axiosInstance.post("/auth/signup", formData);
            set({ authUser: res.data });
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    login: async (formData) => {
        set({ isLoggingIng: true });

        try {
            const res = await axiosInstance.post("/auth/login", formData);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
        } catch (error) {
            console.log("Error in login", error);
            toast.error(error.response.data);
        } finally {
            set({ isLoggingIng: false });
        }
    },

    updateProfile: async (formData) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axiosInstance.put("/auth/update-profile", formData);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in updateProfile", error);
            toast.error(error.response.data);
        } finally {
            set({ isUpdatingProfile: false });
        }
    }

}));    
