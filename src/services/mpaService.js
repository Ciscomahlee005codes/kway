
// ✅ Now accepts full chat history for memory
export const getMpAResponse = async (message, history = []) => {
  if (!message?.trim()) {
    throw new Error("Message is empty");
  }

  const res = await fetch("/api/mpa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
    }),
  });

  if (!res.ok) {
    throw new Error("Mp.A failed to respond");
  }

  const data = await res.json();

  return data.choices?.[0]?.message?.content || "No response from Mp.A.";
};