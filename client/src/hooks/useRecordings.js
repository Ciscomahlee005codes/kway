// src/hooks/useRecordings.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";

const BUCKET = "live-recordings";

const withUrl = (r) => ({
  ...r,
  url: supabase.storage.from(BUCKET).getPublicUrl(r.video_path).data.publicUrl,
});

/** Upload the recorded blob and create the database row. Throws on failure. */
export async function saveRecording({ streamId, blob, title, category, duration, peakViewers }) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const path = `${user.id}/${streamId}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (upErr) throw upErr;

  const { error: dbErr } = await supabase.from("live_recordings").insert({
    stream_id: streamId,
    host_id: user.id,
    title,
    category,
    video_path: path,
    duration_seconds: duration,
    peak_viewers: peakViewers,
    size_bytes: blob.size,
  });
  if (dbErr) {
    await supabase.storage.from(BUCKET).remove([path]); // don't leave orphan files
    throw dbErr;
  }
}

export async function deleteRecording(rec) {
  await supabase.storage.from(BUCKET).remove([rec.video_path]);
  const { error } = await supabase.from("live_recordings").delete().eq("id", rec.id);
  if (error) throw error;
}

/** The current user's saved videos, newest first. */
export function useSavedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("live_recordings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setVideos((data ?? []).map(withUrl));
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const remove = useCallback(async (rec) => {
    await deleteRecording(rec);
    setVideos((prev) => prev.filter((v) => v.id !== rec.id));
  }, []);

  return { videos, loading, refetch, remove };
}