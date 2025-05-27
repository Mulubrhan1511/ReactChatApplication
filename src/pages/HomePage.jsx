import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import NoChatSelected from "./NoChatSelected";
import ChatContainer from "./ChatContainer";
import Sidebar from "./Sidebar";
import { useEffect, useRef } from "react";

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
    getMediaStream,
  } = useCallStore();
  const videoRef = useRef(null);

  useEffect(() => {
    incomingCall();
    callAnswered();
  }, [localStream]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
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


      {/* Call Modal */}
      {incomingCallUsers && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Incoming Call</h2>
            <p>You have an incoming call from {incomingCallUsers.fullName}</p>
            <button
              onClick={() => handleAnswerCall(incomingCallUsers._id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Accept
            </button>
          </div>

        </div>
      )}

      {calluser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">
              {isCallActive ? "Call Active" : "Call in Progress"}
            </h2>
            <p>You are in a call with {calluser.fullName}</p>
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
            <button
              onClick={() => useCallStore.getState().endCall()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
