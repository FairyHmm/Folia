import { useState, useCallback } from "react";
import { mentorStore } from "../store/mentorStore";

const DUMMY_REPLIES = [
  "I need a hero",
  "I'm holding out for a hero till the end of the night",
  "He's gotta be strong and he's gotta be fast",
  "And he's gotta be fresh from the fight",
  "I need a hero",
  "I'm holding out for a hero till the morning light",
  "He's gotta be sure and it's gotta be soon",
  "And he's gotta be larger than life, larger than life",
];

export function useMentor(context) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const {
    sessions,
    activeSessionId,
    newSession,
    switchSession,
    deleteSession,
    renameSession,
    addMessage,
  } = mentorStore();

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    addMessage(activeSessionId, {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      ts: Date.now(),
    });
    setIsTyping(true);
    setTimeout(
      () => {
        addMessage(activeSessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)],
          ts: Date.now(),
        });
        setIsTyping(false);
      },
      900 + Math.random() * 600,
    );
  }, [input, isTyping, activeSessionId, addMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const startRename = (s) => {
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const commitRename = () => {
    if (editingTitle.trim()) renameSession(editingId, editingTitle.trim());
    setEditingId(null);
  };

  const handleRenameKey = (e) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditingId(null);
  };

  return {
    sessionsData: {
      sessions,
      activeSession,
      isTyping,
    },
    sidebarActions: {
      newSession,
      switchSession,
      deleteSession,
    },
    renameState: {
      editingId,
      editingTitle,
      setEditingTitle,
      startRename,
      commitRename,
      handleRenameKey,
    },
    chatActions: {
      input,
      setInput,
      sendMessage,
      handleKeyDown,
    },
  };
}
