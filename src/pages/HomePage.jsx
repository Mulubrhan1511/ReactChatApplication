import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import NoChatSelected from "./NoChatSelected";
import ChatContainer from "./ChatContainer";
import Sidebar from "./Sidebar";
import { useEffect, useRef } from "react";
import VideoPlayer from "../components/VideoPlayer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const {
    incomingCallUsers,
    incomingCall,
    calluser,
    acceptCall,
    isCallActive,
    callAnswered,
    localStream,
  } = useCallStore();
  const videoRef = useRef(null);

  useEffect(() => {
    incomingCall();
    callAnswered();

  }, []);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }

    console.log("Local stream set for call chat header: home", localStream);
  }, [localStream]);

  const handleAnswerCall = async (userId) => {
    console.log(`Answering call from user ID: ${userId}`);
    await acceptCall(userId);
  };

  return (
    <div className="h-screen bg-base-200">
      

      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;
