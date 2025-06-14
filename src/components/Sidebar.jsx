import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, messageTypingUsers, getTypingUsers, getStopTypingUsers, messageSeen, subscribeToMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
    getTypingUsers();
    messageSeen();
    getStopTypingUsers();
    subscribeToMessages();
    console.log("messageTypingUsers", messageTypingUsers);
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isTyping = messageTypingUsers.includes(user._id);
          const isOnline = onlineUsers.includes(user._id);
          const hasLastMessage = !!user.lastMessage;
          const unreadCount = user.unReadCount || 0;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-4 rounded-xl transition-colors
                ${isSelected ? "bg-base-300 ring-1 ring-base-300" : "hover:bg-base-200"}`}
            >
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="w-12 h-12 object-cover rounded-full"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              {/* User Info */}
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{user.fullName}</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-sm text-zinc-400 truncate">
                  {isTyping ? (
                    <span className="text-blue-500 animate-pulse">Typing...</span>
                  ) : hasLastMessage ? (
                    user.lastMessage
                  ) : (
                    isOnline ? "Online" : "Offline"
                  )}
                </div>
              </div>

                          </button>
                        );
                      })}

          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No users found</div>
          )}
        </div>

    </aside>
  );
};

export default Sidebar;
