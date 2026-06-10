import { create } from "zustand";
import { persist } from "zustand/middleware";

const makeSession = (id, prefillMessage = null) => ({
  id,
  title: `Session ${id}`,
  createdAt: Date.now(),
  context: null,
  messages: prefillMessage ? [prefillMessage] : [],
});

const defaultAssistantMessage = () => ({
  id: crypto.randomUUID(),
  role: "assistant",
  content:
    "Greetings. We are having an interview today. What is your name, and what is the position you are aiming for?",
  ts: Date.now(),
});

export const mentorStore = create(
  persist(
    (set, get) => ({
      sessions: [makeSession(1, defaultAssistantMessage())],
      activeSessionId: 1,
      nextId: 2,

      newSession: (prefillMessage = null) => {
        const id = get().nextId;
        const session = makeSession(id, prefillMessage);
        set((s) => ({
          sessions: [...s.sessions, session],
          activeSessionId: id,
          nextId: id + 1,
        }));
        return id;
      },

      switchSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) =>
        set((s) => {
          const remaining = s.sessions.filter((sess) => sess.id !== id);

          if (remaining.length === 0) {
            const newId = s.nextId;
            const newSession = makeSession(newId, defaultAssistantMessage());
            return {
              sessions: [newSession],
              activeSessionId: newId,
              nextId: newId + 1,
            };
          }

          const nextActive =
            s.activeSessionId === id
              ? remaining[remaining.length - 1].id
              : s.activeSessionId;

          return { sessions: remaining, activeSessionId: nextActive };
        }),

      renameSession: (id, title) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, title } : sess,
          ),
        })),

      addMessage: (sessionId, message) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, messages: [...sess.messages, message] }
              : sess,
          ),
        })),
    }),
    {
      name: "mentor-chat-storage",
    },
  ),
);
