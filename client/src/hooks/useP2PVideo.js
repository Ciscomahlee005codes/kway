// src/hooks/useP2PVideo.js
// Real live video with WebRTC, using Supabase Realtime only for signaling.
// Good for testing and small audiences (host uploads one stream PER viewer).
// For a real audience, swap this for a media server (LiveKit / IVS) later.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust path

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
// Many Nigerian mobile networks block direct peer connections and need a TURN relay.
// Add one in your .env, then restart Vite:
// VITE_TURN_URL=turn:your.turn.server:3478  VITE_TURN_USER=...  VITE_TURN_PASS=...
if (import.meta.env.VITE_TURN_URL) {
  iceServers.push({
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USER,
    credential: import.meta.env.VITE_TURN_PASS,
  });
}
const RTC_CONFIG = { iceServers };

// Wait until all network candidates are inside the SDP, so we send ONE message
// instead of a burst of ICE messages (Realtime rate-limits bursts and drops them).
const waitForIce = (pc, ms = 4000) =>
  new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const done = () => {
      pc.removeEventListener("icegatheringstatechange", check);
      clearTimeout(timer);
      resolve();
    };
    const check = () => pc.iceGatheringState === "complete" && done();
    const timer = setTimeout(done, ms);
    pc.addEventListener("icegatheringstatechange", check);
  });

/* ---------------- HOST: sends camera to each viewer who joins ---------------- */
export function usePeerHost(streamId, getStream) {
  useEffect(() => {
    if (!streamId) return;
    const peers = new Map(); // viewerId -> { pc, sid }
    let queue = Promise.resolve(); // handle signals one at a time, in order
    const channel = supabase.channel(`rtc:${streamId}`);
    const send = (payload) => channel.send({ type: "broadcast", event: "sig", payload });

    const handle = async (p) => {
      if (p.to !== "host") return;
      const viewerId = p.from;

      if (p.type === "join") {
        const stream = getStream();
        if (!stream) return; // camera not ready yet; viewer keeps retrying

        const existing = peers.get(viewerId);
        if (
          existing &&
          existing.sid === p.sid &&
          !["failed", "closed"].includes(existing.pc.connectionState)
        ) {
          // Same session asking again: our offer may have been lost, so resend it
          if (existing.pc.signalingState === "have-local-offer" && existing.pc.localDescription) {
            send({ type: "offer", to: viewerId, from: "host", sid: p.sid, sdp: existing.pc.localDescription });
          }
          return;
        }
        existing?.pc.close();

        const pc = new RTCPeerConnection(RTC_CONFIG);
        peers.set(viewerId, { pc, sid: p.sid });
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "failed" || pc.connectionState === "closed") pc.close();
        };

        await pc.setLocalDescription(await pc.createOffer());
        await waitForIce(pc);
        send({ type: "offer", to: viewerId, from: "host", sid: p.sid, sdp: pc.localDescription });
      } else if (p.type === "answer") {
        const existing = peers.get(viewerId);
        if (existing && existing.sid === p.sid && existing.pc.signalingState === "have-local-offer") {
          await existing.pc.setRemoteDescription(p.sdp);
        }
      }
    };

    channel
      .on("broadcast", { event: "sig" }, ({ payload }) => {
        queue = queue.then(() => handle(payload)).catch((e) => console.warn("host rtc:", e));
      })
      .subscribe();

    return () => {
      peers.forEach(({ pc }) => pc.close());
      supabase.removeChannel(channel);
    };
  }, [streamId, getStream]);
}

/* ---------------- VIEWER: receives the host's video ---------------- */
export function usePeerViewer(streamId) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("connecting"); // connecting | live
  const [slow, setSlow] = useState(false);
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!streamId) return;
    const myId = crypto.randomUUID();
    let sid = 0; // bumps whenever we need a fresh connection
    let pc = null;
    let connected = false;
    let queue = Promise.resolve();
    const channel = supabase.channel(`rtc:${streamId}`);
    const send = (payload) => channel.send({ type: "broadcast", event: "sig", payload });
    const join = () => send({ type: "join", to: "host", from: myId, sid });

    const handle = async (p) => {
      if (p.to !== myId || p.sid !== sid || p.type !== "offer") return;

      // Duplicate offer (host re-sent it): just re-send our answer
      if (pc && pc.remoteDescription?.sdp === p.sdp.sdp) {
        if (pc.localDescription) {
          send({ type: "answer", to: "host", from: myId, sid, sdp: pc.localDescription });
        }
        return;
      }

      pc?.close();
      const conn = new RTCPeerConnection(RTC_CONFIG);
      pc = conn;
      setDetail("Host found, connecting...");

      conn.ontrack = (e) => setRemoteStream(e.streams[0]);
      conn.onconnectionstatechange = () => {
        const s = conn.connectionState;
        if (s === "connected") {
          connected = true;
          setStatus("live");
          setSlow(false);
          setDetail("");
        } else if (s === "disconnected") {
          setStatus("connecting");
        } else if (s === "failed") {
          connected = false;
          setStatus("connecting");
          setDetail("Your network blocked the direct connection. A TURN relay server is needed.");
          conn.close();
          if (pc === conn) pc = null;
          sid += 1; // next retry builds a brand-new connection
        }
      };

      await conn.setRemoteDescription(p.sdp);
      await conn.setLocalDescription(await conn.createAnswer());
      await waitForIce(conn);
      send({ type: "answer", to: "host", from: myId, sid, sdp: conn.localDescription });
    };

    channel
      .on("broadcast", { event: "sig" }, ({ payload }) => {
        queue = queue.then(() => handle(payload)).catch((e) => console.warn("viewer rtc:", e));
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") {
          setDetail("Asking the host for the stream...");
          join();
        }
      });

    // Keep asking until connected (host camera may still be starting)
    const retry = setInterval(() => { if (!connected) join(); }, 4000);
    const slowTimer = setTimeout(() => { if (!connected) setSlow(true); }, 15000);

    return () => {
      clearInterval(retry);
      clearTimeout(slowTimer);
      pc?.close();
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return { remoteStream, status, slow, detail };
}