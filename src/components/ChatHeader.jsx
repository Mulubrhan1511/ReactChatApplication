import { Phone, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useEffect, useRef, useState } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();
  const { calluser, setLocalStream, localStream } = useCallStore();
  const videoRef = useRef(null);

  
  const getMediaStream = async (faceMode) => {
  try {
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
    setLocalStream(stream); // Store the stream in state
    return stream; // ✅ RETURN the new stream
  } catch (error) {
    console.error("Error accessing media devices.", error);
    setLocalStream(null); // Reset local stream on error
    return null; // Return null if there's an error
  }
};


  const handleStartCall = async (userId) => {
    // Logic to start a call with the selected user
    console.log(`Starting call with user ID: ${userId}`);
    const stream = await getMediaStream();
    if (!stream) {
      console.error("Failed to get media stream.");
      return;
    }

    

    console.log("Local stream set for call:");

    // Assuming startCall is a function that initiates the call
    startCall(userId);

  }

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  

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
      <button
        onClick={() => handleStartCall(selectedUser._id)}
        className="p-7 rounded-full hover:bg-base-200 transition"
        title="Start Call"
      >
        <Phone className="w-7 h-7 text-primary" />
      </button>
</div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>

      {/* Show local video preview */}
      {localStream && (
        <div className="mt-3">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="rounded-md border border-gray-300 w-64 h-48 object-cover"
          />
        </div>
      )}
    </div>
  );
};
export default ChatHeader;