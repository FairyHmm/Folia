import { Group, Textarea, ActionIcon } from "@mantine/core";
import { Send } from "lucide-react";
import classes from "../styles/message-input.module.css";

export default function MessageInput({ chatActions }) {
  return (
    <Group className={classes["input-area"]} gap="xs" align="flex-end" shrink={0}>
      <Textarea
        value={chatActions.input}
        onChange={(e) => chatActions.setInput(e.currentTarget.value)}
        onKeyDown={chatActions.handleKeyDown}
        placeholder="↵ to send"
        autosize
        minRows={1}
        maxRows={4}
        flex={1}
        size="xs"
        classNames={{ input: classes["text-field"] }}
      />

      <ActionIcon
        onClick={chatActions.sendMessage}
        disabled={!chatActions.input.trim()}
        className={classes["send-btn"]}
        size="lg"
        aria-label="Send"
      >
        <Send size={16} />
      </ActionIcon>
    </Group>
  );
}
