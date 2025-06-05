"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { viewTransitionVariants } from "@/lib/animations"
import type { Note } from "../../types"

interface DetailViewProps {
  currentNote: Note; // currentNote is asserted non-null for this view
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  handleDeleteNote: (id: string) => void;
  setDetailInput: (value: string) => void;
  renderMarkdown: (text: string) => React.ReactNode;
}

export default function DetailView({
  currentNote,
  setView,
  handleDeleteNote,
  setDetailInput,
  renderMarkdown,
}: DetailViewProps) {
  return (
    <motion.div
      key="detail"
      variants={viewTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col p-6 flex-grow w-full max-w-2xl lg:max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView("history")} className="p-2 rounded-full hover:bg-muted">
          <ChevronLeft size={24} />
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setDetailInput(currentNote.details || "");
              setView("focusNote");
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:opacity-80"
          >
            edit
          </button>
          <button
            onClick={() => {
              handleDeleteNote(currentNote.id)
              setView("history")
              // setCurrentNote(null) // This will be handled in the parent component
            }}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90"
          >
            delete
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2 break-words">{currentNote.gist}</h2>
      {currentNote.details ? (
        <div className="bg-card text-card-foreground p-4 rounded-xl shadow-sm prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {renderMarkdown(currentNote.details)}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">no details added</div>
      )}
    </motion.div>
  );
} 