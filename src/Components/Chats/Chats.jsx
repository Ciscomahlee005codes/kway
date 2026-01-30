import React, { useState } from "react";
import "./Chats.css";
import CallModal from "./CallModal";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import ChatImg1 from "../../assets/chatImg-1.jpg";
import ChatImg2 from "../../assets/chatImg-2.jpg";
import ChatImg3 from "../../assets/chatImg-3.jpg";
import ChatImg4 from "../../assets/chatImg-4.jpg";

const initialChats = [
  { id: 1, name: "John Doe", avatar: ChatImg1, lastMessage: "Hey, how are you?", time: "10:30 AM", active: true,  unreadCount: 3, messages: [] },
  { id: 2, name: "Jane Smith", avatar: ChatImg2, lastMessage: "Meeting at 5?", time: "09:45 AM", active: false, messages: [] },
  { id: 3, name: "Dev Group", lastMessage: "Push your code pls 🚀", time: "Yesterday", active: true, messages: [] },
  { id: 4, name: "Samuel", avatar: ChatImg4, lastMessage: "Check this out!", time: "Monday", active: false, messages: [] },
  { id: 5, name: "Tochukwu", avatar: ChatImg3, lastMessage: "Afa Kosi", time: "Monday", active: false, messages: [] },
  { id: 6, name: "Chekwube", lastMessage: "I've Sent it", time: "Monday", active: false, messages: [] },
  { id: 7, name: "My Mummy", lastMessage: "Asa Nwam", time: "Yesterday", active: false, messages: [] },
];

const Chats = () => {
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", lastMessage: "", phone: "" });
  const [showSidebarDropdown, setShowSidebarDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState("voice");
  const [reactionPicker, setReactionPicker] = useState({ open: false, msgIndex: null, x: 0, y: 0 });

  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleVoiceClick = () => {
    setRecording(true);
    setTimeout(() => setRecording(false), 3000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const updatedChats = chats.map(chat =>
      chat.id === activeChat.id
        ? {
            ...chat,
            messages: [...(chat.messages || []), { sender: "you", text: newMessage, time: "Now", reaction: null }],
            lastMessage: newMessage,
            time: "Now",
          }
        : chat
    );

    setChats(updatedChats);
    setActiveChat({
      ...activeChat,
      messages: [...(activeChat.messages || []), { sender: "you", text: newMessage, time: "Now", reaction: null }],
    });
    setNewMessage("");
  };

  const handleReactionClick = (emoji, index) => {
    const updatedMessages = [...activeChat.messages];
    updatedMessages[index].reaction = emoji;

    setActiveChat({ ...activeChat, messages: updatedMessages });
    setChats(chats.map(chat => chat.id === activeChat.id ? { ...chat, messages: updatedMessages } : chat));
    setReactionPicker({ open: false, msgIndex: null, x: 0, y: 0 });
  };

  const handleAddContact = (e) => {
  e.preventDefault();

  if (!newContact.name || !newContact.phone) return;

  setChats([
    ...chats,
    {
      id: chats.length + 1,
      name: newContact.name,
      phone: newContact.phone,
      lastMessage: newContact.lastMessage || "New contact added",
      time: "Now",
      active: true,
      unreadCount: 0,
      messages: [],
    },
  ]);

  setShowAddModal(false);
  setNewContact({ name: "", phone: "", lastMessage: "" });
};


  return (
    <div className="chat-wrapper">
      <ChatList
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showSidebarDropdown={showSidebarDropdown}
        setShowSidebarDropdown={setShowSidebarDropdown}
        setShowChatDropdown={setShowChatDropdown}
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
        handleReactionClick={handleReactionClick}
      />

      {showCallModal && (
        <CallModal
          type={callType}
          participant={activeChat}
          onClose={() => setShowCallModal(false)}
        />
      )}

      {showAddModal && (
  <div
    className="add-contact-modal"
    onClick={() => setShowAddModal(false)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Add New Contact</h3>

      <form onSubmit={handleAddContact}>
  <input
    type="text"
    placeholder="Full Name"
    value={newContact.name}
    onChange={(e) =>
      setNewContact({ ...newContact, name: e.target.value })
    }
    required
  />

  <input
    type="text"
    placeholder="@username"
    value={newContact.username}
    onChange={(e) =>
      setNewContact({ ...newContact, username: e.target.value })
    }
    required
  />

  <input
    type="email"
    placeholder="Email Address"
    value={newContact.email}
    onChange={(e) =>
      setNewContact({ ...newContact, email: e.target.value })
    }
    required
  />

  <div className="modal-actions">
    <button type="button" onClick={() => setShowAddModal(false)}>
      Cancel
    </button>

    <button type="submit">
      Add Contact
    </button>
  </div>
</form>

    </div>
  </div>
)}

    </div>
  );
};

export default Chats;
