import React from "react";
import "./PeopleCluster.css";
import Jeriq from "../../assets/jeriq-1.png";
import Yakub from "../../assets/yakub-1.png";
import Asake from "../../assets/asake-1.png";
// Drop any 3 photos (jpg / jpeg / png / webp) into src/assets/avatars/ and they are
// picked up automatically, sorted by file name. If fewer than 3 are found, the
// missing circles show a colourful initial instead, so the page never breaks.
const avatarFiles = import.meta.glob("../../assets/avatars/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});
const avatarSrcs = Object.keys(avatarFiles)
  .sort()
  .map((key) => avatarFiles[key]);

const PEOPLE = [
  { name: "Asake", initial: "A", image: Asake, slot: "left" },
  { name: "Jeriq", initial: "J", image: Jeriq, slot: "center", live: true },
  { name: "Yakub", initial: "Y", image: Yakub, slot: "right" },
];

const PeopleCluster = () => (
  <div className="pc-wrap" aria-hidden="true">
    <div className="pc-row">
      {PEOPLE.map((p, i) => (
        <div key={p.name} className={`pc-person pc-${p.slot}`}>
          <div className="pc-ring">
            {avatarSrcs[i] || p.image ? (
              <img src={avatarSrcs[i] || p.image} alt="" className="pc-img" draggable="false" />
            ) : (
              <span className="pc-fallback">{p.initial}</span>
            )}
            {p.live ? (
              <span className="pc-live">LIVE</span>
            ) : (
              <span className="pc-dot" />
            )}
          </div>
          <span className="pc-name">{p.name}</span>
        </div>
      ))}
    </div>
    <p className="pc-caption">Your people are already here.</p>
  </div>
);

export default PeopleCluster;