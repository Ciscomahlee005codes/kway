import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSend, FiSmile } from "react-icons/fi";
import { FaMicrophoneAlt, FaCameraRetro } from "react-icons/fa";
import VoiceNotePlayer from "../Chats/VoiceNotePlayer";
import "./GroupChat.css";

const GroupChat = () => {
  const { id } = useParams();
  const { session } = UserAuth();
  const user = session?.user;

  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
const [mediaCaption, setMediaCaption] = useState("");
const [searchMode, setSearchMode] = useState(false);
const [searchText, setSearchText] = useState("");
const [recordTime, setRecordTime] = useState(0);
const [touchStartX,setTouchStartX]=useState(null);
const [selectedMember,setSelectedMember]=useState(null);
const [typingUsers, setTypingUsers] = useState([]);
const typingTimeoutRef = useRef(null);
const typingChannelRef = useRef(null);
const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const bottomRef = useRef();

  useEffect(() => {
    if (!id) return;
    fetchGroup();
    fetchMessages();
  }, [id]);

  useEffect(() => {
  document.body.classList.add("chat-open");

  return () => {
    document.body.classList.remove("chat-open");
  };
}, []);

 //Real Time Typing 
  useEffect(() => {

if (!id || !user) return;

const channel =
supabase.channel(`group-typing-${id}`, {
config: {
presence: {
key: user.id
}
}
});

typingChannelRef.current = channel;

channel
.on("presence", { event: "sync" }, () => {

const presenceState =
channel.presenceState();

const typingList =
Object.values(presenceState)
.flat()
.filter(p => p.typing && p.user_id !== user.id);

setTypingUsers(typingList);

})

.subscribe(async status => {

if (status === "SUBSCRIBED") {

await channel.track({
user_id: user.id,
name: user.user_metadata?.name || "Someone",
typing: false
});

}

});

return () => {

channel.unsubscribe();

};

}, [id, user]);

// Handling Typing Indicator
const handleTyping = async () => {

if (!typingChannelRef.current) return;

await typingChannelRef.current.track({
user_id: user.id,
name: user.user_metadata?.name || "Someone",
typing: true
});

clearTimeout(typingTimeoutRef.current);

typingTimeoutRef.current = setTimeout(async () => {

await typingChannelRef.current.track({
user_id: user.id,
name: user.user_metadata?.name || "Someone",
typing: false
});

}, 1500);

};

// Nigeria Time UTC+1
const formatTimeNG = (dateString) => {

  return new Date(dateString)
    .toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Lagos"
    });

};
// Voice Recording Logic
const startRecording = async () => {

  const stream =
    await navigator.mediaDevices.getUserMedia({
      audio: true
    });

  const recorder =
    new MediaRecorder(stream, {
      mimeType: "audio/webm"
    });

    mediaRecorderRef.current = recorder;

setRecordTime(0);

const timer =
setInterval(() => {

setRecordTime(prev => prev + 1);

}, 1000);

mediaRecorderRef.current.timer = timer;

  audioChunksRef.current = [];

  recorder.ondataavailable = e => {

    if (e.data.size > 0)
      audioChunksRef.current.push(e.data);

  };

  recorder.onstop = async () => {

  try {

    await supabase.auth.refreshSession();

    const blob =
      new Blob(audioChunksRef.current, {
        type: "audio/webm"
      });

    const fileName =
      `group-voice-${Date.now()}.webm`;

    const { error: uploadError } =
      await supabase.storage
        .from("chat-media")
        .upload(fileName, blob);

    if (uploadError) {
      console.log("VOICE UPLOAD ERROR:", uploadError.message);
      return;
    }

    const { data } =
      supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);


    // ✅ ADD VOICE NOTE TO UI IMMEDIATELY (optimistic update)

    const optimisticAudio = {

  id: `temp-${Date.now()}`,

  content: data.publicUrl,

  type: "audio",

  created_at: new Date(),

  sender_id: user.id,

  reply_to: replyTo?.id || null,

  profiles: {
    name: "You",
    photo: user.user_metadata?.avatar_url
  }

};

    setMessages(prev => [
      ...prev,
      optimisticAudio
    ]);


    // ✅ SAVE TO DATABASE

    const { error: insertError } =
      await supabase
        .from("group_messages")
        .insert({

          group_id: id,
          sender_id: user.id,
          content: data.publicUrl,
          type: "audio"

        });

    if (insertError) {
      console.log("VOICE INSERT ERROR:", insertError.message);
      return;
    }

  } catch (err) {

    console.log("VOICE NOTE ERROR:", err.message);

  }

  setRecording(false);

  mediaRecorderRef.current = null;

};

  recorder.start(100);

  setRecording(true);

};
// Stopping recording 
 const stopRecording = () => {

  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state === "recording"
  ) {

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.stream
      ?.getTracks()
      .forEach(track => track.stop());

    clearInterval(mediaRecorderRef.current.timer);

  }

};
// Media Upload Logic
  const handleMediaSelect = (e) => {

  const files = Array.from(e.target.files);

  const previews = files.map(file => ({

    file,

    preview: URL.createObjectURL(file),

    type:
      file.type.startsWith("video")
        ? "video"
        : "image"

  }));

  setSelectedMedia(prev => [

    ...prev,

    ...previews

  ]);

};
  const fetchGroup = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    setGroup(data);
  };

  const fetchMessages = async () => {
  const { data, error } = await supabase
    .from("group_messages")
     .select(`
id,
content,
type,
caption,
created_at,
sender_id,
reply_to,
profiles:sender_id (
name,
photo
)
`)
    .eq("group_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("❌ FETCH ERROR:", error.message);
    return;
  }

  setMessages(data || []);
};

 useEffect(() => {
  if (!id) return;

  const channel = supabase
    .channel("group-chat")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${id}`,
      },
      async (payload) => {

  const insertedId = payload.new.id;

  const { data: fullMessage } =
    await supabase
      .from("group_messages")
      .select(`
        id,
        content,
        type,
        caption,
        created_at,
        sender_id,
        reply_to,
        profiles:sender_id (
          name,
          photo
        )
      `)
      .eq("id", insertedId)
      .single();

  if (!fullMessage) return;

  setMessages(prev => [
    ...prev,
    fullMessage
  ]);

}
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const sendMessage = async () => {

  if (!newMessage.trim() && !selectedMedia.length)
    return;

  // send TEXT message
  if (newMessage.trim()) {

   const optimisticText = {

  id: `temp-${Date.now()}`,

  content: newMessage,

  type: "text",

  created_at: new Date(),

  sender_id: user.id,

  reply_to: replyTo?.id || null,

  profiles: {
    name: "You",
    photo: user.user_metadata?.avatar_url
  }

};

setMessages(prev => [
  ...prev,
  optimisticText
]);

  const { error } = await supabase
.from("group_messages")
.insert({

group_id: id,
sender_id: user.id,
content: newMessage,
type: "text",
reply_to: replyTo?.id || null

});

if (error) {
console.log("TEXT INSERT ERROR:", error.message);
return;
}

setNewMessage("");
setReplyTo(null);
setSelectedMedia([]);

setMediaCaption("");

  }

  // send MEDIA messages
   for (const media of selectedMedia) {

  const tempId = `temp-${Date.now()}`;

  const fileName =
    `${Date.now()}-${media.file.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("chat-media")
      .upload(fileName, media.file);

  if (uploadError) {
    console.log("UPLOAD ERROR:", uploadError.message);
    return;
  }

  const { data } =
    supabase.storage
      .from("chat-media")
      .getPublicUrl(fileName);

  const optimisticMessage = {

  id: tempId,

  content: data.publicUrl,

  caption: mediaCaption,

  type: media.type,

  created_at: new Date(),

  sender_id: user.id,

  reply_to: replyTo?.id || null,

  profiles: {
    name: "You",
    photo: user.user_metadata?.avatar_url
  }

};

  // 🔥 SHOW MESSAGE IMMEDIATELY
  setMessages(prev => [
    ...prev,
    optimisticMessage
  ]);

  // 🔥 SAVE TO DATABASE
  await supabase
    .from("group_messages")
    .insert({

      group_id: id,

      sender_id: user.id,

      content: data.publicUrl,

      caption: mediaCaption,

      type: media.type

    });

}

  setNewMessage("");
  setReplyTo(null);

  setSelectedMedia([]);

  setMediaCaption("");

};
const messageMap = {};

messages.forEach(m => {
  messageMap[m.id] = m;
});
  return (
    <div className="chat-container">

      {/* 🔥 HEADER */}
      <div className="chat-header">

  {/* BACK BUTTON (mobile only) */}
  <IoArrowBack
    className="group-back-btn"
    onClick={() => navigate("/groups")}
  />

  <div
    className="chat-header-left"
    onClick={() => navigate(`/group-info/${id}`)}
  >
    <img
      src={group?.image || "https://i.pravatar.cc/150"}
      alt="group"
    />

    <div>
      <h3>{group?.name || "Loading..."}</h3>
      <span>

{typingUsers.length === 0
? `${messages.length} messages`

: typingUsers.length === 1
? `${typingUsers[0].name} is typing...`

: typingUsers.length === 2
? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`

: `${typingUsers.length} people are typing...`
}

</span>
    </div>
  </div>

  <div className="menu-wrapper">

    <BsThreeDotsVertical
      className="menu-icon"
      onClick={() => setShowMenu(prev => !prev)}
    />

    {showMenu && (
      <div className="dropdown-menu">

        <button onClick={() => navigate(`/group-info/${id}`)}>
          View Group Info
        </button>

        <button onClick={() => {
  setSearchMode(true);
  setShowMenu(false);
}}>
  Search Messages
</button>

        <button>Mute Notifications</button>

        <button>Leave Group</button>

      </div>
    )}

  </div>

</div>
{/* Search Bar UI */}
{searchMode && (
  <div className="search-bar-modern">
    <input
      placeholder="Search messages..."
      value={searchText}
      onChange={(e)=>setSearchText(e.target.value)}
    />

    <button
className="search-close-btn"
onClick={()=>{
setSearchMode(false)
setSearchText("")
}}
>
✕
</button>
  </div>
)}
      {/* 🔥 CHAT BODY */}
      <div className="chat-body">
        {messages
.filter(msg =>
  msg.content?.toLowerCase()
  .includes(searchText.toLowerCase())
)
.map(msg => {
          const isOwn = msg.sender_id === user?.id;
// {msg.reply_to && (
//   <div className="reply-box">
//     <small>Replying to</small>
//     <p>{msg.reply_to?.content || "Message"}</p>
//   </div>
// )}
          return (
            <div
  id={msg.id}
  key={msg.id}
  className={`message-row ${isOwn ? "own" : ""}`}
>

              {!isOwn && (
                msg.profiles?.photo ? (
                  <img
className="avatar"
src={msg.profiles.photo}

onClick={()=>setSelectedMember(msg)}

/>
                ) : (
                  <div className="avatar-fallback" onClick={()=>setSelectedMember(msg)}>
                    {msg.profiles?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )
              )}

             <div
className="message-bubble"
onDoubleClick={()=>{
setReplyTo(msg)
}}
onTouchStart={(e)=>{
setTouchStartX(e.changedTouches[0].clientX)
}}

onTouchEnd={(e)=>{

const touchEnd=e.changedTouches[0].clientX;

if(touchStartX-touchEnd>80){

setReplyTo(msg)

}

}}>

  {msg.reply_to && messageMap[msg.reply_to] && (
  <div className="reply-box">
     <small className="reply-author">
  {messageMap[msg.reply_to].profiles?.name} replied
</small>

    <p>

{messageMap[msg.reply_to].type === "audio"
? "🎤 Voice note"

: messageMap[msg.reply_to].type === "image"
? "📷 Photo"

: messageMap[msg.reply_to].type === "video"
? "🎥 Video"

: messageMap[msg.reply_to].content}

</p>
  </div>
)}

  {!isOwn && (
    <span className="sender-name">
      {msg.profiles?.name || "User"}
    </span>
  )}

  {msg.type === "audio" ? (

  <VoiceNotePlayer
    audioUrl={msg.content}
    isSender={isOwn}
  />

) : msg.type === "image" ? (

  <>
    <img
      src={msg.content}
      className="chat-media"
    />

    {msg.caption && (
      <p className="media-caption">
        {msg.caption}
      </p>
    )}
  </>

) : msg.type === "video" ? (

  <>
    <video
      src={msg.content}
      controls
      className="chat-media"
    />

    {msg.caption && (
      <p className="media-caption">
        {msg.caption}
      </p>
    )}
  </>

) : (

  <p>{msg.content}</p>

)}

<span className="time">
  {formatTimeNG(msg.created_at)}
</span>

</div>
            </div>
          );
          
        })}
        
        <div ref={bottomRef}></div>
      </div>
{replyTo && (
  <div className="reply-preview">
    <span>{replyTo.profiles?.name || "User"}</span>
    <p>

{replyTo.type === "audio"
? "🎤 Voice note"

: replyTo.type === "image"
? "📷 Photo"

: replyTo.type === "video"
? "🎥 Video"

: replyTo.content}

</p>
    <button onClick={() => setReplyTo(null)}>✕</button>
  </div>
)}
{selectedMedia.length > 0 && (

<div className="media-preview-bar">

{selectedMedia.map((item, index) => (

<div
key={index}
className="media-preview-item"
>

{item.type === "image" ? (

<img src={item.preview} />

) : (

<video src={item.preview} />

)}

<span
className="remove-media"
onClick={() =>
setSelectedMedia(prev =>
prev.filter((_, i) =>
i !== index
)
)
}
>

✕

</span>

</div>

))}

<input
className="media-caption-input"
placeholder="Add a caption..."
value={mediaCaption}
onChange={e =>
setMediaCaption(
e.target.value
)
}
/>

</div>

)}
{recording && (
  <div className="voice-recording-ui">
    <span className="recording-dot"></span>
    Recording... {recordTime}s 🎤
Tap mic again to send
  </div>
)}
<span className="typing-dots">

{typingUsers.length > 0 && `${typingUsers[0].name} is typing`}

{typingUsers.length > 0 && (
<>
<span>.</span>
<span>.</span>
<span>.</span>
</>
)}

</span>
      {/* 🔥 INPUT */}
       <div className="chat-input-wrapper">

<label className="media-upload-btn">

<FaCameraRetro />

<input

type="file"

multiple

accept="image/*,video/*"

hidden

onChange={handleMediaSelect}

/>

</label>

<input

placeholder="Type a message..."

value={newMessage}

onChange={(e) => {
setNewMessage(e.target.value);
handleTyping();
}}
/>

{newMessage.trim() ||

selectedMedia.length > 0 ? (

<button onClick={sendMessage}>

<FiSend />

</button>

) : (

 <button
className={`chat-voice-btn ${
recording ? "recording-active" : ""
}`}
onClick={() => {
if (!recording)
startRecording();
else
stopRecording();
}}
>
{recording
? <FiSend />
: <FaMicrophoneAlt />
}
</button>

)}

</div>
{selectedMember && (

<div
className="profile-modal-overlay"
onClick={()=>setSelectedMember(null)}
>

<div
className="profile-modal"
onClick={(e)=>e.stopPropagation()}
>

<button
className="close-btn"
onClick={()=>setSelectedMember(null)}
>
✖
</button>

<div className="profile-modal-header">

<div className="profile-avatar-large">

{selectedMember.profiles?.photo
? <img src={selectedMember.profiles.photo}/>
: selectedMember.profiles?.name?.charAt(0)
}

</div>

<h3>
{selectedMember.profiles?.name}
</h3>

</div>

<div className="profile-actions">

<button
className="action-btn2"
onClick={()=>
navigate(`/user-profile/${selectedMember.sender_id}`)
}
>

👁 View Profile

</button>

<button
className="action-btn2"
onClick={()=>
navigate(`/chat/${selectedMember.sender_id}`)
}
>

💬 Chat Directly

</button>
</div>
</div>

</div>

)}

    </div>
  );
};

export default GroupChat;