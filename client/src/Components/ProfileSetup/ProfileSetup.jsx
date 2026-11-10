import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCamera,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoShuffle,
  IoArrowForward,
  IoArrowBack,
  IoPencil,
  IoSparkles,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import toast from "react-hot-toast";
import "./ProfileSetup.css";

// "value" is what gets saved in the database (same strings as before)
const CHAT_MODES = [
  { value: "Calm 🌿", emoji: "🌿", label: "Calm", hint: "Peaceful and chill" },
  { value: "Vibes ✨", emoji: "✨", label: "Vibes", hint: "Good energy only" },
  { value: "Cruise 😎", emoji: "😎", label: "Cruise", hint: "Easy going" },
  { value: "Savage 😂", emoji: "😂", label: "Savage", hint: "Here for the jokes" },
  { value: "Focus 🎧", emoji: "🎧", label: "Focus", hint: "Low noise, deep work" },
];

const SWATCHES = [
  "#0d6329", "#16a34a", "#0ea5e9", "#6366f1",
  "#a855f7", "#ec4899", "#f97316", "#ef4444",
];

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Review" },
];

const USERNAME_RE = /^[a-z0-9._]{3,20}$/;

// Pick black or white text depending on how light the theme colour is
const readableOn = (hex) => {
  const c = (hex || "#0d6329").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#0b1f14" : "#ffffff";
};

const longDate = (d) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
        day: "numeric", month: "long", year: "numeric",
      })
    : "Not set";

const shortDate = (d) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })
    : "";

const USERNAME_HINTS = {
  idle: "3 to 20 characters: letters, numbers, . or _",
  invalid: "Use 3 to 20 letters, numbers, . or _",
  checking: "Checking...",
  taken: "That one's taken, try another",
};

const ProfileSetup = () => {
  const navigate = useNavigate();

  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle|invalid|checking|available|taken
  const [about, setAbout] = useState("");
  const [theme, setTheme] = useState("#0d6329");
  const [dob, setDob] = useState("");
  const [chatMode, setChatMode] = useState("Calm 🌿");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Emoji burst for the success screen (computed once)
  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        emoji: ["🎉", "✨", "💚", "🔥", "🎊"][i % 5],
        angle: (i / 18) * Math.PI * 2,
        dist: 120 + Math.random() * 90,
      })),
    []
  );

  // Make sure the user is signed in and doesn't already have a profile
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/", { replace: true });
        return;
      }

      const authUser = session.user;
      setUser(authUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profile) {
        navigate("/chat", { replace: true });
        return;
      }

      setLoadingUser(false);
    };

    checkUser();
  }, [navigate]);

  // Live "is this username free?" check
  useEffect(() => {
    if (!username) { setUsernameStatus("idle"); return; }
    if (!USERNAME_RE.test(username)) { setUsernameStatus("invalid"); return; }

    let cancelled = false;
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (cancelled) return;
      // If we can't check, let the database be the judge when saving
      setUsernameStatus(error ? "available" : data ? "taken" : "available");
    }, 450);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [username]);

  if (loadingUser) {
    return (
      <div className="ps-page ps-loading">
        <div className="ps-spinner" />
      </div>
    );
  }

  // ---------- Photo ----------
  const handlePhotoChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setUploading(true);
      const filePath = `private/${user.id}/${user.id}-${Date.now()}.jpeg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setPhoto(`${data.publicUrl}?t=${Date.now()}`); // cache busting
      toast.success("Photo uploaded ✅");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image ❌");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const generateAvatar = () => {
    const seed = Math.floor(Math.random() * 100000);
    setPhoto(`https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`);
  };

  // ---------- Steps ----------
  const validateStep1 = () => {
    if (!name.trim()) {
      toast.error("Add your display name");
      return false;
    }
    if (!USERNAME_RE.test(username)) {
      toast.error("Username: 3 to 20 letters, numbers, . or _");
      return false;
    }
    if (usernameStatus === "taken") {
      toast.error("That username is taken");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(3, s + 1));
  };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // Going back is always allowed; going forward needs step 1 to be valid
  const goTo = (target) => {
    if (target <= step) return setStep(target);
    if (validateStep1()) setStep(target);
  };

  // ---------- Save ----------
  const handleConfirm = async () => {
    if (submitting) return;
    if (!user) {
      toast.error("Authentication error");
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name: name.trim(),
        username: username.toLowerCase(),
        photo,
        about: about.trim(),
        theme,
        dob: dob || null,
        chat_mode: chatMode,
        gender: gender || null,
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => navigate("/chat"), 1800);
    } catch (err) {
      console.error(err);
      if (err?.code === "23505") {
        toast.error("That username was just taken. Pick another one.");
        setStep(1);
      } else {
        toast.error(err.message || "Something went wrong");
      }
      setSubmitting(false);
    }
  };

  const initial = (name.trim()[0] || "?").toUpperCase();
  const moodObj = CHAT_MODES.find((m) => m.value === chatMode);
  const today = new Date().toISOString().split("T")[0];

  const cssVars = {
    "--accent": theme,
    "--accent-ink": readableOn(theme),
    "--accent-soft": `${theme}1f`,
    "--accent-mid": `${theme}55`,
  };

  const usernameHint =
    usernameStatus === "available" ? `@${username} is available` : USERNAME_HINTS[usernameStatus];

  return (
    <div className="ps-page" style={cssVars}>
      <div className="ps-bg" aria-hidden="true">
        <span className="ps-blob ps-blob-1" />
        <span className="ps-blob ps-blob-2" />
      </div>

      <motion.div
        className="ps-shell"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* ============ LIVE PREVIEW ============ */}
        <aside className="ps-preview">
          <span className="ps-pv-label">Live preview</span>

          <div className="ps-pv-card">
            <div className="ps-pv-cover" />
            <div className="ps-pv-avatar">
              {photo ? <img src={photo} alt="" /> : <span>{initial}</span>}
            </div>
            <div className="ps-pv-text">
              <h3>{name.trim() || "Your name"}</h3>
              <p className="ps-pv-user">@{username || "username"}</p>
              <p className="ps-pv-bio">
                {about.trim() || "Your bio shows up here. Make it count ✨"}
              </p>
              <div className="ps-pv-chips">
                <span className="ps-chip">{chatMode}</span>
                {dob && <span className="ps-chip">🎂 {shortDate(dob)}</span>}
              </div>
            </div>
          </div>

          <p className="ps-pv-tip">This is how friends will see you on Kway.</p>
        </aside>

        {/* ============ FORM ============ */}
        <section className="ps-panel">
          {/* Stepper */}
          <div className="ps-stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  className={`ps-step ${step === s.id ? "is-active" : ""} ${step > s.id ? "is-done" : ""}`}
                  onClick={() => goTo(s.id)}
                >
                  <span className="ps-step-dot">{step > s.id ? "✓" : s.id}</span>
                  <span className="ps-step-label">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`ps-step-line ${step > s.id ? "is-done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                className="ps-step-body"
                initial={{ x: 36, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -36, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="ps-title">Let's set you up 👋</h2>
                <p className="ps-sub">Pick a photo, a name and a colour that feels like you.</p>

                <div className="ps-photo-row">
                  <div className="ps-photo">
                    {photo ? <img src={photo} alt="Your profile" /> : <IoCamera />}
                    {uploading && (
                      <span className="ps-photo-loading"><i /></span>
                    )}
                  </div>
                  <div className="ps-photo-actions">
                    <div className="ps-photo-buttons">
                      <label className="ps-btn ps-btn-soft">
                        Upload photo
                        <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                      </label>
                      <button type="button" className="ps-btn ps-btn-ghost" onClick={generateAvatar}>
                        <IoShuffle /> Random avatar
                      </button>
                    </div>
                    <small>JPG or PNG, up to 5 MB</small>
                  </div>
                </div>

                <div className="ps-field">
                  <label htmlFor="ps-name">Display name</label>
                  <input
                    id="ps-name"
                    value={name}
                    maxLength={40}
                    placeholder="What should friends call you?"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={`ps-field ${usernameStatus === "taken" || (username && usernameStatus === "invalid") ? "has-error" : ""}`}>
                  <label htmlFor="ps-username">Username</label>
                  <div className="ps-input-wrap">
                    <span className="ps-prefix">@</span>
                    <input
                      id="ps-username"
                      value={username}
                      maxLength={20}
                      placeholder="yourname"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))
                      }
                    />
                    <span className="ps-status">
                      {usernameStatus === "available" && <IoCheckmarkCircle className="ok" />}
                      {(usernameStatus === "taken" || (username && usernameStatus === "invalid")) && (
                        <IoCloseCircle className="bad" />
                      )}
                      {usernameStatus === "checking" && <i className="ps-mini-spin" />}
                    </span>
                  </div>
                  <small className={`ps-hint is-${usernameStatus}`}>{usernameHint}</small>
                </div>

                <div className="ps-field">
                  <label htmlFor="ps-bio">
                    Bio <span className="ps-count">{about.length}/120</span>
                  </label>
                  <textarea
                    id="ps-bio"
                    value={about}
                    maxLength={120}
                    placeholder="Say something about you..."
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>

                <div className="ps-field">
                  <label>Theme colour</label>
                  <div className="ps-swatches">
                    {SWATCHES.map((c) => (
                      <button
                        type="button"
                        key={c}
                        className={`ps-swatch ${theme.toLowerCase() === c ? "is-on" : ""}`}
                        style={{ background: c }}
                        onClick={() => setTheme(c)}
                        aria-label={`Use colour ${c}`}
                      />
                    ))}
                    <label className="ps-swatch ps-swatch-custom" title="Pick any colour">
                      <input
                        type="color"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        aria-label="Custom colour"
                      />
                      <span>+</span>
                    </label>
                  </div>
                </div>

                <div className="ps-actions">
                  <button type="button" className="ps-btn ps-btn-primary" onClick={nextStep}>
                    Next <IoArrowForward />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                className="ps-step-body"
                initial={{ x: 36, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -36, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="ps-title">Make it personal ✨</h2>
                <p className="ps-sub">A few details so Kway feels like yours.</p>

                <div className="ps-field">
                  <label htmlFor="ps-dob">Date of birth 🎂</label>
                  <input
                    id="ps-dob"
                    type="date"
                    value={dob}
                    min="1900-01-01"
                    max={today}
                    onChange={(e) => setDob(e.target.value)}
                  />
                  <small className="ps-hint">We'll celebrate you on your birthday 🎉</small>
                </div>

                <div className="ps-field">
                  <label>Chat mood</label>
                  <div className="ps-moods">
                    {CHAT_MODES.map((m) => (
                      <button
                        type="button"
                        key={m.value}
                        className={`ps-mood ${chatMode === m.value ? "is-on" : ""}`}
                        onClick={() => setChatMode(m.value)}
                      >
                        <span className="ps-mood-emoji">{m.emoji}</span>
                        <span className="ps-mood-name">{m.label}</span>
                        <span className="ps-mood-hint">{m.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ps-field">
                  <label>Gender</label>
                  <div className="ps-genders">
                    <button
                      type="button"
                      className={`ps-gender ${gender === "male" ? "is-on" : ""}`}
                      onClick={() => setGender(gender === "male" ? "" : "male")}
                    >
                      <span>👨</span> Male
                    </button>
                    <button
                      type="button"
                      className={`ps-gender ${gender === "female" ? "is-on" : ""}`}
                      onClick={() => setGender(gender === "female" ? "" : "female")}
                    >
                      <span>👩</span> Female
                    </button>
                  </div>
                </div>

                <div className="ps-actions">
                  <button type="button" className="ps-btn ps-btn-ghost" onClick={prevStep}>
                    <IoArrowBack /> Back
                  </button>
                  <button type="button" className="ps-btn ps-btn-primary" onClick={nextStep}>
                    Next <IoArrowForward />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                className="ps-step-body"
                initial={{ x: 36, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -36, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="ps-title">Looking good 👀</h2>
                <p className="ps-sub">Check everything, then jump in.</p>

                <div className="ps-review-hero">
                  <div className="ps-review-avatar">
                    {photo ? <img src={photo} alt="" /> : <span>{initial}</span>}
                  </div>
                  <div>
                    <h3>{name.trim() || "No name yet"}</h3>
                    <p>@{username || "username"}</p>
                  </div>
                  <button type="button" className="ps-edit" onClick={() => setStep(1)}>
                    <IoPencil /> Edit
                  </button>
                </div>

                <div className="ps-review-list">
                  <div className="ps-review-row">
                    <span>Bio</span>
                    <strong>{about.trim() || "Not set"}</strong>
                  </div>
                  <div className="ps-review-row">
                    <span>Theme</span>
                    <strong><i className="ps-color-dot" /> {theme}</strong>
                  </div>
                  <div className="ps-review-row">
                    <span>Birthday</span>
                    <strong>{longDate(dob)}</strong>
                  </div>
                  <div className="ps-review-row">
                    <span>Chat mood</span>
                    <strong>{moodObj ? `${moodObj.emoji} ${moodObj.label}` : chatMode}</strong>
                  </div>
                  <div className="ps-review-row">
                    <span>Gender</span>
                    <strong>{gender ? gender[0].toUpperCase() + gender.slice(1) : "Not set"}</strong>
                  </div>
                  <button type="button" className="ps-edit ps-edit-wide" onClick={() => setStep(2)}>
                    <IoPencil /> Edit personal details
                  </button>
                </div>

                <div className="ps-actions">
                  <button type="button" className="ps-btn ps-btn-ghost" onClick={prevStep} disabled={submitting}>
                    <IoArrowBack /> Back
                  </button>
                  <button
                    type="button"
                    className="ps-btn ps-btn-primary"
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    {submitting ? "Creating your profile..." : (<>Confirm and continue 🚀</>)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

      {/* ============ SUCCESS ============ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="ps-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="ps-success-burst" aria-hidden="true">
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                  animate={{
                    x: Math.cos(c.angle) * c.dist,
                    y: Math.sin(c.angle) * c.dist,
                    opacity: 0,
                    scale: 1.3,
                  }}
                  transition={{ duration: 1.3, ease: "easeOut" }}
                >
                  {c.emoji}
                </motion.span>
              ))}
            </div>

            <motion.div
              className="ps-success-card"
              initial={{ scale: 0.75, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
            >
              <div className="ps-success-avatar">
                {photo ? <img src={photo} alt="" /> : <span>{initial}</span>}
              </div>
              <h2>
                Kwayyy @{username || "friend"} <IoSparkles />
              </h2>
              <p>Setting things up for you...</p>
              <div className="ps-success-bar"><i /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSetup;