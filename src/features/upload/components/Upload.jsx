import {
  Text,
  CloseButton,
  Group,
  Button,
  Box,
  Card,
  Loader,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useUpload } from "../hooks/useUpload";
import { useFileExtractor } from "../hooks/useFileExtractor";
import { ACCEPTED_MIME, MAX_SIZE } from "../utils/constants";
import DropSection from "./DropSection";
import PasteSection from "./PasteSection";
import classes from "../styles/upload-panel.module.css";

export default function Upload({ onClose, onSubmit }) {
  const {
    file,
    text,
    setText,
    canSubmit,
    clearFile,
    isDragging,
    isHoveringDropzone,
    setIsHoveringDropzone,
    setIsFocused,
    dropHeight,
    pasteHeight,
    handleDrop,
  } = useUpload();

  const { handleAnalyse, loading } = useFileExtractor(onSubmit);

  return (
    <Box className={classes.container}>
      <Group justify="space-between" px="md" py="sm" className={classes.header}>
        <Text size="sm" fw={600} className={classes["header-text"]}>
          Upload your CV
        </Text>
        {onClose && (
          <CloseButton size="sm" variant="transparent" onClick={onClose} />
        )}
      </Group>

      <Box className={classes.content}>
        <Card withBorder radius="md" className={classes["inner-card"]} p={0}>
          <Dropzone
            onDrop={handleDrop}
            accept={ACCEPTED_MIME}
            maxSize={MAX_SIZE}
            multiple={false}
            onDragEnter={() => setIsHoveringDropzone(true)}
            onDragLeave={() => setIsHoveringDropzone(false)}
          >
            <DropSection
              file={file}
              onClear={clearFile}
              height={dropHeight}
              isDragging={isDragging}
              isHoveringDropzone={isHoveringDropzone}
            />
          </Dropzone>

          <PasteSection
            value={text}
            onChange={setText}
            height={pasteHeight}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </Card>
      </Box>

      <Group justify="flex-end" px="md" py="sm" className={classes.footer}>
        <Button
          size="sm"
          disabled={!canSubmit || loading}
          leftSection={loading && <Loader size={14} color="currentColor" />}
          className={classes["submit-button"]}
          onClick={() => handleAnalyse({ file, text, canSubmit })}
        >
          {loading ? "Extracting..." : "Analyse"}
        </Button>
      </Group>
    </Box>
  );
}
