import React, { useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import "./ThemePicker.css";

export default function ThemePicker() {
  const { toggleTheme, setColor } = useContext(ThemeContext);

  const colors = ["#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"];

  return (
    <div className="theme-picker">
      <button onClick={toggleTheme} className="toggle-btn">
        Toggle Light/Dark Mode
      </button>
      <h4>Choose Theme Color:</h4>
      <div className="color-options">
        {colors.map((c) => (
          <span
            key={c}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          ></span>
        ))}
      </div>
    </div>
  );
}
