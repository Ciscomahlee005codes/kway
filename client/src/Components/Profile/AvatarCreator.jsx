import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import "./AvatarCreator.css";

const skinTones = [
  { label: "Light", value: "#f5d0b5" },
  { label: "Medium light", value: "#e8b18d" },
  { label: "Medium", value: "#c9845a" },
  { label: "Medium deep", value: "#92583d" },
  { label: "Deep", value: "#593727" },
];

const hairColors = [
  { label: "Black", value: "#25201e" },
  { label: "Brown", value: "#593a2b" },
  { label: "Blonde", value: "#d4a84f" },
  { label: "Auburn", value: "#9d4935" },
  { label: "Silver", value: "#a7a9b3" },
];

const shirtColors = [
  { label: "Forest", value: "#18734c" },
  { label: "Ocean", value: "#2776ad" },
  { label: "Berry", value: "#a74466" },
  { label: "Sunshine", value: "#d99631" },
  { label: "Violet", value: "#7955a2" },
];

const backgrounds = [
  { label: "Mint", value: "#d9f2e4" },
  { label: "Sky", value: "#dceefa" },
  { label: "Peach", value: "#fae3d6" },
  { label: "Lilac", value: "#ece2f7" },
  { label: "Sand", value: "#f4ebd5" },
];

const hairstyles = ["Short", "Curly", "Long"];

const makeAvatar = ({ skin, hair, shirt, background, hairstyle }) => {
  const hairShape = {
    Short: `<path d="M51 91c-8-41 11-67 49-67 39 0 57 27 49 67l-11 8H62z" fill="${hair}"/>
      <path d="M61 70c8-23 25-35 48-34 14 1 26 7 34 18-11-5-20-4-28 2-13-8-30-5-42 8-4 4-8 7-12 8z" fill="${hair}"/>`,
    Curly: `<path d="M50 94c-9-12-9-31 2-39-2-14 10-25 23-24 7-12 24-14 34-6 13-8 30 0 32 14 15 7 17 27 7 39l-9 16H61z" fill="${hair}"/>
      <circle cx="61" cy="54" r="15" fill="${hair}"/><circle cx="81" cy="36" r="16" fill="${hair}"/>
      <circle cx="105" cy="31" r="17" fill="${hair}"/><circle cx="131" cy="42" r="16" fill="${hair}"/>
      <circle cx="144" cy="62" r="14" fill="${hair}"/>`,
    Long: `<path d="M48 94c-9-46 11-72 52-72 42 0 63 30 51 76l-4 58H56z" fill="${hair}"/>
      <path d="M60 72c8-25 26-39 51-37 14 1 25 7 34 19-12-4-21-3-29 4-15-8-30-4-43 9-4 3-8 5-13 5z" fill="${hair}"/>`,
  }[hairstyle];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" shape-rendering="geometricPrecision">
    <circle cx="100" cy="100" r="100" fill="${background}"/>
    <circle cx="100" cy="100" r="92" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="3"/>
    <path d="M29 200c5-39 28-59 71-59s66 20 71 59z" fill="${shirt}"/>
    <path d="M82 130h36v31c-10 11-26 11-36 0z" fill="${skin}"/>
    ${hairShape}
    <path d="M100 43c-22 0-39 18-39 46 0 27 16 49 39 49s39-22 39-49c0-28-17-46-39-46z" fill="${skin}"/>
    <path d="M65 72c8-25 27-38 49-36 14 1 25 7 33 19-11-4-20-3-28 3-15-9-34-3-48 13-2 2-4 3-6 4z" fill="${hair}"/>
    <ellipse cx="62" cy="96" rx="7" ry="10" fill="${skin}"/>
    <ellipse cx="138" cy="96" rx="7" ry="10" fill="${skin}"/>
    <path d="M77 91c4-3 9-3 13 0M110 91c4-3 9-3 13 0" fill="none" stroke="#49332d" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="84" cy="101" rx="3.5" ry="4.5" fill="#302923"/>
    <ellipse cx="116" cy="101" rx="3.5" ry="4.5" fill="#302923"/>
    <circle cx="85" cy="100" r="1.1" fill="#fff"/>
    <circle cx="117" cy="100" r="1.1" fill="#fff"/>
    <path d="M100 103l-4 13 6 1" fill="none" stroke="#a96550" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M89 126c7 7 16 7 23 0" fill="none" stroke="#914f48" stroke-width="3" stroke-linecap="round"/>
    <path d="M70 72c7-15 20-25 35-28" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const AvatarCreator = ({ onClose, onSave }) => {
  const [options, setOptions] = useState({
    skin: skinTones[2].value,
    hair: hairColors[0].value,
    shirt: shirtColors[0].value,
    background: backgrounds[0].value,
    hairstyle: hairstyles[0],
  });
  const [saving, setSaving] = useState(false);

  const updateOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(makeAvatar(options));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-creator-overlay" onMouseDown={onClose}>
      <section
        className="avatar-creator"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-creator-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="avatar-creator-header">
          <div>
            <span className="avatar-creator-eyebrow">MAKE IT YOU</span>
            <h2 id="avatar-creator-title">Create your avatar</h2>
            <p>No photo needed. Make a look that feels like you.</p>
          </div>
          <button
            type="button"
            className="avatar-creator-close"
            onClick={onClose}
            aria-label="Close avatar creator"
          >
            ×
          </button>
        </header>

        <div className="avatar-creator-body">
          <div className="avatar-creator-preview">
            <img src={makeAvatar(options)} alt="Preview of your custom avatar" />
            <span>YOUR AVATAR</span>
          </div>

          <div className="avatar-creator-options">
            <fieldset className="avatar-option-group">
              <legend>Skin tone</legend>
              <div className="avatar-swatches">
                {skinTones.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    className={`avatar-swatch${options.skin === tone.value ? " selected" : ""}`}
                    style={{ "--swatch-color": tone.value }}
                    aria-label={tone.label}
                    aria-pressed={options.skin === tone.value}
                    onClick={() => updateOption("skin", tone.value)}
                  >
                    {options.skin === tone.value && <FaCheck />}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="avatar-option-group">
              <legend>Hair style</legend>
              <div className="avatar-style-options">
                {hairstyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={options.hairstyle === style ? "selected" : ""}
                    aria-pressed={options.hairstyle === style}
                    onClick={() => updateOption("hairstyle", style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </fieldset>

            {[
              { title: "Hair color", key: "hair", choices: hairColors },
              { title: "Outfit", key: "shirt", choices: shirtColors },
              { title: "Background", key: "background", choices: backgrounds },
            ].map(({ title, key, choices }) => (
              <fieldset className="avatar-option-group" key={key}>
                <legend>{title}</legend>
                <div className="avatar-swatches">
                  {choices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      className={`avatar-swatch${options[key] === choice.value ? " selected" : ""}`}
                      style={{ "--swatch-color": choice.value }}
                      aria-label={choice.label}
                      aria-pressed={options[key] === choice.value}
                      onClick={() => updateOption(key, choice.value)}
                    >
                      {options[key] === choice.value && <FaCheck />}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <footer className="avatar-creator-footer">
          <button
            type="button"
            className="avatar-cancel-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="avatar-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Use this avatar"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default AvatarCreator;
