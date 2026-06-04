import { useEffect, useRef } from "react";
import { Box, ScrollArea, Stack, Text, Loader } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import classes from "../styles/message-list.module.css";

const MotionBox = motion(Box);

export default function MessageList({ sessionsData }) {
  const { activeSession, isTyping } = sessionsData;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, isTyping]);

  return (
    <Box className={classes["chat-messages"]}>
      <AnimatePresence mode="popLayout">
        <MotionBox
          key={activeSession.id}
          initial={{ opacity: 0, x: -16, y: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            transition: {
              delay: 0.05,
              duration: 0.35,
              ease: [0.215, 0.61, 0.355, 1],
            },
          }}
          exit={{
            opacity: 0,
            x: -20,
            y: 12,
            rotate: -1.5,
            transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
          }}
          style={{ transformOrigin: "top left" }}
          className={classes["scroll-container"]}
        >
          <ScrollArea h="100%" type="never">
            <Stack gap="xs" p="md" className={classes["stack-viewport"]}>
              {activeSession.messages.length === 0 && (
                <Text className={classes["empty-state"]}>—</Text>
              )}

              <AnimatePresence initial={false}>
                {activeSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={classes["message-row"]}
                    data-role={msg.role}
                  >
                    <div className={classes.message} data-role={msg.role}>
                      <Text className={classes["message-text"]}>
                        {msg.content}
                      </Text>
                    </div>
                  </div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <div className={classes["message-row"]} data-role="assistant">
                  <div className={classes.message} data-role="assistant">
                    <Loader size={12} color="currentColor" type="dots" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </Stack>
          </ScrollArea>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
}
