import { create } from "zustand";
import { persist } from "zustand/middleware";

const makeSession = (id) => ({
  id,
  title: `Session ${id}`,
  createdAt: Date.now(),
  context: null,
  messages: [],
});

export const mentorStore = create(
  persist(
    (set, get) => ({
      sessions: [makeSession(1)],
      activeSessionId: 1,
      nextId: 2,

      newSession: () => {
        const id = get().nextId;
        set((s) => ({
          sessions: [...s.sessions, makeSession(id)],
          activeSessionId: id,
          nextId: id + 1,
        }));
      },

      switchSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) =>
        set((s) => {
          const remaining = s.sessions.filter((sess) => sess.id !== id);
          if (remaining.length === 0) {
            const newId = s.nextId;
            return {
              sessions: [makeSession(newId)],
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
