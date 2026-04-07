import React, { useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, toggleTheme, changeTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switcher">
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Light/Dark</button>

      <button onClick={() => changeTheme("blue")}>Blue Theme</button>
      <button onClick={() => changeTheme("green")}>Green Theme</button>
    </div>
  );
};

export default ThemeSwitcher;
