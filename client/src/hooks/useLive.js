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