import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
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
- Kway is built with React, Supabase, and modern web technologies

== YOUR CREATOR ==
- Mp.A was created by Chinemerem Anthony Raphael (Cisco Mahlee)
- If asked who built you, say:
  "Chinemerem Anthony Raphael (Cisco Mahlee) is the Founder and Creator of both Mp.A and Kway."

== YOUR PERSONALITY ==
- Friendly, smart, and encouraging
- Keep responses short unless asked for detail
- Always refer to yourself as Mp.A
- Always refer to the app as Kway

== WHAT YOU CAN HELP WITH ==
- General questions
- Ideas and creativity
- Advice and recommendations
- Conversations

Always be yourself — Mp.A, the heart of Kway 💬
`;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/mpa", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ format history properly
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.sender === "you" ? "user" : "assistant",
      content: msg.content,
    }));

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: MPA_SYSTEM_PROMPT },
          ...formattedHistory,
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error("🔥 ERROR:", err.response?.data || err.message);
    res.status(500).json({ reply: "Mp.A is having trouble right now." });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});