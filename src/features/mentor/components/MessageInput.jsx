import { Group, Textarea, ActionIcon, Tooltip, Loader } from "@mantine/core";
import { Send, Mic, MicOff } from "lucide-react";
import classes from "../styles/message-input.module.css";

export default function MessageInput({ chatActions }) {
  const { stt } = chatActions;

  const handleMic = () => {
    stt.listening ? stt.stopSTT() : stt.startSTT();
  };

  const micLabel = stt.transcribing
    ? "Transcribing…"
    : stt.listening
      ? "Stop"
      : "Speak";

  const textFieldClass = [
    classes["text-field"],
    stt.listening ? classes["text-field-listening"] : undefined,
    stt.transcribing ? classes["text-field-transcribing"] : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Group
      className={classes["input-area"]}
      gap="xs"
      align="flex-end"
      shrink={0}
    >
      <Tooltip label={micLabel} position="top">
        <ActionIcon
          onClick={handleMic}
          disabled={stt.transcribing}
          variant={stt.listening ? "light" : "subtle"}
          color={stt.listening ? "red" : stt.transcribing ? "orange" : "gray"}
          size="lg"
          aria-label={micLabel}
          className={stt.listening ? classes["mic-active"] : undefined}
        >
          {stt.transcribing ? (
            <Loader size={14} color="currentColor" type="dots" />
          ) : stt.listening ? (
            <MicOff size={16} />
          ) : (
            <Mic size={16} />
          )}
        </ActionIcon>
      </Tooltip>

      <Textarea
        value={chatActions.input}
        onChange={(e) => chatActions.setInput(e.currentTarget.value)}
        onKeyDown={chatActions.handleKeyDown}
        placeholder={
          stt.listening
            ? "Listening…"
            : stt.transcribing
              ? "Transcribing…"
              : "↵ to send"
        }
        autosize
        minRows={1}
        maxRows={4}
        flex={1}
        size="xs"
        classNames={{ input: textFieldClass }}
      />

      <ActionIcon
        onClick={() => chatActions.sendMessage()}
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
