// src/hooks/useLive.js
// Real data layer for Kway Live. Replaces all DUMMY_* data.
// Adjust the import path to wherever your Supabase client lives.
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabase";

const STREAM_SELECT = "*, host:profiles!live_streams_host_id_fkey(id, username, avatar_url)";
const LIVE_HEARTBEAT_TIMEOUT_MS = 30_000;

/* ---------- Live feed (Live.jsx) ---------- */
export function useLiveStreams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      const heartbeatCutoff = new Date(Date.now() - LIVE_HEARTBEAT_TIMEOUT_MS).toISOString();
      const { data, error: queryError } = await supabase
        .from("live_streams")
        .select(STREAM_SELECT)
        .eq("status", "live")
        .gte("heartbeat_at", heartbeatCutoff)
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
  const startedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      host_id: user.id,
      title: title.trim(),
      category,
      status: "live",
      started_at: startedAt,
      heartbeat_at: startedAt,
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
export function useLiveRoom(streamId, { isHost = false, hostId = null } = {}) {
  const [viewers, setViewers] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [joinStatus, setJoinStatus] = useState("idle");
  const channelRef = useRef(null);
  const userRef = useRef(null);
  const usernameRef = useRef("");
  const requestIdRef = useRef(null);

  const showGift = useCallback((gift) => {
    setGifts((previous) => {
      if (previous.some((item) => item.id === gift.id)) return previous;
      return [...previous.slice(-3), gift];
    });
    setTimeout(() => {
      setGifts((previous) => previous.filter((item) => item.id !== gift.id));
    }, 6500);
  }, []);

  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;
    let channel;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) return;
      userRef.current = user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      usernameRef.current =
        profile?.username || user.user_metadata?.username || user.user_metadata?.name || "Viewer";
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
        .on("broadcast", { event: "gift" }, ({ payload }) => {
          if (payload?.id && payload?.emoji && payload?.name) showGift(payload);
        })
        .on("broadcast", { event: "join_request" }, ({ payload }) => {
          if (!isHost || !payload?.id || !payload?.userId || payload.userId === user.id) return;
          setJoinRequests((previous) => {
            if (previous.some((request) => request.id === payload.id)) return previous;
            return [...previous, payload];
          });
        })
        .on("broadcast", { event: "join_response" }, ({ payload }) => {
          if (
            !isHost &&
            payload?.to === user.id &&
            payload?.id === requestIdRef.current &&
            payload.from === hostId
          ) {
            setJoinStatus(payload.accepted ? "accepted" : "declined");
          }
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
  }, [streamId, isHost, hostId, showGift]);

  const sendReaction = useCallback((emoji) => {
    channelRef.current?.send({ type: "broadcast", event: "reaction", payload: { emoji } });
  }, []);

  const sendGift = useCallback(async (gift) => {
    const user = userRef.current;
    const channel = channelRef.current;
    if (!user || !channel) throw new Error("Still connecting to the live room. Try again.");
    const payload = {
      id: makeLiveId(),
      emoji: gift.emoji,
      name: gift.name,
      from: user.id,
      username: usernameRef.current || "A viewer",
    };
    const result = await channel.send({ type: "broadcast", event: "gift", payload });
    if (result !== "ok") throw new Error("Couldn't send your gift. Please try again.");
    showGift(payload);
  }, [showGift]);

  const requestToJoin = useCallback(async () => {
    const user = userRef.current;
    const channel = channelRef.current;
    if (!user || !channel) throw new Error("Still connecting to the live room. Try again.");
    if (joinStatus === "pending") return;
    const requestId = makeLiveId();
    requestIdRef.current = requestId;
    setJoinStatus("pending");
    const result = await channel.send({
      type: "broadcast",
      event: "join_request",
      payload: {
        id: requestId,
        userId: user.id,
        username: usernameRef.current || "Viewer",
      },
    });
    if (result !== "ok") {
      requestIdRef.current = null;
      setJoinStatus("idle");
      throw new Error("Couldn't send your request. Please try again.");
    }
  }, [joinStatus]);

  const respondToJoin = useCallback(async (request, accepted) => {
    const user = userRef.current;
    const channel = channelRef.current;
    if (!isHost || !user || !channel) throw new Error("Unable to respond to this request.");
    const result = await channel.send({
      type: "broadcast",
      event: "join_response",
      payload: {
        id: request.id,
        to: request.userId,
        from: user.id,
        accepted,
      },
    });
    if (result !== "ok") throw new Error("Couldn't send the response. Please try again.");
    setJoinRequests((previous) => previous.filter((item) => item.id !== request.id));
  }, [isHost]);

  return {
    viewers,
    reactions,
    sendReaction,
    gifts,
    sendGift,
    joinRequests,
    joinStatus,
    requestToJoin,
    respondToJoin,
  };
}

/* ---------- Accepted live guests (two-way peer connection) ---------- */
export function useLiveGuests(streamId, { isHost = false, hostId = null } = {}) {
  const [guests, setGuests] = useState([]);
  const [guestStatus, setGuestStatus] = useState("idle");
  const [guestError, setGuestError] = useState("");
  const channelRef = useRef(null);
  const userRef = useRef(null);
  const usernameRef = useRef("Guest");
  const remoteHostRef = useRef(hostId);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const approvedRef = useRef(new Map());
  const retryIntervalRef = useRef(null);
  const joinTimeoutRef = useRef(null);

  useEffect(() => {
    if (!streamId || typeof RTCPeerConnection === "undefined") return undefined;
    let active = true;
    let channel;
    let localPeer;
    let localUser;
    let remoteUserId = "";
    let remoteUsername = "Guest";
    let pendingCandidates = [];

    const send = async (payload) => {
      if (!channel) throw new Error("The live guest connection isn't ready.");
      const result = await channel.send({
        type: "broadcast",
        event: "guest_signal",
        payload: { streamId, ...payload },
      });
      if (result !== "ok") throw new Error("Couldn't signal the live guest connection.");
    };

    const stopLocalMedia = () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };

    const updateGuest = (userId, updates) => {
      setGuests((previous) => {
        const index = previous.findIndex((guest) => guest.userId === userId);
        if (index < 0) return previous;
        return previous.map((guest, itemIndex) =>
          itemIndex === index ? { ...guest, ...updates } : guest
        );
      });
    };

    const closeGuest = (userId, notify = false) => {
      const connection = isHost
        ? approvedRef.current.get(userId)?.connection
        : peerRef.current;
      if (notify) send({ kind: "guest_end", from: localUser?.id, to: userId });
      connection?.close();
      if (isHost) approvedRef.current.delete(userId);
      else {
        peerRef.current = null;
        stopLocalMedia();
        clearInterval(retryIntervalRef.current);
        clearTimeout(joinTimeoutRef.current);
        retryIntervalRef.current = null;
        joinTimeoutRef.current = null;
        setGuestStatus("ended");
      }
      if (isHost) {
        setGuests((previous) => previous.filter((guest) => guest.userId !== userId));
      }
    };

    const createHostConnection = async (payload) => {
      if (!isHost || !approvedRef.current.has(payload.from)) return;
      const accepted = approvedRef.current.get(payload.from);
      if (accepted.connection && accepted.connection.connectionState !== "closed") {
        if (accepted.connection.localDescription?.type === "offer") {
          await send({
            kind: "guest_offer",
            from: localUser.id,
            to: payload.from,
            description: accepted.connection.localDescription,
          });
        }
        return;
      }

      remoteUserId = payload.from;
      remoteUsername = payload.username || accepted.username || "Guest";
      const connection = new RTCPeerConnection({ iceServers: getLiveIceServers() });
      accepted.connection = connection;
      peerRef.current = connection;
      connection.ontrack = (event) => {
        if (!active) return;
        const stream = event.streams[0] || new MediaStream([event.track]);
        setGuests((previous) => previous.map((guest) =>
          guest.userId === payload.from ? { ...guest, stream, status: "connected" } : guest
        ));
      };
      connection.onicecandidate = ({ candidate }) => {
        if (candidate && active) {
          send({
            kind: "guest_candidate",
            from: localUser.id,
            to: payload.from,
            candidate: candidate.toJSON(),
          }).catch((error) => {
            console.error("Live guest ICE signaling error:", error);
            updateGuest(payload.from, { status: "error" });
          });
        }
      };
      connection.onconnectionstatechange = () => {
        if (!active) return;
        if (connection.connectionState === "failed") {
          updateGuest(payload.from, { status: "error" });
        } else if (connection.connectionState === "connected") {
          updateGuest(payload.from, { status: "connected" });
        } else if (connection.connectionState === "disconnected") {
          updateGuest(payload.from, { status: "reconnecting" });
        }
      };

      connection.addTransceiver("video", { direction: "recvonly" });
      connection.addTransceiver("audio", { direction: "recvonly" });
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await send({
        kind: "guest_offer",
        from: localUser.id,
        to: payload.from,
        description: connection.localDescription,
      });
      setGuests((previous) => {
        const existing = previous.find((guest) => guest.userId === payload.from);
        if (existing) return previous.map((guest) => guest.userId === payload.from
          ? { ...guest, status: "connecting" }
          : guest);
        return [...previous, { userId: payload.from, username: remoteUsername, stream: null, status: "connecting" }];
      });
    };

    const handleSignal = async (payload) => {
      if (!active || payload.streamId !== streamId) return;

      if (isHost) {
        if (payload.kind === "guest_join" && approvedRef.current.has(payload.from)) {
          await createHostConnection(payload);
          return;
        }
        if (payload.to !== localUser?.id || !payload.from) return;
        const accepted = approvedRef.current.get(payload.from);
        const connection = accepted?.connection;
        if (!connection) return;
        if (payload.kind === "guest_answer") {
          if (connection.signalingState !== "have-local-offer") return;
          await connection.setRemoteDescription(payload.description);
          const candidates = accepted.pendingCandidates || [];
          accepted.pendingCandidates = [];
          await Promise.all(candidates.map((candidate) => connection.addIceCandidate(candidate)));
        } else if (payload.kind === "guest_candidate") {
          if (connection.remoteDescription) await connection.addIceCandidate(payload.candidate);
          else accepted.pendingCandidates.push(payload.candidate);
        } else if (payload.kind === "guest_end") {
          closeGuest(payload.from);
        }
        return;
      }

      if (payload.to !== localUser?.id || payload.from !== remoteUserId && payload.kind !== "guest_offer") return;
      if (payload.kind === "guest_offer") {
        if (peerRef.current?.remoteDescription?.sdp === payload.description.sdp) {
          if (peerRef.current.localDescription) {
            await send({
              kind: "guest_answer",
              from: localUser.id,
              to: remoteUserId,
              description: peerRef.current.localDescription,
            });
          }
          return;
        }
        peerRef.current?.close();
        remoteUserId = payload.from;
        const connection = new RTCPeerConnection({ iceServers: getLiveIceServers() });
        peerRef.current = connection;
        connection.ontrack = (event) => {
          if (!active) return;
          setGuestStatus("connected");
        };
        connection.onicecandidate = ({ candidate }) => {
          if (candidate && active) {
            send({
              kind: "guest_candidate",
              from: localUser.id,
              to: remoteUserId,
              candidate: candidate.toJSON(),
            }).catch((error) => {
              console.error("Live guest ICE signaling error:", error);
              setGuestStatus("error");
              setGuestError(error.message || "Couldn't connect to the host.");
            });
          }
        };
        connection.onconnectionstatechange = () => {
          if (!active) return;
          if (connection.connectionState === "failed") {
            clearInterval(retryIntervalRef.current);
            clearTimeout(joinTimeoutRef.current);
            retryIntervalRef.current = null;
            joinTimeoutRef.current = null;
            stopLocalMedia();
            connection.close();
            if (peerRef.current === connection) peerRef.current = null;
            setGuestStatus("error");
            setGuestError("Couldn't connect your camera and microphone to the live.");
          } else if (connection.connectionState === "connected") {
            clearInterval(retryIntervalRef.current);
            clearTimeout(joinTimeoutRef.current);
            retryIntervalRef.current = null;
            joinTimeoutRef.current = null;
            setGuestStatus("connected");
            setGuestError("");
          }
        };
        localStreamRef.current?.getTracks().forEach((track) =>
          connection.addTrack(track, localStreamRef.current)
        );
        await connection.setRemoteDescription(payload.description);
        const candidates = pendingCandidates;
        pendingCandidates = [];
        await Promise.all(candidates.map((candidate) => connection.addIceCandidate(candidate)));
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        await send({
          kind: "guest_answer",
          from: localUser.id,
          to: remoteUserId,
          description: connection.localDescription,
        });
      } else if (payload.kind === "guest_candidate") {
        if (peerRef.current?.remoteDescription) {
          await peerRef.current.addIceCandidate(payload.candidate);
        } else {
          pendingCandidates.push(payload.candidate);
        }
      } else if (payload.kind === "guest_end") {
        closeGuest(localUser.id);
      }
    };

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;
      localUser = user;
      userRef.current = user;
      remoteHostRef.current = hostId;
      remoteUserId = hostId || "";
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      usernameRef.current =
        profile?.username || user.user_metadata?.username || user.user_metadata?.name || "Guest";
      localPeer = `guest-${user.id}-${makeLiveId()}`;
      channel = supabase.channel(`live-guests:${streamId}`, {
        config: { presence: { key: localPeer }, broadcast: { self: false } },
      });
      channel.on("broadcast", { event: "guest_signal" }, ({ payload }) => {
        handleSignal(payload).catch((error) => {
          console.error("Live guest signaling error:", error);
          if (!isHost) {
            setGuestStatus("error");
            setGuestError(error.message || "Couldn't connect to the live.");
          } else if (payload?.from) {
            updateGuest(payload.from, { status: "error" });
          }
        });
      });
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") channelRef.current = channel;
      });
    })().catch((error) => {
      console.error("Live guest channel error:", error);
      if (!isHost) {
        setGuestStatus("error");
        setGuestError(error.message || "Couldn't join the live room.");
      }
    });

    return () => {
      active = false;
      if (isHost) approvedRef.current.forEach(({ connection }) => connection?.close());
      else peerRef.current?.close();
      clearInterval(retryIntervalRef.current);
      clearTimeout(joinTimeoutRef.current);
      stopLocalMedia();
      if (channel) supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [streamId, isHost, hostId]);

  const approveGuest = useCallback((userId, username) => {
    approvedRef.current.set(userId, {
      username: username || "Guest",
      connection: null,
      pendingCandidates: [],
    });
    setGuests((previous) => previous.some((guest) => guest.userId === userId)
      ? previous
      : [...previous, { userId, username: username || "Guest", stream: null, status: "waiting" }]);
  }, []);

  const removeGuest = useCallback(async (userId) => {
    const connection = approvedRef.current.get(userId)?.connection;
    const channel = channelRef.current;
    if (channel) {
      try {
        const result = await channel.send({
          type: "broadcast",
          event: "guest_signal",
          payload: { streamId, kind: "guest_end", from: userRef.current?.id, to: userId },
        });
        if (result !== "ok") throw new Error("Couldn't notify the guest that they were removed.");
      } catch (error) {
        console.error("Live guest removal signal failed:", error);
      }
    }
    connection?.close();
    approvedRef.current.delete(userId);
    setGuests((previous) => previous.filter((guest) => guest.userId !== userId));
  }, [streamId]);

  const startGuest = useCallback(async () => {
    if (guestStatus === "connecting" || guestStatus === "connected") return;
    const channel = channelRef.current;
    const user = userRef.current;
    if (!channel || !user) throw new Error("Still connecting to the live room. Try again.");
    setGuestError("");
    setGuestStatus("requesting-media");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser doesn't support camera and microphone access.");
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      localStreamRef.current = media;
      setGuestStatus("connecting");
      const result = await channel.send({
        type: "broadcast",
        event: "guest_signal",
        payload: {
          streamId,
          kind: "guest_join",
          from: user.id,
          username: usernameRef.current,
        },
      });
      if (result !== "ok") throw new Error("Couldn't connect to the host. Please try again.");
      retryIntervalRef.current = setInterval(() => {
        if (peerRef.current || !channelRef.current) {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
          return;
        }
        channelRef.current.send({
          type: "broadcast",
          event: "guest_signal",
          payload: {
            streamId,
            kind: "guest_join",
            from: user.id,
            username: usernameRef.current,
          },
        }).catch((error) => {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
          setGuestStatus("error");
          setGuestError(error.message || "Couldn't reach the host.");
        });
      }, 3000);
      joinTimeoutRef.current = setTimeout(() => {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
        joinTimeoutRef.current = null;
        if (!peerRef.current && channelRef.current) {
          localStreamRef.current?.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
          setGuestStatus("error");
          setGuestError("The host isn't responding yet. You can try joining again.");
        }
      }, 20000);
    } catch (error) {
      clearInterval(retryIntervalRef.current);
      clearTimeout(joinTimeoutRef.current);
      retryIntervalRef.current = null;
      joinTimeoutRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setGuestStatus("accepted");
      setGuestError(error.message || "Camera and microphone access is required to join.");
      throw error;
    }
  }, [guestStatus, streamId]);

  const stopGuest = useCallback(async () => {
    const channel = channelRef.current;
    const user = userRef.current;
    clearInterval(retryIntervalRef.current);
    clearTimeout(joinTimeoutRef.current);
    retryIntervalRef.current = null;
    joinTimeoutRef.current = null;
    if (channel && user) {
      try {
        await channel.send({
          type: "broadcast",
          event: "guest_signal",
          payload: { streamId, kind: "guest_end", from: user.id, to: remoteHostRef.current },
        });
      } catch (error) {
        console.warn("Couldn't notify the host that the guest left:", error);
      }
    }
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setGuestStatus("ended");
  }, [streamId]);

  const setGuestTrackEnabled = useCallback((kind, enabled) => {
    const tracks = kind === "audio"
      ? localStreamRef.current?.getAudioTracks()
      : localStreamRef.current?.getVideoTracks();
    tracks?.forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  const resetGuest = useCallback(() => {
    if (peerRef.current || localStreamRef.current) return;
    setGuestStatus("idle");
    setGuestError("");
  }, []);

  return {
    guests,
    guestStatus,
    guestError,
    localGuestStream: localStreamRef.current,
    approveGuest,
    removeGuest,
    startGuest,
    stopGuest,
    setGuestTrackEnabled,
    resetGuest,
  };
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

const makeLiveId = () =>
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