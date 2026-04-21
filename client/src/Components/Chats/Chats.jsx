import { useState, useEffect, useRef } from "react";
import "./Chats.css";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import CallModal from "./CallModal";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MpA_Img from "../../assets/Mpa_AI2.png";
import KwayPromoPopup from "../Auth/KwayPromoPopup";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getMpAResponse } from "../../services/mpaService";

const Chats = () => {
  const { session } = UserAuth();
  const user = session?.user;
  const location = useLocation();

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
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mediaCaption, setMediaCaption] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [reactionPicker, setReactionPicker] = useState({
    open: false,
    msgIndex: null,
    x: 0,
    y: 0,
  });

  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  const { id } = useParams();
  const activeChatRef = useRef(activeChat);

// Keep ref in sync — add this right after your useState block
useEffect(() => {
  activeChatRef.current = activeChat;
}, [activeChat]);

  // =========================================
  // Mp.A fixed ID
  // =========================================
  const MPA_ID = "3f944111-4a20-4f8a-9809-c9bf264ba510";

  const MPA_CHAT = {
    id: MPA_ID,
    name: "Mp.A Assistant",
    avatar: MpA_Img,
    lastMessage: "Ask me anything...",
    lastMessageType: "text",
    unread: 0,
    isAI: true,
    messages: [],
  };

  // =========================================
  // HELPERS
  // =========================================
  const markMessagesAsSeen = async (chatId) => {
    if (!user) return;
    const { error } = await supabase
      .from("messages")
      .update({ seen: true })
      .eq("sender_id", chatId)
      .eq("receiver_id", user.id)
      .eq("seen", false);
    if (!error) {
      setChats(prev =>
        prev.map(c => (c.id === chatId ? { ...c, unread: 0 } : c))
      );
    }
  };

  const saveUnread = (chatId, count) => {
    const unreadStore =
      JSON.parse(localStorage.getItem("kway_unread")) || {};
    unreadStore[chatId] = count;
    localStorage.setItem("kway_unread", JSON.stringify(unreadStore));
  };

  const getUnread = (chatId) => {
    const unreadStore =
      JSON.parse(localStorage.getItem("kway_unread")) || {};
    return unreadStore[chatId] || 0;
  };

  // =========================================
  // RESIZE
  // =========================================
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =========================================
  // REALTIME — new messages
  // =========================================
 useEffect(() => {
  if (!session?.user) return;

  const channel = supabase
    .channel("messages-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => {
        const msg = payload.new;
        const current = activeChatRef.current; // ✅ always fresh
        if (!current?.id) return;

        const isForActiveChat =
          (msg.receiver_id === session.user.id && msg.sender_id === current.id) ||
          (msg.sender_id === session.user.id && msg.receiver_id === current.id &&
           current.isAI); // also catch your own AI messages

        if (!isForActiveChat) return;

        setActiveChat(prev => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: msg.id,
              content: msg.content,
              caption: msg.caption,
              type: msg.type,
              sender: msg.sender_id === session.user.id ? "you" : "them",
              time: new Date(msg.created_at).toLocaleTimeString(),
              status: msg.seen ? "seen" : "sent",
            },
          ],
        }));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [session?.user]); // ✅ no activeChat dep needed — we use the ref

  // =========================================
  // REALTIME — unread counts
  // =========================================
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime-unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async () => {
          const { data } = await supabase
            .from("chat_unread_counts")
            .select("*")
            .eq("user_id", user.id);

          const unreadMap = {};
          data?.forEach(row => {
            unreadMap[row.chat_id] = row.unread_count;
          });

          setChats(prev =>
            prev.map(chat => ({
              ...chat,
              unread: unreadMap[chat.id] || 0,
            }))
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // =========================================
  // TYPING STATUS
  // =========================================
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

  // =========================================
  // LOAD Mp.A CHAT FROM SUPABASE
  // =========================================
  useEffect(() => {
    if (!id || !user) return;
    if (id !== MPA_ID) return;

    const loadAIChat = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${MPA_ID}),and(sender_id.eq.${MPA_ID},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      const messages =
        data?.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_id === user.id ? "you" : "them",
          time: new Date(msg.created_at).toLocaleTimeString(),
          type: msg.type || "text",
        })) || [];

      setActiveChat({
        id: MPA_ID,
        name: "Mp.A Assistant",
        avatar: MpA_Img,
        isAI: true,
        messages,
      });

      setChats(prev => {
        const exists = prev.find(c => c.id === MPA_ID);
        if (exists) return prev;
        return [{ ...MPA_CHAT, messages }, ...prev];
      });
    };

    loadAIChat();
  }, [id, user]);

  // Load Mp.A Chat History
  useEffect(() => {
  if (!activeChat?.isAI || !user) return;

  const loadAIHistory = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${MPA_ID}),` +
        `and(sender_id.eq.${MPA_ID},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    const messages = data?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender_id === user.id ? "you" : "them",
      time: new Date(msg.created_at).toLocaleTimeString(),
      type: msg.type || "text",
    })) || [];

    setActiveChat(prev => ({ ...prev, messages }));
  };

  loadAIHistory();
}, [activeChat?.id, activeChat?.isAI, user?.id]); // triggers on any AI chat open
  // =========================================
  // LOAD NORMAL USER CHAT FROM URL
  // =========================================
  useEffect(() => {
    if (!id || !user || id === MPA_ID) return;

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
        setChats(prev => {
          const exists = prev.find(c => c.id === data.id);
          if (exists) return prev;
          return [...prev, newChat];
        });
      }
    };

    loadUser();
  }, [id, user]);

  // =========================================
  // LOAD MESSAGES
  // =========================================
  useEffect(() => {
    if (!activeChat || !user || activeChat?.isAI) return;

    const fetchMessages = async () => {
      await supabase
        .from("messages")
        .update({ seen: true })
        .eq("sender_id", activeChat.id)
        .eq("receiver_id", user.id)
        .eq("seen", false);

      setChats(prev =>
        prev.map(c =>
          c.id === activeChat.id ? { ...c, unread: 0 } : c
        )
      );

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`
        )
        .order("created_at");

      if (!data) return;

      setActiveChat(prev => ({
        ...prev,
        messages: data.map(msg => ({
          id: msg.id,
          content: msg.content,
          caption: msg.caption,
          sender: msg.sender_id === session.user.id ? "you" : "them",
          time: new Date(msg.created_at).toLocaleTimeString(),
          status: msg.seen ? "seen" : "sent",
          type: msg.type,
        })),
      }));
    };

    fetchMessages();
  }, [activeChat?.id, user?.id]);

  // =========================================
  // LOAD ALL CONVERSATIONS
  // =========================================
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!messages) return;

      const chatMap = {};
      const { data: unreadCounts } = await supabase
        .from("chat_unread_counts")
        .select("*")
        .eq("user_id", user.id);

      const unreadMap = {};
      unreadCounts?.forEach(row => {
        unreadMap[row.chat_id] = row.unread_count;
      });

      messages.forEach(msg => {
        const other =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!chatMap[other]) {
          chatMap[other] = {
            lastMessage: msg.content,
            lastMessageType: msg.type,
            time: new Date(msg.created_at).toLocaleTimeString(),
          };
        }
      });

      const ids = Object.keys(chatMap);
      if (ids.length === 0) return setChats([]);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,name,photo")
        .in("id", ids);

      const formatted = profiles
        .filter(p => p.id !== MPA_ID) // ✅ exclude Mp.A from normal profiles
        .map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.photo,
          lastMessage: chatMap[p.id]?.lastMessage,
          lastMessageType: chatMap[p.id]?.lastMessageType,
          time: chatMap[p.id]?.time,
          unread: unreadMap[p.id] || 0,
          messages: [],
          lastMessageDate: messages.find(
            m =>
              (m.sender_id === user.id && m.receiver_id === p.id) ||
              (m.sender_id === p.id && m.receiver_id === user.id)
          )?.created_at,
        }));

      formatted.sort(
        (a, b) =>
          new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
      );

      // ✅ Build Mp.A entry with last message preview
      const aiMessages = messages.filter(
        m =>
          (m.sender_id === user.id && m.receiver_id === MPA_ID) ||
          (m.sender_id === MPA_ID && m.receiver_id === user.id)
      );
      const lastAIMessage = aiMessages[0];
      const updatedMPA = {
        ...MPA_CHAT,
        lastMessage: lastAIMessage?.content || "Ask me anything...",
        time: lastAIMessage
          ? new Date(lastAIMessage.created_at).toLocaleTimeString()
          : "",
      };

      setChats([updatedMPA, ...formatted]);
    };

    fetchChats();
  }, [user]);

  // =========================================
  // SEND MESSAGE
  // =========================================
  const handleSendMessage = async () => {

    // =============================
    // 🤖 Mp.A CHAT (AI MODE)
    // =============================
    if (activeChat?.isAI) {
      const userText = newMessage.trim();
      if (!userText) return;

      setNewMessage("");

      const tempUserMsg = {
        id: `temp-${Date.now()}`,
        content: userText,
        sender: "you",
        type: "text",
        time: new Date().toLocaleTimeString(),
      };

      // ✅ Capture messages before async to avoid stale closure
      let currentMessages = [];
      setActiveChat(prev => {
        currentMessages = [...(prev.messages || []), tempUserMsg];
        return { ...prev, messages: currentMessages };
      });

      // ✅ Save user message to Supabase
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: MPA_ID,
        content: userText,
        type: "text",
      });

      try {
        const aiText = await getMpAResponse(userText, currentMessages);

        const tempAiMsg = {
          id: `temp-ai-${Date.now()}`,
          content: aiText,
          sender: "them",
          type: "text",
          time: new Date().toLocaleTimeString(),
        };

        setActiveChat(prev => ({
          ...prev,
          messages: [...currentMessages, tempAiMsg],
        }));

        // ✅ Save AI reply to Supabase
        await supabase.from("messages").insert({
          sender_id: MPA_ID,
          receiver_id: user.id,
          content: aiText,
          type: "text",
        });

        // ✅ Update chat list preview
        setChats(prev =>
          prev.map(c =>
            c.id === MPA_ID
              ? {
                  ...c,
                  lastMessage: aiText,
                  time: new Date().toLocaleTimeString(),
                }
              : c
          )
        );
      } catch (err) {
        console.error(err.message);

        const errorMsg = {
          id: `err-${Date.now()}`,
          content: err.message?.includes("Rate limit")
            ? "⏳ Mp.A is busy, try again shortly."
            : "😔 Mp.A is having trouble right now.",
          sender: "them",
          type: "text",
          time: new Date().toLocaleTimeString(),
        };

        setActiveChat(prev => ({
          ...prev,
          messages: [...currentMessages, errorMsg],
        }));
      }

      return; // ✅ stop — don't run normal chat logic
    }

    // =============================
    // NORMAL CHAT
    // =============================
    if (!activeChat || !user) return;

    if (newMessage.trim()) {
      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: activeChat.id,
          content: newMessage,
          type: "text",
        })
        .select()
        .single();

      if (!error && inserted) {
        setActiveChat(prev => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: inserted.id,
              content: inserted.content,
              sender: "you",
              time: new Date(inserted.created_at).toLocaleTimeString(),
              type: "text",
              status: "sent",
            },
          ],
        }));
      }

      setNewMessage("");
    }

    for (const item of selectedMedia) {
      const fileName = `${Date.now()}-${item.file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, item.file);

      if (uploadError) {
        console.log(uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      const { data: inserted } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: activeChat.id,
          content: data.publicUrl,
          caption: mediaCaption,
          type: item.type,
        })
        .select()
        .single();

      if (inserted) {
        setActiveChat(prev => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: inserted.id,
              content: inserted.content,
              caption: inserted.caption,
              sender: "you",
              time: new Date(inserted.created_at).toLocaleTimeString(),
              type: inserted.type,
              status: "sent",
            },
          ],
        }));
      }
    }

    setSelectedMedia([]);
    setMediaCaption("");
  };

  // =========================================
  // MEDIA UPLOAD HELPER
  // =========================================
  const uploadMedia = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("chat-media")
      .upload(fileName, file);
    if (error) { console.log(error); return null; }
    const { data } = supabase.storage
      .from("chat-media")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleVoiceClick = () => {
    setRecording(true);
    setTimeout(() => setRecording(false), 3000);
  };

  const startChat = (user) => {
    const newChat = {
      id: Date.now(),
      name: user.name,
      avatar: user.avatar || "",
      lastMessage: "",
      unread: 0,
    };
    setChats(prev => [newChat, ...prev]);
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className="chat-wrapper">
      <KwayPromoPopup />
      <ChatList
        chats={chats}
        activeChat={activeChat}
        setChats={setChats}
        setActiveChat={setActiveChat}
        showSidebarDropdown={showSidebarDropdown}
        setShowSidebarDropdown={setShowSidebarDropdown}
        setShowChatDropdown={setShowChatDropdown}
        setShowAddModal={setShowAddModal}
        saveUnread={saveUnread}
      />
      <ChatWindow
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
        mediaCaption={mediaCaption}
        setMediaCaption={setMediaCaption}
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
        saveUnread={saveUnread}
      />
      {showCallModal && (
        <CallModal
          type={callType}
          participant={{
            name: activeChat.name,
            avatar: activeChat.avatar,
          }}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
};

export default Chats;