"use client"

import type React from "react"
import { motion } from "framer-motion"
import { viewTransitionVariants } from "@/lib/animations" // Import variants
import type { Note } from "../../types"

interface FocusNoteViewProps {
  currentNote: Note; // Asserted non-null for this view
  detailInput: string;
  setDetailInput: (value: string) => void;
  handleDetailSubmit: () => void;
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  setCurrentNote: (note: Note | null) => void;
  detailRef: React.RefObject<HTMLTextAreaElement | null>; 
}

export default function FocusNoteView({
  currentNote,
  detailInput,
  setDetailInput,
  handleDetailSubmit,
  setView,
  setCurrentNote,
  detailRef,
}: FocusNoteViewProps) {

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save shortcut (Ctrl+Enter or Cmd+Enter)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault(); 
      handleDetailSubmit();
      return;
    }

    // Smart Enter for list items
    if (e.key === "Enter" && !e.shiftKey) {
      const textarea = e.currentTarget;
      const { selectionStart, value } = textarea; // Removed selectionEnd as it's not used here

      // Find the start of the current line
      let currentLineStartIndex = selectionStart;
      while (currentLineStartIndex > 0 && value[currentLineStartIndex - 1] !== '\n') {
        currentLineStartIndex--;
      }
      // Find the end of the current line (just content, not the newline character itself)
      let currentLineEndIndex = selectionStart;
      while (currentLineEndIndex < value.length && value[currentLineEndIndex] !== '\n') {
        currentLineEndIndex++;
      }
      const currentLine = value.substring(currentLineStartIndex, currentLineEndIndex);

      const listPrefixMatch = currentLine.match(/^(\s*[-\*+]\s+)/); // Matches prefixes like "- ", "  * ", "    + "

      if (listPrefixMatch) {
        const prefix = listPrefixMatch[1]; // e.g., "  - "
        const contentOfListItem = currentLine.substring(prefix.length);

        if (contentOfListItem.trim() === "") { // Empty list item (e.g., user typed "  - " and pressed Enter)
          e.preventDefault();
          // Remove the current list item line (prefix and any trailing spaces) and start a new line
          const textBeforeCurrentLine = value.substring(0, currentLineStartIndex);
          // Ensure to capture newline if it exists before textAfterCurrentLine
          const textAfterCurrentLine = value.substring(currentLineEndIndex + (value[currentLineEndIndex] === '\n' ? 1 : 0));
          
          setDetailInput(textBeforeCurrentLine + (textBeforeCurrentLine.endsWith('\n') || textBeforeCurrentLine === '' ? '' : '\n') + textAfterCurrentLine);
          // Set cursor to the beginning of the new empty line (or adjusted position)
          setTimeout(() => {
            const newCursorPosition = textBeforeCurrentLine.length > 0 && !textBeforeCurrentLine.endsWith("\n") ? textBeforeCurrentLine.length +1 : textBeforeCurrentLine.length;
            textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
          }, 0);
        } else { // List item has content, continue the list
          e.preventDefault();
          const textToInsert = '\n' + prefix; // Newline and the same prefix
          const newText = 
            value.substring(0, selectionStart) + 
            textToInsert +
            value.substring(selectionStart); // Use selectionStart instead of selectionEnd to insert at cursor
          setDetailInput(newText);
          // Set cursor after the newly inserted prefix
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + textToInsert.length;
          }, 0);
        }
        return; // Handled list item behavior
      }
      // If not a list item, Enter behaves normally (default behavior)
    }
  };

  return (
    <motion.div
      key="focusNote"
      variants={viewTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col p-6 flex-grow items-center w-full max-w-2xl lg:max-w-4xl mx-auto" // Centered layout
    >
      <motion.h2 
        className="text-2xl font-semibold mb-6 text-center w-full break-words" // Allow gist to wrap
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      >
        {currentNote.gist}
      </motion.h2>

      <motion.textarea
        ref={detailRef}
        value={detailInput}
        onChange={(e) => setDetailInput(e.target.value)}
        placeholder="elaborate a bit..."
        className="w-full p-4 bg-card text-card-foreground rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[250px] text-base mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        autoFocus // Focus on the detail input when the view loads
        onKeyDown={handleTextareaKeyDown}
      />

      <div className="flex justify-end space-x-3 mt-auto w-full">
        <button
          onClick={() => {
            // Reset potential changes if cancelled
            setDetailInput(currentNote.details || ""); 
            setView("capture") 
            setCurrentNote(null); // Clear currentNote when cancelling from a new note creation flow or editing
          }}
          className="px-6 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
        >
          cancel
        </button>
        <button
          onClick={handleDetailSubmit}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          save note
        </button>
      </div>
    </motion.div>
  );
} 