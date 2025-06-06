"use client"

import type React from "react"
import { motion } from "framer-motion"
import { viewTransitionVariants } from "@/lib/animations" // Import variants
import { Search, ChevronLeft, X, AlertTriangle, Sun, Moon } from "lucide-react" // Keep all icons for now, will prune later if not needed by this specific view
import type { Note } from "../../types" // Adjusted path

interface CaptureViewProps {
  gistInput: string;
  setGistInput: (value: string) => void;
  handleGistSubmit: (e?: React.FormEvent) => void;
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  notes: Note[];
  handleNoteClick: (note: Note) => void;
}

export default function CaptureView({
  gistInput,
  setGistInput,
  handleGistSubmit,
  setView,
  inputRef,
  notes,
  handleNoteClick,
}: CaptureViewProps) {
  return (
    <motion.div
      key="capture"
      variants={viewTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col p-6 flex-grow"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-baseline">
          <h1 className="text-xl font-normal">aha!</h1>
          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">beta</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setView("history")} className="text-sm text-muted-foreground hover:text-foreground">
            history
          </button>
          <button onClick={() => setView("settings")} className="text-sm text-muted-foreground hover:text-foreground">
            settings
          </button>
        </div>
      </div>

      {/* Recent notes chips */}
      {notes.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {notes.slice(0, 2).map((note) => (
            <button
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] hover:opacity-80"
            >
              {note.gist}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleGistSubmit} className="mt-4">
        <div className="relative">
          <motion.input
            ref={inputRef}
            type="text"
            value={gistInput}
            onChange={(e) => setGistInput(e.target.value)}
            placeholder="i just learned..."
            className="w-full p-4 text-xl bg-card text-card-foreground rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="off"
            whileTap={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 300, damping: 50 }}
          />
          {gistInput && (
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
} 