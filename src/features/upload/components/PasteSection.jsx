import { Textarea } from "@mantine/core";
import { motion } from "framer-motion";
import classes from "../styles/upload-panel.module.css";

export default function PasteSection({
  value,
  onChange,
  height,
  onFocus,
  onBlur,
}) {
  return (
    <motion.div
      animate={{
        height,
        borderTopWidth: height > 0 ? 1 : 0,
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={classes["paste-section-wrapper"]}
      onClick={(e) => e.stopPropagation()}
    >
      <Textarea
        placeholder="Or enter resume text here…"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autosize
        classNames={{ input: classes["textarea-input"] }}
      />
    </motion.div>
  );
}
