import { Box, Group, Text, Stack, ScrollArea, ActionIcon } from "@mantine/core";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SessionItem from "./SessionItem";
import classes from "../styles/session-sidebar.module.css";

export default function SessionSidebar({
  sessionsData,
  sidebarActions,
  renameState,
}) {
  const { sessions, activeSession } = sessionsData;

  return (
    <Box className={classes.sidebar}>
      <Group justify="space-between" px="sm" py="xs">
        <Text fs="xs" fw={600} lts="0.06em" tt="uppercase" c="dimmed">
          Sessions
        </Text>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => sidebarActions.startSession()}
          aria-label="New session"
        >
          <Plus size={14} />
        </ActionIcon>
      </Group>

      <ScrollArea type="never">
        <Stack gap={2} p="xs">
          <AnimatePresence initial={false}>
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSession.id}
                sidebarActions={sidebarActions}
                renameState={renameState}
              />
            ))}
          </AnimatePresence>
        </Stack>
      </ScrollArea>
    </Box>
  );
}
