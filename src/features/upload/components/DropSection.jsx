import { Group, Text, CloseButton, Box } from "@mantine/core";
import {
  Upload,
  ArrowDownFromLine,
  ArrowDownToLine,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import classes from "../styles/upload-panel.module.css";

const DROP_STATES = {
  hovering: {
    text: "Drop it!",
    Icon: ArrowDownToLine,
    className: `${classes["drop-zone"]} ${classes["is-dragging"]} ${classes["is-hovering"]}`,
  },
  dragging: {
    text: "Drag it here",
    Icon: ArrowDownFromLine,
    className: `${classes["drop-zone"]} ${classes["is-dragging"]}`,
  },
  idle: {
    text: "Submit your resume",
    Icon: Upload,
    className: classes["drop-zone"],
  },
};

export default function DropSection({
  file,
  onClear,
  height,
  isDragging,
  isHoveringDropzone,
}) {
  const currentState = isHoveringDropzone
    ? "hovering"
    : isDragging
      ? "dragging"
      : "idle";
  const { text, Icon, className } = DROP_STATES[currentState];

  return (
    <motion.div
      layout
      animate={{ height }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Box px="md" py="xl">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <FileText size={18} className={classes["file-icon"]} />
                  <Text size="sm" fw={500} truncate>
                    {file.name}
                  </Text>
                </Group>
                <CloseButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                />
              </Group>
            </Box>
          </motion.div>
        ) : (
          <motion.div key="idle-or-drag" style={{ height: "100%" }}>
            <Group
              justify="center"
              gap="sm"
              py="lg"
              px="md"
              className={className}
            >
              <Icon size={16} />
              <Text size="sm" fw={500}>
                {text}
              </Text>
            </Group>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
