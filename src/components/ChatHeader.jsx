import { X,  Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useVideoStore } from "../store/useVideoStore";
import { useEffect, useRef, useState } from "react";
import VideoInterface from "./VideoInterface";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { makeCall, callStatus, endCall } = useVideoStore();
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  // Listen for call status changes
  useEffect(() => {
    if (callStatus === "incoming" || callStatus === "outgoing") {
      setIsVideoCallActive(true);
    } else {
      setIsVideoCallActive(false);
    }
  }, [callStatus]);

  if (!selectedUser) return null; // Prevent errors when no user is selected

  const handleVideoCall = async () => {
    if (!onlineUsers.includes(selectedUser._id)) {
      toast.error("User is offline");
      return;
    }
    try {
      await makeCall(selectedUser._id);
      setIsVideoCallActive(true);
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Failed to start call.");
    }
  };

  const handleEndCall = () => {
    endCall();
    setIsVideoCallActive(false);
  };
  

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-3 w-full">
        {/* Left Side: Avatar + Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

      {/* Right Side: Call Button */}
      
</div>



        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleVideoCall}
            disabled={!!callStatus}
            className={`hover:bg-base-200 p-2 rounded-full transition-colors ${
              callStatus ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Start video call"
          >
            <Video size={25} />
          </button>


          <button
            onClick={() => setSelectedUser(null)}
            className="hover:bg-base-200 p-2 rounded-full transition-colors"
            title="Close chat"
          >
            <X size={20} />
          </button>
        </div>

      </div>
      {/* Video Interface */}
      {isVideoCallActive && (
        <VideoInterface
          callStatus={callStatus}
          selectedUser={selectedUser}
          onClose={handleEndCall}
          onEndCall={handleEndCall}
        />
      )}
      </div>
  );
};
export default ChatHeader;