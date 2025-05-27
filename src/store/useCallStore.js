import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { call } from "file-loader";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


export const useCallStore = create((set, get) => ({
    selectedUser: null,
    incomingCallUsers: null,
    calluser: null,
    isCallActive: false,
    setSelectedUser: (user) => set({ selectedUser: user }),
    localStream: null,
    setLocalStream: (stream) => set({ localStream: stream }),
    activeCall: null,

    startCall: (userId) => {
        const socket = useAuthStore.getState().socket;
        set({ calluser: userId });
        
        const res = axiosInstance.post(`/calls/ice-candidate/${userId}`);
    },

    incomingCall: (callData) => {
        const socket = useAuthStore.getState().socket;
        socket.on("incoming-call", (callData) => {
            const user = axiosInstance.get(`auth/user/${callData.from}`);
            user.then((response) => {
                console.log("User found: incomingCall", response.data);
                set({ incomingCallUsers: response.data, isCallActive: false });
            }).catch((error) => {
                console.error("Error finding user:", error);
                toast.error("Error finding user");
            });
        });
    },

    acceptCall: (userId) => {
        const socket = useAuthStore.getState().socket;
        console.log("Accepting call from user ID:", userId);
        const res = axiosInstance.post(`/calls/answer-call/${userId}`);
        res.then((response) => {
            console.log("Call accepted:", response.data);
            console.log("User ID:", userId);
            const user = axiosInstance.get(`auth/user/${userId}`);
            user.then((response) => {
                console.log("User found: acceptCall", response.data);
                set({ calluser: response.data, isCallActive: true, incomingCallUsers: null });
            });
        }).catch((error) => {
            console.error("Error accepting call:", error);
            toast.error("Error accepting call");
        });
    },

    callAnswered: () => {
        const socket = useAuthStore.getState().socket;
        socket.on("call-answered", (userId) => {
            console.log("Call answered by user:", userId);
            const user = axiosInstance.get(`auth/user/${userId.from}`);
            user.then((response) => {
                console.log("User found: callAnswered", response.data);
                set({ calluser: response.data, isCallActive: true });
            }).catch((error) => {
                console.error("Error finding user:", error);
                toast.error("Error finding user");
            });
        });
    },

    endCall: () => {
        const socket = useAuthStore.getState().socket;
        socket.emit("end-call");
        set({ calluser: null });
    },

    findUser: (userId) => {
        const socket = useAuthStore.getState().socket;
        socket.emit("find-user", userId);
        const res = axiosInstance.get(`auth/users/${userId}`);
        res.then((response) => {
            console.log("User found:", response.data);
            return response.data;
        }).catch((error) => {
            console.error("Error finding user:", error);
            toast.error("Error finding user");
        });
    },




}));