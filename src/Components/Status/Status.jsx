import React, { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { FiCamera } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import "./Status.css";

const bg_color = ["#25d366", "#34b7f1", "#ffeb3b", "#f44336", "#9c27b0"];

const Status = () => {
  const [statuses, setStatuses] = useState([]);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [postType, setPostType] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedBg, setSelectedBg] = useState(bg_color[0]);
  const [file, setFile] = useState(null);
  const [reply, setReply] = useState("");
  const { session, profile } = UserAuth();
  const media = statuses[activeUserIndex]?.stories?.[activeStoryIndex]?.media_url;
  const [videoPoster, setVideoPoster] = useState(null);
  const [paused, setPaused] = useState(false);
  const videoRef = React.useRef();
  const [storyDuration, setStoryDuration] = useState(5000); // default 8s
  const colors = ["#25d366","#34b7f1","#ff9800","#e91e63","#9c27b0"];


 useEffect(() => {
  if (activeUserIndex !== null && !paused) {
    const step = 100 / (storyDuration / 100);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, 100);

    return () => clearInterval(timer);
  }
}, [activeUserIndex, activeStoryIndex, paused, storyDuration]);

  // Video Length
  useEffect(() => {
  if (!media) return;

  if (media.match(/\.(mp4|webm|ogg)$/i)) {
    const vid = document.createElement("video");
    vid.src = media;

    vid.onloadedmetadata = () => {
      const seconds = vid.duration;

      // limit max duration (WhatsApp style)
      const duration = Math.min(seconds * 1000, 50000); // max 30s

      setStoryDuration(duration);
    };
  } else {
    setStoryDuration(5000); // text & images = 5 seconds
  }
}, [media]);
  // Video poster generation
  const generateVideoPoster = (url) => {
  try {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(1, video.duration / 2);
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      setVideoPoster(canvas.toDataURL("image/jpeg"));
    });

    video.addEventListener("error", () => {
      console.log("Poster generation failed");
      setVideoPoster(null);
    });

  } catch (err) {
    console.log("Poster crash:", err);
  }
}; 
useEffect(() => {
  if (media?.match(/\.(mp4|webm|ogg)$/i)) {
    generateVideoPoster(media);
  } else {
    setVideoPoster(null);
  }
}, [media]);
  useEffect(() => {
  fetchStatuses();
}, []);


  useEffect(() => {
  const channel = supabase
    .channel("status-changes")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "status" },
      fetchStatuses
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);

 const fetchStatuses = async () => {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // 1️⃣ GET STATUS
    const { data: statusData, error: statusError } = await supabase
      .from("status")
      .select("*")
      .gt("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false });

    if (statusError) {
      console.log("Status fetch error:", statusError);
      return;
    }

    if (!statusData || statusData.length === 0) {
      setStatuses([]);
      return;
    }

    // 2️⃣ GET PROFILE DATA
    const userIds = [...new Set(statusData.map(s => s.user_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, photo")
      .in("id", userIds);

    const profileMap = {};
    profiles?.forEach(p => profileMap[p.id] = p);

    // 3️⃣ GROUP STATUS BY USER
    const grouped = Object.values(
      statusData.reduce((acc, s) => {
        if (!acc[s.user_id]) {
          acc[s.user_id] = {
            id: s.user_id,
            name: profileMap[s.user_id]?.name || "Unknown",
            photo: profileMap[s.user_id]?.photo
  ? profileMap[s.user_id].photo + `&cb=${Date.now()}`
  : null,
            stories: [],
          };
        }
        acc[s.user_id].stories.push(s);
        return acc;
      }, {})
    );

    setStatuses(grouped);

  } catch (err) {
    console.log("Fetch crash:", err);
  }
};
const sendReply = async () => {
  if (!reply) return;

  const story =
    statuses[activeUserIndex]?.stories?.[activeStoryIndex]

  await supabase.from("status_replies").insert({
    status_id: story.id,
    user_id: session.user.id,
    message: reply,
  });

  toast.success("Reply sent");
  setReply("");
};

 const renderAvatar = (photo, name, size = 60) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
    );
  }

  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";

  const colors = ["#25d366","#34b7f1","#ff9800","#e91e63","#9c27b0"];

  const bgColor =
    colors[name?.charCodeAt(0) % colors.length] || "#25d366";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "600",
        fontSize: size / 2.2,
        textTransform: "uppercase"
      }}
    >
      {firstLetter}
    </div>
  );
};
  const openStatus = (index) => {
    setActiveUserIndex(index);
    setActiveStoryIndex(0);
    setProgress(0);
  };
   const markSeen = async (storyId) => {
  if (!session?.user) return;

  await supabase.from("status_views").upsert({
    status_id: storyId,
    viewer_id: session.user.id,
  });
};

  useEffect(() => {
  if (
    activeUserIndex !== null &&
    statuses[activeUserIndex]?.stories?.[activeStoryIndex]
  ) {
    const story =
      statuses[activeUserIndex]?.stories?.[activeStoryIndex];

    markSeen(story.id);
  }
}, [activeStoryIndex]);


  const closeStatus = () => {
    setActiveUserIndex(null);
    setProgress(0);
  };

  const nextStory = () => {
    const currentUser = statuses[activeUserIndex];
    if (activeStoryIndex < currentUser.stories.length - 1) setActiveStoryIndex(prev => prev + 1);
    else nextUser();
    setProgress(0);
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) setActiveStoryIndex(prev => prev - 1);
    else prevUser();
    setProgress(0);
  };

  const nextUser = () => {
    if (activeUserIndex < statuses.length - 1) setActiveUserIndex(prev => prev + 1);
    else closeStatus();
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const prevUser = () => {
    if (activeUserIndex > 0) setActiveUserIndex(prev => prev - 1);
    setActiveStoryIndex(statuses[activeUserIndex - 1].stories.length - 1);
    setProgress(0);
  };
const handlePost = async () => {
  if (!session?.user) {
    toast.error("Login first");
    return;
  }

  // CLOSE MODAL INSTANTLY
  setShowPostModal(false);
  setPostType(null);
  setPostContent("");
  setPreview(null);
  setFile(null);

  toast.loading("Posting...", { id: "post" });

  try {
    let mediaUrl = null;

    if (file) {
      const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("status-media")
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("status-media")
        .getPublicUrl(filePath);

      mediaUrl = data.publicUrl;
    }

    const { error } = await supabase.from("status").insert({
      user_id: session.user.id,
      type: postType,
      media_url: mediaUrl,
      text: postContent,
      bg_color: selectedBg,
    });

    if (error) throw error;

    toast.success("Status Posted", { id: "post" });
    fetchStatuses();

  } catch (err) {
    console.log(err);
    toast.error("Failed to post", { id: "post" });
  }
};


 
  const handleFileChange = (e) => {
  const f = e.target.files[0];
  if (!f) return;

  setFile(f);   // SAVE REAL FILE

  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result);
  reader.readAsDataURL(f);
};


  return (
    <div className="status-page">
      {/* Post Modal */}
{showPostModal && (
  <div className="post-modal">
    <div className="post-box">
      <h3>Create Status</h3>

      {/* Post Type Selection */}
{!postType && (
  <div className="type-grid">
    <div className="type-card" onClick={() => setPostType("text")}>
      <h3> Text Status</h3>
      <p>Share thoughts with colors</p>
    </div>

    <div className="type-card" onClick={() => setPostType("media")}>
      <h3> Photo / Video</h3>
      <p>Share moments instantly</p>
    </div>
  </div>
)}


      {/* Text Post */}
      {postType === "text" && (
        <>
          <textarea
            placeholder="Type your status…"
            className="post-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="bg-picker">
            {bg_color.map(color => (
              <span
                key={color}
                className={`color-circle ${selectedBg === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedBg(color)}
              />
            ))}
          </div>
          {postContent && (
            <div className="status-preview" style={{ backgroundColor: selectedBg }}>
              <p>{postContent}</p>
            </div>
          )}
        </>
      )}

      {/* Media Post */}
      {postType === "media" && (
        <>
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="file-input" />
          {preview && (
            <div className="status-preview">
              {preview.startsWith("data:image") ? (
                <img src={preview} alt="Preview" className="preview-img" />
              ) : (
                <video src={preview} controls className="preview-img" />
              )}
            </div>
          )}
          <textarea
            placeholder="Write a caption…"
            className="post-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button onClick={() => { setShowPostModal(false); setPostType(null); setPostContent(""); setPreview(null); }}>Cancel</button>
        <button className="send-btn" onClick={handlePost}>Post</button>
      </div>
    </div>
  </div>
)}

    

      {/* Header */}
      <div className="status-header">
        <h2 className="status-title">Status</h2>
        <div className="dropdown-wrapper">
          <BsThreeDotsVertical className="status-menu" onClick={() => setDropdownOpen(!dropdownOpen)} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p>Refresh</p>
              <p>Status Privacy</p>
              <p>Clear My Status</p>
              <p>Settings</p>
            </div>
          )}
        </div>
      </div>

      {/* My Status */}
      <div className="my-status" onClick={() => setShowPostModal(true)}>
        <div className="status-avatar">
          <img  src={profile?.photo} alt="My Profile" className="avatar" />
          <FiPlus className="add-icon" />
        </div>
        <div className="status-text">
          <h3>My Status</h3>
          <p>Tap to add status update</p>
        </div>
      </div>

      {/* Recent Updates */}
      <h4 className="section-title">Recent updates</h4>
      <div className="status-list">
        {statuses.map((s, index) => (
          <div className="status-item" key={s.id} onClick={() => openStatus(index)}>
            <div className="status-avatar ring">
              {s.stories[0].type === "text" ? (
                <div style={{ backgroundColor: s.stories[0].bg_color }} className="text-avatar">{s.stories[0].text}</div>
              ) : s.stories[0].media_url ? (
                <img
                  src={s.stories[0].media_url}
                  alt={s.name}
                  className="avatar"
                />
              ) : (
                renderAvatar(s.photo, s.name, 55)
              )}
            </div>
            <div className="status-text">
              <h3>{s.name}</h3>
                <p>
  {new Date(s.stories[0].created_at).toLocaleTimeString()}
</p>

            </div>
          </div>
        ))}
      </div>

      {/* Status Modal */}
      {activeUserIndex !== null && (
        <div className="status-modal">
          <div
  className="status-modal-content"
  onMouseDown={() => {
    setPaused(true);
    videoRef.current?.pause();
  }}
  onMouseUp={() => {
    setPaused(false);
    videoRef.current?.play();
  }}
  onTouchStart={() => {
    setPaused(true);
    videoRef.current?.pause();
  }}
  onTouchEnd={() => {
    setPaused(false);
    videoRef.current?.play();
  }}
>
            <div className="progress-container">
              {statuses[activeUserIndex]?.stories?.[activeStoryIndex] && statuses[activeUserIndex]?.stories?.map((_, i) => (
                <div key={i} className={`progress-bar ${i < activeStoryIndex ? "filled" : ""}`}>
                  {i === activeStoryIndex && <div className="progress-fill" style={{ width: `${progress}%` }} />}
                </div>
              ))}
            </div>

            {statuses[activeUserIndex]?.stories?.[activeStoryIndex]?.type === "text" ? (
  <div
    className="status-text-full"
    style={{
      backgroundColor:
        statuses[activeUserIndex]?.stories?.[activeStoryIndex]?.bg_color,
    }}
  >
    <p>
      {statuses[activeUserIndex]?.stories?.[activeStoryIndex]?.text}
    </p>
  </div>
) : <div className="status-media-wrapper">
  {media?.match(/\.(mp4|webm|ogg)$/i) ? (
    <video
      ref={videoRef}
      src={media}
      poster={videoPoster}
      autoPlay
      controls
      className="status-modal-img"
    />
  ) : (
    <img src={media} alt="status" className="status-modal-img" />
  )}
</div>}

            <div className="status-top-overlay">
              <div className="status-user-info">
                {renderAvatar(
  statuses[activeUserIndex]?.photo,
  statuses[activeUserIndex]?.name,
  40
)}
                <div>
                  <h3>{statuses[activeUserIndex]?.name}</h3>
                  <p>
 {new Date(
   statuses[activeUserIndex]
     ?.stories?.[activeStoryIndex]
     ?.created_at
 ).toLocaleTimeString()}
</p>

                </div>
              </div>

              
            </div>
            <div className="status-bottom-overlay">
              <div className="status-bottom-ui">
     <div className="reply-box">
  <input
    placeholder="Reply..."
    value={reply}
    onChange={e => setReply(e.target.value)}
  />
  <button onClick={sendReply}>Send</button>
           </div>

           <p className="seen-count">
 👀 {statuses[activeUserIndex]
   .stories[activeStoryIndex]
   .views_count || 0} seen
</p>

{/* <div className="emoji-bar">
  {["❤️","🔥","😂"].map(e => (
    <span key={e} onClick={() => react(e)}>{e}</span>
  ))}
</div> */}
  </div>
              <p className="status-caption">{statuses[activeUserIndex]?.stories?.[activeStoryIndex]?.text}</p>
            </div>
            <IoClose className="close-btn4" onClick={closeStatus} />
            <IoChevronBack className="nav-btn left" onClick={prevStory} />
            <IoChevronForward className="nav-btn right" onClick={nextStory} />
          </div>
  
        </div>

      )}
     


     <div className="fab-group">

  <button
    className="fab camera"
    onClick={() => {
      setPostType("media");
      setShowPostModal(true);
    }}
  >
    <FiCamera />
  </button>

  <button
    className="fab text"
    onClick={() => {
      setPostType("text");
      setShowPostModal(true);
    }}
  >
    <MdEdit />
  </button>

</div>


    </div>
  );
};

export default Status;
