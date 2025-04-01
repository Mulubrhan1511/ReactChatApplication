import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from '../components/ChatHeader';
import MessageInput from '../components/MessageInput';
import MessageSkeleton from '../components/skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    messageTypingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Scrollable container - Reversed message order */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col-reverse space-y-4">
        {[...messages].reverse().map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {messageTypingUsers.includes(selectedUser._id) && (
        <div className="p-2 text-xs text-gray-500">
          {selectedUser.fullName} is typing...
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
