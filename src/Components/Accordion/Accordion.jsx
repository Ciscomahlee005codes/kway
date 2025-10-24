import React, { useState } from "react";
import "./Accordion.css";

export default function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  );
}
