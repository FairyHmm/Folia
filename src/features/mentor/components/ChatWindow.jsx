import { Flex, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { Volume2, VolumeOff } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ sessionsData, chatActions, ttsState }) {
  const { ttsEnabled, toggleTTS, speaking } = ttsState;

  return (
    <Flex direction="column" flex={1} miw={0}>
      <Group
        px="md"
        py="xs"
        style={{ borderBottom: "var(--border-styles)" }}
        justify="space-between"
        shrink={0}
      >
        <Text size="sm" fw={600}>
          {sessionsData.activeSession.title}
        </Text>
        <ActionIcon
          onClick={toggleTTS}
          variant="default"
          color={ttsEnabled ? (speaking ? "teal" : "blue") : "gray"}
          size="sm"
          aria-label="Toggle text-to-speech"
        >
          {ttsEnabled ? <Volume2 size={14} /> : <VolumeOff size={14} />}
        </ActionIcon>
      </Group>
      <MessageList sessionsData={sessionsData} />
      <MessageInput chatActions={chatActions} />
    </Flex>
  );
}
