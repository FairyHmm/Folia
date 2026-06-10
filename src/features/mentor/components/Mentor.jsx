import { Divider, Flex } from "@mantine/core";
import { useMentor } from "../hooks/useMentor";
import SessionSidebar from "./SessionSidebar";
import ChatWindow from "./ChatWindow";
import classes from "../styles/mentor.module.css";

export default function Mentor({ context = null }) {
  const { sessionsData, sidebarActions, renameState, chatActions, ttsState } =
    useMentor(context);

  return (
    <Flex className={classes.container}>
      <SessionSidebar
        sessionsData={sessionsData}
        sidebarActions={sidebarActions}
        renameState={renameState}
      />

      <Divider className={classes.divider} />

      <ChatWindow
        sessionsData={sessionsData}
        chatActions={chatActions}
        ttsState={ttsState}
      />
    </Flex>
  );
}
