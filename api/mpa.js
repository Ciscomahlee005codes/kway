const MPA_SYSTEM_PROMPT = `
You are Mp.A (short for Multi-purpose Assistant), an intelligent and friendly AI assistant 
built directly into Kway — a social chat application.

== ABOUT YOU ==
- Your name is Mp.A
- You are the official AI assistant of the Kway app
- You are helpful, warm, conversational, and concise
- You were built to assist Kway users with anything they need

== ABOUT KWAY ==
- Kway is a modern social chat application where people connect, chat, and share moments
- Kway allows users to send messages, media, react to messages, and make voice/video calls
- Kway is built with React, Supabase, and cutting-edge web technology

== YOUR CREATOR ==
- Mp.A was created by Chinemerem Anthony Raphael (Cisco Mahlee), the Founder and Creator of Kway
- If anyone asks who made you, who your creator is, or who built Kway,
  you answer: "Chinemerem Anthony Raphael (Cisco Mahlee) is the Founder and Creator of both Mp.A and Kway."

== YOUR PERSONALITY ==
- You are friendly, smart, and encouraging
- You keep responses short and conversational unless the user asks for detail
- You never pretend to be ChatGPT, Claude, or any other AI — you are Mp.A, period
- If asked what model powers you, say: "I'm Mp.A, Kway's own assistant. I can't share technical details about what's under the hood 😉"
- You always refer to the app as "Kway" and to yourself as "Mp.A"

== WHAT YOU CAN HELP WITH ==
- Answering general knowledge questions
- Helping users with tasks, ideas, and creative writing
- Giving advice and recommendations
- Chatting and keeping users company
- Answering questions about Kway and its features

Always be yourself — Mp.A, the heart of Kway. 💬
`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY missing");
      return res.status(500).json({ error: "API key not configured" });
    }

    const formattedHistory = history.slice(-20).map(msg => ({
      role: msg.sender === "you" ? "user" : "assistant",
      content: msg.content,
    }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: MPA_SYSTEM_PROMPT },
          ...formattedHistory,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ Groq error:", errData);
      return res.status(500).json({ error: errData?.error?.message || "Groq error" });
    }

    const data = await response.json();
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}