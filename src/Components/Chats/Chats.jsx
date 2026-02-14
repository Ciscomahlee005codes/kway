import React, { useState, useEffect } from "react";
import "./Chats.css";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import CallModal from "./CallModal";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useParams } from "react-router-dom";

const Chats = () => {
  const { session } = UserAuth();
  const user = session?.user;

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSidebarDropdown, setShowSidebarDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState("voice");
  const [reactionPicker, setReactionPicker] = useState({
    open: false,
    msgIndex: null,
    x: 0,
    y: 0,
  });

  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  const { id } = useParams();

  // =========================================
  // ✅ LOAD USER FROM URL
  // =========================================
  useEffect(() => {
    if (!id || !user) return;

    const loadUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, photo")
        .eq("id", id)
        .single();

      if (!error && data) {
        const newChat = {
          id: data.id,
          name: data.name,
          avatar: data.photo,
          messages: [],
        };

        setActiveChat(newChat);

        setChats((prev) => {
          const exists = prev.find((c) => c.id === data.id);
          if (exists) return prev;
          return [...prev, newChat];
        });
      }
    };

    loadUser();
  }, [id, user]);

  // =========================================
  // ✅ LOAD MESSAGES
  // =========================================
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error || !data) return;

      setActiveChat((prev) => ({
        ...prev,
        messages: data.map((msg) => ({
          text: msg.content, // ✅ FIXED
          sender: msg.sender_id === user.id ? "you" : "them",
          time: new Date(msg.created_at).toLocaleTimeString(),
        })),
      }));
    };

    fetchMessages();
  }, [activeChat?.id, user?.id]);

  // =========================================
  // ✅ LOAD ALL CONVERSATIONS
  // =========================================
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id");

      if (error || !data) return;

      const userIds = new Set();

      data.forEach((msg) => {
        if (msg.sender_id === user.id)
          userIds.add(msg.receiver_id);
        else if (msg.receiver_id === user.id)
          userIds.add(msg.sender_id);
      });

      if (userIds.size === 0) {
        setChats([]);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, photo")
        .in("id", Array.from(userIds));

      if (!profiles) return;

      const formattedChats = profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        avatar: profile.photo,
        messages: [],
      }));

      setChats(formattedChats);

      if (!id && formattedChats.length > 0) {
        setActiveChat(formattedChats[0]);
      }
    };

    fetchChats();
  }, [user]);

  // =========================================
  // ✅ SEND MESSAGE
  // =========================================
   const handleSendMessage = async () => {
  if (!newMessage.trim() || !activeChat) return;

  const messageText = newMessage;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: messageText,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  const newMsgObject = {
    text: messageText,
    sender: "you",
    time: new Date(data.created_at).toLocaleTimeString(),
  };

  // ✅ Update active chat messages instantly
  setActiveChat((prev) => ({
    ...prev,
    messages: [...(prev.messages || []), newMsgObject],
  }));

  // ✅ Update chat list preview (last message)
  setChats((prevChats) =>
    prevChats.map((chat) =>
      chat.id === activeChat.id
        ? {
            ...chat,
            lastMessage: messageText,
            time: newMsgObject.time,
          }
        : chat
    )
  );

  setNewMessage("");
};


  const handleVoiceClick = () => {
    setRecording(true);
    setTimeout(() => setRecording(false), 3000);
  };

  return (
    <div className="chat-wrapper">
      <ChatList
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        showSidebarDropdown={showSidebarDropdown}
        setShowSidebarDropdown={setShowSidebarDropdown}
        setShowChatDropdown={setShowChatDropdown}
        setShowAddModal={setShowAddModal}
      />

      <ChatWindow
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleVoiceClick={handleVoiceClick}
        recording={recording}
        showChatDropdown={showChatDropdown}
        setShowChatDropdown={setShowChatDropdown}
        setShowSidebarDropdown={setShowSidebarDropdown}
        setShowCallModal={setShowCallModal}
        setCallType={setCallType}
        reactionPicker={reactionPicker}
        setReactionPicker={setReactionPicker}
        reactions={reactions}
      />

      {showCallModal && (
        <CallModal
          type={callType}
          participant={activeChat}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
};

export default Chats;
