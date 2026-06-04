import { Flex, Group, Text } from "@mantine/core";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ sessionsData, chatActions }) {
  return (
    <Flex direction="column" flex={1} miw={0}>
      <Group
        px="md"
        py="xs"
        style={{ borderBottom: "var(--border-styles)" }}
        shrink={0}
      >
        <Text size="sm" fw={600}>
          {sessionsData.activeSession.title}
        </Text>
      </Group>
      <MessageList sessionsData={sessionsData} />
      <MessageInput chatActions={chatActions} />
    </Flex>
  );
}
