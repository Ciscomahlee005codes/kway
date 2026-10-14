// src/hooks/useLive.js
// Real data layer for Kway Live. Replaces all DUMMY_* data.
// Adjust the import path to wherever your Supabase client lives.
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabase";

const STREAM_SELECT = "*, host:profiles!live_streams_host_id_fkey(id, username, avatar_url)";

/* ---------- Live feed (Live.jsx) ---------- */
export function useLiveStreams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from("live_streams")
        .select(STREAM_SELECT)
        .eq("status", "live")
        .order("started_at", { ascending: false });
      if (queryError) throw queryError;
      setStreams(data ?? []);
      setError("");
    } catch (queryError) {
      setError(queryError.message || "Couldn't load live streams. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel("live-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, refetch)
      .subscribe();
    const refreshInterval = setInterval(refetch, 15000);
    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { streams, loading, error, refetch };
}

/* ---------- Start / end a stream ---------- */
export async function startStream({ title, category }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before starting a live stream.");
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      host_id: user.id,
      title: title.trim(),
      category,
      status: "live",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  // TODO (video provider): call an Edge Function here, e.g.
  // supabase.functions.invoke("create-live-channel", { body: { streamId: data.id } })
  // It creates the channel at your provider, saves ingest creds in live_stream_secrets,
  // and writes playback_url back to live_streams.
  return data;
}

export async function endStream(streamId) {
  await supabase
    .from("live_streams")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", streamId);
  // TODO: Edge Function to stop/delete the provider channel.
}

/* ---------- Chat (persisted, realtime) ---------- */
export function useLiveChat(streamId) {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const profileCache = useRef({});

  const getProfile = useCallback(async (userId) => {
    if (profileCache.current[userId]) return profileCache.current[userId];
    const { data } = await supabase
      .from("profiles").select("id, username, avatar_url").eq("id", userId).single();
    profileCache.current[userId] = data;
    return data;
  }, []);

  useEffect(() => {
    if (!streamId) return;
    let active = true;

    const loadMessages = async () => {
      const { data, error: queryError } = await supabase
        .from("live_messages")
        .select("id, body, created_at, user_id, profiles(username, avatar_url)")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!active) return;
      if (queryError) {
        setError(queryError.message || "Couldn't load live chat. Try again.");
        return;
      }
      const loadedMessages = data.reverse();
      setMessages((previous) => {
        if (
          previous.length === loadedMessages.length &&
          previous.every((message, index) => message.id === loadedMessages[index].id)
        ) return previous;
        return loadedMessages;
      });
      setError("");
    };

    loadMessages();

    const channel = supabase
      .channel(`chat:${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages", filter: `stream_id=eq.${streamId}` },
        async (payload) => {
          const profile = await getProfile(payload.new.user_id);
          if (!active) return;
          setMessages((prev) => [
            ...prev.filter((message) => message.id !== payload.new.id).slice(-100),
            { ...payload.new, profiles: profile },
          ]);
        }
      )
      .subscribe();

    const refreshInterval = setInterval(loadMessages, 5000);
    return () => {
      active = false;
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [streamId, getProfile]);

  const send = useCallback(async (body) => {
    const text = body.trim();
    if (!text) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in to join the live chat.");
    const { error } = await supabase
      .from("live_messages")
      .insert({ stream_id: streamId, user_id: user.id, body: text });
    if (error) throw error;
  }, [streamId]);

  return { messages, error, send };
}

/* ---------- Viewer count + reactions (ephemeral: Presence + Broadcast) ---------- */
// Not stored in the database on purpose: it's high-frequency and disposable.
export function useLiveRoom(streamId, { isHost = false } = {}) {
  const [viewers, setViewers] = useState(0);
  const [reactions, setReactions] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;
    let channel;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) return;
      channel = supabase.channel(`room:${streamId}`, {
        config: { presence: { key: user.id }, broadcast: { self: false } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          // Don't count the host as a viewer
          const count = Object.values(state).flat().filter((p) => !p.isHost).length;
          setViewers(count);
        })
        .on("broadcast", { event: "reaction" }, ({ payload }) => {
          const id = `${Date.now()}-${Math.random()}`;
          setReactions((prev) => [...prev, { id, emoji: payload.emoji, left: Math.random() * 80 + 5 }]);
          setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 3000);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") await channel.track({ isHost, at: Date.now() });
        });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [streamId, isHost]);

  const sendReaction = useCallback((emoji) => {
    channelRef.current?.send({ type: "broadcast", event: "reaction", payload: { emoji } });
  }, []);

  return { viewers, reactions, sendReaction };
}

/* ---------- Live camera/audio transport (WebRTC + Supabase signaling) ---------- */
const LIVE_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const getLiveIceServers = () => {
  const configuredServers = import.meta.env.VITE_LIVE_ICE_SERVERS;
  if (!configuredServers) return LIVE_ICE_SERVERS;
  const servers = JSON.parse(configuredServers);
  if (!Array.isArray(servers) || servers.length === 0) {
    throw new Error("VITE_LIVE_ICE_SERVERS must be a non-empty JSON array.");
  }
  return servers;
};

const makePeerId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useLiveBroadcast(streamId, { isHost = false, localStream = null } = {}) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState(isHost ? "starting" : "connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!streamId || typeof RTCPeerConnection === "undefined") {
      setStatus("unavailable");
      setError("Live video isn't supported by this browser.");
      return undefined;
    }

    let active = true;
    let channel;
    let hostId = "";
    let viewerId = "";
    let peerConnection;
    let joinSentTo = "";
    let pendingHostCandidates = [];
    const hostConnections = new Map();
    const pendingViewerCandidates = new Map();
    let iceServers;

    try {
      iceServers = getLiveIceServers();
    } catch (configurationError) {
      setStatus("unavailable");
      setError(configurationError.message || "The live video ICE server configuration is invalid.");
      return undefined;
    }

    const setLiveError = (message) => {
      if (!active) return;
      setError(message);
      setStatus("error");
    };

    const sendSignal = async (payload) => {
      if (!channel || !active) return;
      const result = await channel.send({
        type: "broadcast",
        event: "signal",
        payload,
      });
      if (result !== "ok" && active) {
        throw new Error("Unable to connect to the live video signaling service.");
      }
    };

    const createConnection = (peerId, targetId, stream) => {
      const connection = new RTCPeerConnection({ iceServers });
      if (!isHost) {
        connection.ontrack = (event) => {
          if (!active) return;
          const [incomingStream] = event.streams;
          if (incomingStream) {
            setRemoteStream(incomingStream);
          } else {
            setRemoteStream((currentStream) => {
              const nextStream = currentStream || new MediaStream();
              nextStream.addTrack(event.track);
              return nextStream;
            });
          }
          setError("");
          setStatus("live");
        };
      }
      connection.onicecandidate = ({ candidate }) => {
        if (!candidate || !active) return;
        sendSignal({
          kind: "candidate",
          from: peerId,
          to: targetId,
          candidate: candidate.toJSON(),
        }).catch((sendError) => setLiveError(sendError.message));
      };
      connection.onconnectionstatechange = () => {
        if (!active) return;
        if (connection.connectionState === "failed") {
          setLiveError("Couldn't connect to the live video. The network may require a TURN relay.");
        } else if (!isHost && connection.connectionState === "connected") {
          setError("");
          setStatus("live");
        } else if (!isHost && connection.connectionState === "disconnected") {
          setStatus("connecting");
        }
      };
      if (stream) stream.getTracks().forEach((track) => connection.addTrack(track, stream));
      return connection;
    };

    const handleHostSignal = async (payload) => {
      if (payload.kind === "join" && payload.to === hostId && payload.from) {
        let connection = hostConnections.get(payload.from);
        if (connection) return;
        if (!localStream) {
          await sendSignal({
            kind: "unavailable",
            from: hostId,
            to: payload.from,
          });
          return;
        }

        connection = createConnection(hostId, payload.from, localStream);
        hostConnections.set(payload.from, connection);
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        await sendSignal({
          kind: "offer",
          from: hostId,
          to: payload.from,
          description: connection.localDescription,
        });
        return;
      }

      if (payload.to !== hostId || !payload.from) return;
      const connection = hostConnections.get(payload.from);
      if (!connection) return;

      if (payload.kind === "answer") {
        await connection.setRemoteDescription(payload.description);
        const queuedCandidates = pendingViewerCandidates.get(payload.from) || [];
        pendingViewerCandidates.delete(payload.from);
        await Promise.all(queuedCandidates.map((candidate) => connection.addIceCandidate(candidate)));
      } else if (payload.kind === "candidate") {
        if (connection.remoteDescription) {
          await connection.addIceCandidate(payload.candidate);
        } else {
          const queuedCandidates = pendingViewerCandidates.get(payload.from) || [];
          queuedCandidates.push(payload.candidate);
          pendingViewerCandidates.set(payload.from, queuedCandidates);
        }
      } else if (payload.kind === "leave") {
        connection.close();
        hostConnections.delete(payload.from);
        pendingViewerCandidates.delete(payload.from);
      }
    };

    const handleViewerSignal = async (payload) => {
      if (payload.to !== viewerId) return;
      if (payload.kind === "unavailable") {
        setLiveError("The streamer’s camera or microphone isn't available.");
        return;
      }
      if (payload.kind === "offer") {
        hostId = payload.from;
        if (!peerConnection) peerConnection = createConnection(viewerId, hostId);
        await peerConnection.setRemoteDescription(payload.description);
        const queuedCandidates = pendingHostCandidates;
        pendingHostCandidates = [];
        await Promise.all(queuedCandidates.map((candidate) => peerConnection.addIceCandidate(candidate)));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await sendSignal({
          kind: "answer",
          from: viewerId,
          to: hostId,
          description: peerConnection.localDescription,
        });
        return;
      }
      if (payload.kind === "candidate" && payload.from === hostId) {
        if (peerConnection?.remoteDescription) {
          await peerConnection.addIceCandidate(payload.candidate);
        } else {
          pendingHostCandidates.push(payload.candidate);
        }
      }
    };

    const connectToHost = () => {
      if (!hostId || !viewerId || joinSentTo === hostId || !channel) return;
      joinSentTo = hostId;
      setError("");
      setStatus("connecting");
      sendSignal({ kind: "join", from: viewerId, to: hostId }).catch((sendError) => {
        joinSentTo = "";
        setLiveError(sendError.message);
      });
    };

    const handlePresenceSync = () => {
      const presence = channel.presenceState();
      const hostEntry = Object.values(presence)
        .flat()
        .find((entry) => entry.role === "host");
      if (!isHost) {
        const nextHostId = hostEntry?.peerId || "";
        if (hostId && hostId !== nextHostId) {
          peerConnection?.close();
          peerConnection = null;
          setRemoteStream(null);
          setStatus("connecting");
          joinSentTo = "";
        }
        hostId = nextHostId;
        if (hostId) connectToHost();
        else if (active) setStatus("waiting");
      }
    };

    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setLiveError("Sign in to watch live video.");
        return;
      }

      viewerId = isHost ? `host-${user.id}-${makePeerId()}` : `viewer-${makePeerId()}`;
      channel = supabase.channel(`video:${streamId}`, {
        config: {
          presence: { key: viewerId },
          broadcast: { self: false },
        },
      });
      channel
        .on("presence", { event: "sync" }, handlePresenceSync)
        .on("broadcast", { event: "signal" }, async ({ payload }) => {
          try {
            if (isHost) await handleHostSignal(payload);
            else await handleViewerSignal(payload);
          } catch (signalError) {
            setLiveError(signalError.message || "Couldn't establish the live video connection.");
          }
        })
        .subscribe(async (subscriptionStatus) => {
          if (subscriptionStatus === "SUBSCRIBED") {
            try {
              await channel.track({
                role: isHost ? "host" : "viewer",
                peerId: viewerId,
                available: isHost ? Boolean(localStream) : true,
              });
              if (active && isHost) setStatus(localStream ? "live" : "waiting");
              if (active && !isHost) handlePresenceSync();
            } catch (trackError) {
              setLiveError(trackError.message || "Couldn't join the live video room.");
            }
          } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(subscriptionStatus)) {
            setLiveError("Couldn't join the live video room. Check your connection and try again.");
          }
        });
    };

    start().catch((startError) => {
      setLiveError(startError.message || "Couldn't start the live video connection.");
    });

    return () => {
      active = false;
      if (isHost) {
        hostConnections.forEach((connection) => connection.close());
        hostConnections.clear();
      } else {
        peerConnection?.close();
        if (hostId && viewerId && channel) {
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { kind: "leave", from: viewerId, to: hostId },
          });
        }
      }
      if (channel) supabase.removeChannel(channel);
    };
  }, [streamId, isHost, localStream]);

  return { remoteStream, status, error };
}