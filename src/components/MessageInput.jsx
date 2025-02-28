import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [typingUser, setTypingUser] = useState(""); // Typing indicator
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  const socketRef = useRef(null); // Ensure only one socket connection
  const typingTimeoutRef = useRef(null); // Properly handle typing timeout

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io("http://localhost:5001"); // Adjust for your backend

    socketRef.current.on("userTyping", ({ userId }) => {
      if (userId === selectedUser?._id) {
        setTypingUser(`${selectedUser.fullName} is typing...`);
      }
    });

    socketRef.current.on("userStoppedTyping", () => {
      setTypingUser("");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedUser]); // Ensure selectedUser updates correctly

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle typing event
  const handleTyping = (e) => {
    if (!authUser || !selectedUser) return; // Prevent errors if null

    setText(e.target.value);
    socketRef.current.emit("typing", {
      userId: authUser._id,
      receiverId: selectedUser._id,
    });

    // Clear previous timeout and set a new one
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", { userId: authUser._id });
    }, 1000);
  };

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      socketRef.current.emit("stopTyping", { userId: authUser._id });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">{typingUser}</p> {/* Typing Indicator */}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
