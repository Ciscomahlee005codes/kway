import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageContext";
import "./Help.css";

const Help = () => {
  const navigate = useNavigate();
  const { t } = useLanguage(); // ✅ Ensure t() comes from your LanguageContext
  const [active, setActive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [issue, setIssue] = useState("");
  const [file, setFile] = useState(null);

  const toggle = (i) => setActive(active === i ? null : i);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setIssue("");
    setFile(null);
  };

  const submitReport = () => {
    if (!issue.trim()) {
      alert(t("problemRequired"));
      return;
    }

    console.log("Issue:", issue);
    console.log("File:", file);

    closeModal();
    alert(t("reportSubmitted"));
  };

  // ✅ Build FAQs dynamically using t()
  const faqs = [
    {
      q: t("faqChangePasswordQ"),
      a: t("faqChangePasswordA"),
    },
    {
      q: t("faqEnable2FAQ"),
      a: t("faqEnable2FAA"),
    },
    {
      q: t("faqChangeLanguageQ"),
      a: t("faqChangeLanguageA"),
    },
    {
      q: t("faqReportProblemQ"),
      a: t("faqReportProblemA"),
    },
    {
      q: t("faqBackupQ"),
      a: t("faqBackupA"),
    },
  ];

  return (
    <div className="help-container">
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> {t("back")}
      </div>

      <h2 className="help-title">{t("helpSupport")}</h2>

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
        {t("reportProblem")}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t("reportProblem")}</h3>

            <textarea
              placeholder={t("describeIssue")}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />

            <label className="file-upload">
              {t("uploadScreenshot")}
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>
                {t("cancel")}
              </button>
              <button className="submit-btn" onClick={submitReport}>
                {t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
