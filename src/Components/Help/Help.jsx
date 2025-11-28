import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FaArrowLeft } from "react-icons/fa"; // ✅ Back icon
import "./Help.css";

const Help = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [active, setActive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [issue, setIssue] = useState("");
  const [file, setFile] = useState(null);

  const toggle = (i) => {
    setActive(active === i ? null : i);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setIssue("");
    setFile(null);
  };

  const submitReport = () => {
    if (!issue.trim()) {
      alert("Please describe the problem.");
      return;
    }

    console.log("Issue:", issue);
    console.log("File:", file);

    closeModal();
    alert("Your report has been submitted!");
  };

  const faqs = [
    { q: "How do I change my password?", a: "Go to Settings → Account → Password Change." },
    { q: "How do I enable Two-Factor Authentication?", a: "Go to Settings → Account → Two-Factor Authentication." },
    { q: "How do I change the language?", a: "Go to Settings → Language and select your preferred one." },
    { q: "How do I report a problem?", a: "Scroll to the bottom and click ‘Report a Problem’." },
    { q: "How can I backup my messages?", a: "Cloud backup is coming soon." }
  ];

  return (
    <div className="help-container">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <h2 className="help-title">Help & Support</h2>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <div className="faq-item" key={i}>
            <div className="faq-question" onClick={() => toggle(i)}>
              <span>{item.q}</span>
              <span className={`arrow ${active === i ? "rotate" : ""}`}>›</span>
            </div>

            <div className={`faq-answer ${active === i ? "show" : ""}`}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="report-btn" onClick={openModal}>
        Report a Problem
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Report a Problem</h3>

            <textarea
              placeholder="Describe the issue..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            ></textarea>

            <label className="file-upload">
              Upload Screenshot (Optional)
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="submit-btn" onClick={submitReport}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
