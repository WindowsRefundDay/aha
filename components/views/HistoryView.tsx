"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Search, ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { viewTransitionVariants } from "@/lib/animations"
import type { Note } from "../../types"

interface HistoryViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredNotes: Note[];
  notes: Note[]; // For the empty state message
  handleNoteClick: (note: Note) => void;
  handleDeleteNote: (id: string) => void;
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  getFormattedDate: (date: Date) => string;
}

export default function HistoryView({
  searchQuery,
  setSearchQuery,
  filteredNotes,
  notes,
  handleNoteClick,
  handleDeleteNote,
  setView,
  getFormattedDate,
}: HistoryViewProps) {
  return (
    <motion.div
      key="history"
      variants={viewTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col p-6 h-full flex-grow"
    >
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView("capture")} className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} />
          <span className="ml-1">back</span>
        </button>
        <h2 className="text-xl font-normal text-foreground">history</h2>
        <div className="w-16"></div> {/* Spacer for alignment */}
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="search..."
          className="w-full p-3 pl-10 bg-card text-card-foreground rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-y-auto pb-6">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div
                onClick={() => handleNoteClick(note)}
                className={cn(
                  "bg-card text-card-foreground p-4 rounded-xl cursor-pointer hover:bg-muted transition-colors",
                )}
              >
                <div>
                  <div className="break-words font-semibold line-clamp-2">{note.gist}</div>
                  {note.details && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {note.details}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground text-right block mt-4">
                  {getFormattedDate(new Date(note.createdAt))}
                </span>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="absolute right-0 top-0 w-12 h-12 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8 col-span-full">
            {notes.length === 0
              ? "no notes yet"
              : searchQuery
                ? "no matching notes for the current search"
                : "no notes yet"}
          </div>
        )}
      </div>
    </motion.div>
  );
} 