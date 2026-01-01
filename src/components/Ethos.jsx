import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TodoContext } from "../TodoContext";

const STORAGE_KEY = "ethos.chat.v1";
const STORAGE_SUMMARY_KEY = "ethos.summary.v1";
const STORAGE_LAST_ACTIVE_KEY = "ethos.lastActiveAt.v1";

const CONTEXT_WINDOW_MS = 20 * 60 * 1000; // 20 minutes (model context)
const AUTO_CLEAR_IF_INACTIVE_MS = 30 * 60 * 1000; // 30 minutes (auto-clear rule)

const now = () => Date.now();

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadPersistedMessages() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEY), []);
}

function savePersistedMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, String(now()));
}

function loadPersistedSummary() {
  return localStorage.getItem(STORAGE_SUMMARY_KEY) || "";
}

function savePersistedSummary(summary) {
  localStorage.setItem(STORAGE_SUMMARY_KEY, summary || "");
  localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, String(now()));
}

function clearPersistedChat() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_SUMMARY_KEY);
  localStorage.removeItem(STORAGE_LAST_ACTIVE_KEY);
}

function maybeAutoClearByInactivity() {
  const last = Number(localStorage.getItem(STORAGE_LAST_ACTIVE_KEY) || "0");
  if (!last) return;
  if (now() - last > AUTO_CLEAR_IF_INACTIVE_MS) {
    clearPersistedChat();
  }
}

function extractJsonObject(text) {
  // Supports raw JSON or ```json ... ```
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? text.trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const slice = candidate.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function buildSystemPrompt() {
  return `
You are "Ethos", a helpful assistant embedded inside a React ToDo app.

Hard rules:
- Only answer about: (1) this website/app features, how the code works, localStorage persistence, or (2) study topics (school/college/coding), or (3) general knowledge.
- If the user asks anything outside these topics, refuse briefly and suggest a study/GK alternative.
- Always guide the user to the most helpful next step.
- You can manage the user's Today tasks by returning "actions" in JSON (see schema below).
- After every assistant reply, ALWAYS produce a conversation summary in at least 50–70 words (longer if needed for clarity).

App facts (use these when the user asks about the site):
- Global state lives in Todo Context provider: src/TodoContext.jsx.
- Persistence:
  - Today task boxes stored in localStorage key "TodayTaskBoxData"
  - Today tasks stored in localStorage key "TodayCheckBoxData"
  - Videos/Websites list stored in "TodoListData"
  - Calendar events stored in "calendarEvents"
  - Dark mode stored in "darkMode"
- Routes:
  - "/" and "/today" render Today
  - "/Calendar" renders Calendar
  - "/web/:site" renders WebViewer
- Sidebar search is in Left and writes to TodoContext.searchQuery; Today filters using it.

Action schema (return an array named "actions"):
Each action must be one of:
- { "type": "add_task_box", "title": string }
- { "type": "rename_task_box", "id": number, "title": string }
- { "type": "delete_task_box", "id": number }
- { "type": "add_task", "taskBoxId": number, "name": string }
- { "type": "rename_task", "taskId": number, "name": string }
- { "type": "toggle_task", "taskId": number }
- { "type": "delete_task", "taskId": number }

Output format (IMPORTANT):
Return ONLY a single JSON object with:
{
  "reply": "string",
  "actions": [ ... ],
  "summary": "string (>= 50–70 words; longer if needed)"
}

If no actions are needed, return "actions": [].
`.trim();
}

async function callGemini({ apiKey, systemPrompt, contentsText }) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: contentsText.map((c) => ({
        role: c.role, // "user" | "model"
        parts: [{ text: c.text }],
      })),
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 700,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ethos API error (${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ??
    "";
  return text;
}

const Ethos = () => {
  const {
    TodayTaskBox,
    setTodayTaskBox,
    TodayCheckBox,
    setTodayCheckBox,
  } = useContext(TodoContext);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState("");

  const [messages, setMessages] = useState(() => {
    maybeAutoClearByInactivity();
    const loaded = loadPersistedMessages();
    if (loaded.length) return loaded;

    // First boot greeting
    const first = [
      {
        id: crypto?.randomUUID?.() ?? String(now()),
        role: "assistant",
        content: "Heyy! myself Ethos AI. How can i help you today?",
        ts: now(),
      },
    ];
    savePersistedMessages(first);
    return first;
  });

  const listEndRef = useRef(null);

  useEffect(() => {
    setSummary(loadPersistedSummary());
  }, []);

  useEffect(() => {
    // keep "last active" fresh even if user just reads
    const bump = () => localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, String(now()));
    bump();

    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVis);

    const interval = setInterval(() => {
      maybeAutoClearByInactivity();
    }, 30 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // auto-scroll on new messages when open
    if (!open) return;
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const apiKey = import.meta.env.VITE_API_KEY;

  const contextForModel = useMemo(() => {
    const cutoff = now() - CONTEXT_WINDOW_MS;
    return messages.filter((m) => (m.ts ?? 0) >= cutoff);
  }, [messages]);

  function clearChat() {
    clearPersistedChat();

    const reset = [
      {
        id: crypto?.randomUUID?.() ?? String(now()),
        role: "assistant",
        content: "Heyy! myself Ethos AI. How can i help you today?",
        ts: now(),
      },
    ];
    setMessages(reset);
    setSummary("");
    savePersistedMessages(reset);
    savePersistedSummary("");
  }

  function getTodoSnapshotForPrompt() {
    // Keep it compact but useful for tool decisions.
    const boxes = (TodayTaskBox || []).map((b) => ({
      id: b.id,
      title: b.TaskBoxTitle,
    }));

    const tasks = (TodayCheckBox || [])
      .filter(Boolean)
      .slice(0, 250)
      .map((t) => ({
        id: t.id,
        taskBoxId: t.taskBoxId,
        name: t.TaskName,
        checked: !!t.checked,
      }));

    return { boxes, tasks, tasksTruncated: (TodayCheckBox || []).length > 250 };
  }

  function applyActions(actions) {
    const results = [];
    let nextBoxes = Array.isArray(TodayTaskBox) ? [...TodayTaskBox] : [];
    let nextTasks = Array.isArray(TodayCheckBox) ? [...TodayCheckBox] : [];

    const findBox = (id) => nextBoxes.find((b) => b.id === id);
    const findTask = (id) => nextTasks.find((t) => t && t.id === id);

    for (const a of actions || []) {
      try {
        if (!a || typeof a.type !== "string") throw new Error("Invalid action");

        if (a.type === "add_task_box") {
          const title = String(a.title || "").trim();
          if (!title) throw new Error("Missing title");
          const id = now();
          nextBoxes.push({ id, TaskBoxTitle: title });
          results.push(`Added list "${title}".`);
        } else if (a.type === "rename_task_box") {
          const id = Number(a.id);
          const title = String(a.title || "").trim();
          if (!id || !title) throw new Error("Missing id/title");
          nextBoxes = nextBoxes.map((b) => (b.id === id ? { ...b, TaskBoxTitle: title } : b));
          results.push(`Renamed list #${id} to "${title}".`);
        } else if (a.type === "delete_task_box") {
          const id = Number(a.id);
          if (!id) throw new Error("Missing id");
          nextBoxes = nextBoxes.filter((b) => b.id !== id);
          nextTasks = nextTasks.filter((t) => t && t.taskBoxId !== id);
          results.push(`Deleted list #${id} (and its tasks).`);
        } else if (a.type === "add_task") {
          const taskBoxId = Number(a.taskBoxId);
          const name = String(a.name || "").trim();
          if (!taskBoxId || !name) throw new Error("Missing taskBoxId/name");
          if (!findBox(taskBoxId)) throw new Error(`Task box #${taskBoxId} not found`);
          const id = now();
          nextTasks.push({ id, taskBoxId, TaskName: name, checked: false });
          results.push(`Added task "${name}" to list #${taskBoxId}.`);
        } else if (a.type === "rename_task") {
          const taskId = Number(a.taskId);
          const name = String(a.name || "").trim();
          if (!taskId || !name) throw new Error("Missing taskId/name");
          if (!findTask(taskId)) throw new Error(`Task #${taskId} not found`);
          nextTasks = nextTasks.map((t) => (t && t.id === taskId ? { ...t, TaskName: name } : t));
          results.push(`Renamed task #${taskId} to "${name}".`);
        } else if (a.type === "toggle_task") {
          const taskId = Number(a.taskId);
          if (!taskId) throw new Error("Missing taskId");
          if (!findTask(taskId)) throw new Error(`Task #${taskId} not found`);
          nextTasks = nextTasks.map((t) => (t && t.id === taskId ? { ...t, checked: !t.checked } : t));
          results.push(`Toggled task #${taskId}.`);
        } else if (a.type === "delete_task") {
          const taskId = Number(a.taskId);
          if (!taskId) throw new Error("Missing taskId");
          nextTasks = nextTasks.filter((t) => t && t.id !== taskId);
          results.push(`Deleted task #${taskId}.`);
        } else {
          throw new Error(`Unknown action type: ${a.type}`);
        }
      } catch (e) {
        results.push(`Action failed: ${a?.type ?? "unknown"} (${e?.message ?? "error"})`);
      }
    }

    // Commit once (clean + avoids many renders)
    setTodayTaskBox(nextBoxes);
    setTodayCheckBox(nextTasks);

    return results;
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (!apiKey) {
      const errMsg =
        `Ethos is not configured: missing VITE_API_KEY. ` +
        `Set it in .env and restart the dev server.`;
      const next = [
        ...messages,
        { id: String(now()), role: "user", content: text, ts: now() },
        { id: String(now() + 1), role: "assistant", content: errMsg, ts: now() },
      ];
      setMessages(next);
      savePersistedMessages(next);
      setInput("");
      return;
    }

    const userMsg = { id: crypto?.randomUUID?.() ?? String(now()), role: "user", content: text, ts: now() };
    const optimistic = [...messages, userMsg];
    setMessages(optimistic);
    savePersistedMessages(optimistic);
    setInput("");

    setBusy(true);
    try {
      const todoSnapshot = getTodoSnapshotForPrompt();

      const contentsText = [
        ...contextForModel.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          text: m.content,
        })),
        {
          role: "user",
          text:
            `User message: ${text}\n\n` +
            `Current Today data (for actions): ${JSON.stringify(todoSnapshot)}\n\n` +
            `If you need an id, ask a short follow-up question.`,
        },
      ];

      const raw = await callGemini({
        apiKey,
        systemPrompt: buildSystemPrompt(),
        contentsText,
      });

      const parsed = extractJsonObject(raw);
      const reply = parsed?.reply ? String(parsed.reply) : raw || "I couldn't generate a reply.";
      const actions = Array.isArray(parsed?.actions) ? parsed.actions : [];
      const newSummary = parsed?.summary ? String(parsed.summary) : "";

      const actionNotes = actions.length ? applyActions(actions) : [];

      const assistantText =
        actionNotes.length
          ? `${reply}\n\nChanges made:\n- ${actionNotes.join("\n- ")}`
          : reply;

      const assistantMsg = {
        id: crypto?.randomUUID?.() ?? String(now() + 2),
        role: "assistant",
        content: assistantText,
        ts: now(),
      };

      const next = [...optimistic, assistantMsg];
      setMessages(next);
      savePersistedMessages(next);

      if (newSummary.trim()) {
        setSummary(newSummary.trim());
        savePersistedSummary(newSummary.trim());
      }
    } catch (e) {
      const assistantMsg = {
        id: crypto?.randomUUID?.() ?? String(now() + 3),
        role: "assistant",
        content: `Ethos error: ${e?.message ?? "Unknown error"}`,
        ts: now(),
      };
      const next = [...optimistic, assistantMsg];
      setMessages(next);
      savePersistedMessages(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="shadow-lg rounded-full px-4 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        aria-label={open ? "Close Ethos chat" : "Open Ethos chat"}
      >
        {open ? "Close Ethos" : "Chat: Ethos"}
      </button>

      {open && (
        <div className="mt-3 w-[92vw] sm:w-[420px] h-[70vh] sm:h-[520px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">Ethos</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Study • Coding • General Knowledge • App Help • Todo Actions
              </div>
            </div>

            <button
              onClick={clearChat}
              className="text-sm px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Clear chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap text-sm px-3 py-2 rounded-2xl ${
                      isUser
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={listEndRef} />
          </div>

          {/* Summary */}
          {summary?.trim() && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-950">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Summary (updated after each Ethos reply)
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {summary}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={busy ? "Ethos is thinking..." : "Ask Ethos…"}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none"
              disabled={busy}
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-50 hover:bg-purple-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ethos;