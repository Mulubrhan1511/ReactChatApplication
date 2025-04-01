import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messageTypingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      console.log("newMessage", newMessage);
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getStopTypingUsers: () => {
    const socket = useAuthStore.getState().socket;
  
    if (!socket) {
      console.error("Socket not found in store.");
      return;
    }
  
    socket.on("user-stopped-typing", (data) => {
      console.log("data in user-typing stoped:", data);
      set({ messageTypingUsers: data }); // Update store state
    });
  },

  getTypingUsers: () => {
    const socket = useAuthStore.getState().socket;
  
    if (!socket) {
      console.error("Socket not found in store.");
      return;
    }
  
    socket.on("user-typing", (data) => {
      console.log("data in user-typing:", data);
      set({ messageTypingUsers: data }); // Update store state
    });
  },

  

 
  

  stopTyping: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages//stop-typing/${userId}`);
    } catch (error) {
      console.log("error in stop typing:", error);
    }
  },

  startTyping: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages/typing/${userId}`);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateMessageStatus: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages-seen/${messageId}`);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));
