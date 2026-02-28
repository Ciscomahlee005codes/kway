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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTyping, setIsTyping] = useState(false);


useEffect(() => {
  const handleResize = () =>
    setIsMobile(window.innerWidth <= 768);

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
const startChat = (user) => {
  const newChat = {
    id: Date.now(),
    name: user.name,
    avatar: user.avatar || "",
    lastMessage: "",
    unread: 0,
  };

  setChats((prev) => [newChat, ...prev]);
};
useEffect(() => {
  if (!activeChat || !user) return;

  const channel = supabase
    .channel("typing-status")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "typing",
        filter: `chat_id=eq.${activeChat.id}`,
      },
      payload => {
        if (payload.new.user_id !== user.id) {
          setIsTyping(payload.new.typing);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [activeChat, user]);


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
  if (!activeChat || !user) return;

  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`
    )
    .order("created_at");

  if (!data) return;

  // mark seen
  await supabase
    .from("messages")
    .update({ seen: true })
    .eq("sender_id", activeChat.id)
    .eq("receiver_id", user.id);

  setActiveChat(prev => ({
    ...prev,
    messages: data.map(msg => ({
      text: msg.content,
      sender: msg.sender_id === user.id ? "you" : "them",
      time: new Date(msg.created_at).toLocaleTimeString(),
      status: msg.seen
        ? "seen"
        : msg.delivered
        ? "delivered"
        : "sent",
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
  if (!user) return;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (!messages) return;

  const chatMap = {};
  const unreadMap = {};

  messages.forEach(msg => {
    const other =
      msg.sender_id === user.id
        ? msg.receiver_id
        : msg.sender_id;

    if (!chatMap[other]) {
      chatMap[other] = {
        lastMessage: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString(),
      };
    }

    if (
      msg.receiver_id === user.id &&
      msg.seen === false
    ) {
      unreadMap[other] =
        (unreadMap[other] || 0) + 1;
    }
  });

  const ids = Object.keys(chatMap);

  if (ids.length === 0) return setChats([]);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,name,photo")
    .in("id", ids);

  const formatted = profiles.map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.photo,
    lastMessage: chatMap[p.id]?.lastMessage,
    time: chatMap[p.id]?.time,
    unread: unreadMap[p.id] || 0,
    messages: [],
  }));

  setChats(formatted);
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
      delivered: false,
  seen: false,
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
        isTyping={isTyping}
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
