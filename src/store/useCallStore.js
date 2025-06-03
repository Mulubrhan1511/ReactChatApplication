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

    getMediaStream: async (faceMode = "user") => {
        try {
            const { localStream } = get();
            if (localStream) {
                return localStream; // Return existing stream if available
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const audioDevices = devices.filter(device => device.kind === 'audioinput');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    frameRate: { min: 16, ideal: 30, max: 60 },
                    facingMode: videoDevices.length > 0 ? faceMode : undefined,
                },
            });
            set({ localStream: stream }); // Store the stream in state
            console.log("Local stream set for call:", stream);
            return stream; // ✅ RETURN the new stream
        } catch (error) {
            console.error("Error accessing media devices.", error);
            set({ localStream: null }); // Reset local stream on error
            return null; // Return null if there's an error
        }
    },



}));