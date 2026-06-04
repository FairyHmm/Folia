import { Group, Text, ActionIcon, TextInput } from "@mantine/core";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import classes from "../styles/session-item.module.css";

export default function SessionItem({ session, isActive, sidebarActions, renameState }) {
  const isEditing = renameState.editingId === session.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Group
        gap={4}
        className={classes["session-row"]}
        data-active={isActive || undefined}
        onClick={() => sidebarActions.switchSession(session.id)}
      >
        {isEditing ? (
          <TextInput
            value={renameState.editingTitle}
            onChange={(e) => renameState.setEditingTitle(e.currentTarget.value)}
            onBlur={renameState.commitRename}
            onKeyDown={renameState.handleRenameKey}
            autoFocus
            size="xs"
            classNames={{ input: classes["rename-input"] }}
            onClick={(e) => e.stopPropagation()}
            flex={1}
          />
        ) : (
          <Text
            className={classes["session-label"]}
            onDoubleClick={(e) => { e.stopPropagation(); renameState.startRename(session); }}
            flex={1}
            truncate
          >
            {session.title}
          </Text>
        )}

        <ActionIcon
          variant="subtle"
          size="xs"
          className={classes["delete-btn"]}
          onClick={(e) => { e.stopPropagation(); sidebarActions.deleteSession(session.id); }}
          aria-label="Delete session"
        >
          <Trash2 size={11} />
        </ActionIcon>
      </Group>
    </motion.div>
  );
}
