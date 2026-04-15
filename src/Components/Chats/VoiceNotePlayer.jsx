import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import "./VoiceNotePlayer.css";
import { FaPlay, FaPause } from "react-icons/fa";

const VoiceNotePlayer = ({ audioUrl, isSender }) => {

  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {

    if (!waveformRef.current) return;

    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isSender ? "#ffffff66" : "#4ade80",
      progressColor: isSender ? "#ffffff" : "#16a34a",
      cursorWidth: 0,
      height: 40,
      barWidth: 3,
      barGap: 2,
      responsive: true
    });

    waveSurferRef.current = waveSurfer;

    waveSurfer.load(audioUrl);

    waveSurfer.on("finish", () => {
      setPlaying(false);
    });

    waveSurfer.on("ready", () => {

      const totalSeconds = waveSurfer.getDuration();

      const mins = Math.floor(totalSeconds / 60);

      const secs = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");

      setDuration(`${mins}:${secs}`);

    });

    return () => {

      waveSurfer.destroy();

    };

  }, [audioUrl, isSender]);

  const togglePlayback = () => {

    if (!waveSurferRef.current) return;

    waveSurferRef.current.playPause();

    setPlaying(prev => !prev);

  };

  return (
    <div className={`voice-player ${isSender ? "sent" : ""}`}>

      <button
        className="voice-play-btn"
        onClick={togglePlayback}
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>

      <span className="voice-duration">
        {duration}
      </span>

      <div
        ref={waveformRef}
        className="waveform"
      />
    </div>
  );
};

export default VoiceNotePlayer;