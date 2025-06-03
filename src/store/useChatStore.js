import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
const BASE_URL = import.meta.env.MODE === "development" ? "https://backendchatapplication-1.onrender.com" : "/";

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
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser;
      if (selectedUser){
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) {
        const users = get().users;
        const updatedUsers = users.map(user => {
          if (user._id === newMessage.senderId) {
            return {
              ...user,
              unReadCount: user.unReadCount + 1,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.createdAt,
            };
          }
          return user;
        });
  
        set({ users: updatedUsers });
      }

      set({
        messages: [...get().messages, newMessage],
      });

      const res = axiosInstance.post(`/messages/messages-seen/${selectedUser._id}`); 
      }
      else {
        const users = get().users;
        const updatedUsers = users.map(user => {
          if (user._id === newMessage.senderId) {
            return {
              ...user,
              unReadCount: user.unReadCount + 1,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.createdAt,
            };
          }
          return user;
        });
  
        set({ users: updatedUsers });
      }
      
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    const res = axiosInstance.post(`/messages/messages-seen/${selectedUser._id}`);

    if (selectedUser) {
      const users = get().users;
        const updatedUsers = users.map(user => {
          if (user._id === selectedUser._id) {
            return {
              ...user,
              unReadCount: 0,
            };
          }
          return user;
        });
  
        set({ users: updatedUsers });
    }
  },

  getStopTypingUsers: () => {
    const socket = useAuthStore.getState().socket;
  
    if (!socket) {
      console.error("Socket not found in store.");
      return;
    }
  
    socket.on("user-stopped-typing", (data) => {
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
      set({ messageTypingUsers: data }); // Update store state
    });
  },

  messageSeen: () => {
    const socket = useAuthStore.getState().socket;
  
    if (!socket) {
      console.error("Socket not found in store.");
      return;
    }
  
    socket.off("messages-seen"); // Prevent duplicate listeners
  
    socket.on("messages-seen", (data) => {
      const selectedUser = get().selectedUser;
  
      if (selectedUser && selectedUser._id === data.userId) {
        const updatedMessages = get().messages.map((msg) => {
          if (msg.receiverId === data.userId && !msg.is_read) {
            return { ...msg, is_read: true };
          }
          return msg;
        });
        set({ messages: updatedMessages });
      }
    });
  },
  
  
  

  

 
  

  stopTyping: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages/stop-typing/${userId}`);
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
}));
