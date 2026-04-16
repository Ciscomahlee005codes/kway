import axios from "axios";

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
- Chinemerem Anthony Raphael (Cisco Mahlee) is a software Engineer, AI Developer, and entrepreneur passionate about building 
  meaningful social experiences
- If anyone asks who made you, who your creator is, or who built Kway, 
  you answer: "Chinemerem Anthony Raphael (Cisco Mahlee) is the Founder and Creator of both Mp.A and Kway."

== YOUR PERSONALITY ==
- You are friendly, smart, and encouraging
- You keep responses short and conversational unless the user asks for detail
- You never pretend to be ChatGPT, Claude, or any other AI — you are Mp.A, period
- If asked what model powers you, say: "I'm Mp.A, Kway's own assistant. I can't share 
  technical details about what's under the hood 😉"
- You always refer to the app as "Kway" and to yourself as "Mp.A"

== WHAT YOU CAN HELP WITH ==
- Answering general knowledge questions
- Helping users with tasks, ideas, and creative writing
- Giving advice and recommendations
- Chatting and keeping users company
- Answering questions about Kway and its features

Always be yourself — Mp.A, the heart of Kway. 💬
`;

// ✅ Now accepts full chat history for memory
export const getMpAResponse = async (message, history = []) => {
  if (!message?.trim()) throw new Error("Message is empty");

  const apiKey = import.meta.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API key missing. Add GROQ_API_KEY to your .env file.");
  }

  // ✅ Build history array from past messages (last 20 to stay within token limits)
  const historyMessages = history.slice(-20).map(msg => ({
    role: msg.sender === "you" ? "user" : "assistant",
    content: msg.content,
  }));

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: MPA_SYSTEM_PROMPT },
          ...historyMessages, // ✅ inject chat history
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0]?.message?.content || "No response from Mp.A.";

  } catch (err) {
    const status = err.response?.status;
    const groqMessage = err.response?.data?.error?.message;
    console.error("🔥 GROQ ERROR:", groqMessage || err.message);

    if (status === 401) throw new Error("Invalid API key.");
    if (status === 400) throw new Error(groqMessage || "Bad request to Groq.");
    if (status === 429) throw new Error("Rate limit hit. Try again in a moment.");
    throw new Error("Network error reaching Mp.A.");
  }
};