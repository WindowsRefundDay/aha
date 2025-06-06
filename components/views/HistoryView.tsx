"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup, type Transition } from "framer-motion"
import { Search, ChevronLeft, X, Edit, Trash2 } from "lucide-react"
import { viewTransitionVariants } from "@/lib/animations"
import type { Note } from "../../types" // Assuming Note type is correctly defined

interface HistoryViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredNotes: Note[]; // This is the live, filtered list for display
  handleDeleteNote: (id: string) => void; // This will be handleDeleteNoteWithDomino
  handleFocusNote: (note: Note) => void; // New prop for editing
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  getFormattedDate: (date: Date) => string;
  pendingDeletion: {
    noteId: string;
    originalDisplayIndex: number;
    filteredListSnapshot: Note[];
  } | null;
  // notes: Note[]; // Original `notes` prop, if needed for the empty state message.
  // Let's use filteredNotes.length and searchQuery to determine empty state more accurately.
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04, // For initial load stagger
      delayChildren: 0.1,
    },
  },
};

const cardBaseVariants = { // Renamed for clarity
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: { // For when a card is *deleted from the list*
    opacity: 0,
    y: 15,
    scale: 0.92,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Transition for general layout shifts of cards within the grid (e.g., domino effect)
const cardGridShiftTransition: Transition = {
  type: "spring",
  stiffness: 330,
  damping: 32,
  mass: 0.75,
};
const dominoStaggerDelaySeconds = 0.05;

// CRUCIAL: Transition for the shared layout animation (card <-> modal morph)
const sharedLayoutMorphTransition: Transition = {
  type: "spring",
  stiffness: 400, // Tune for desired "pop" and smoothness
  damping: 30,    // damping: 30-35 is often good
  mass: 0.9,      // Lower mass can make it feel quicker
  // Damping ratio and stiffness are key here. Consider also `restDelta` and `restSpeed`.
};

export default function HistoryView({
  searchQuery,
  setSearchQuery,
  filteredNotes,
  handleDeleteNote,
  handleFocusNote,
  setView,
  getFormattedDate,
  pendingDeletion,
  // notes: allNotes, // If passed for empty state
}: HistoryViewProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleDeleteFromModal = () => {
    if (!selectedNote) return;
    // Important: Close the modal *before or at the same time* as initiating delete
    // to allow the morph-back animation to start if the card is still in the list.
    const noteIdToDelete = selectedNote.id;
    setSelectedNote(null); // Close modal
    handleDeleteNote(noteIdToDelete); // Then trigger delete logic
  }

  const handleEditFromModal = () => {
    if (!selectedNote) return;
    // Optimistically close modal for a smoother transition to edit view if it's a different screen
    // If edit happens *within* this modal, then don't setSelectedNote(null) here.
    // Assuming handleFocusNote might change the view.
    const noteToEdit = selectedNote;
    setSelectedNote(null);
    handleFocusNote(noteToEdit);
  }

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
        <div className="w-16"></div> {/* Spacer */}
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

      <LayoutGroup>
        {filteredNotes.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-y-auto pb-6 items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {filteredNotes.map((note) => {
                let currentCardTransition = { ...cardGridShiftTransition };
                if (pendingDeletion && pendingDeletion.noteId !== note.id) {
                  const indexInSnapshot = pendingDeletion.filteredListSnapshot.findIndex(n => n.id === note.id);
                  if (indexInSnapshot !== -1 && indexInSnapshot > pendingDeletion.originalDisplayIndex) {
                    const orderDifference = indexInSnapshot - pendingDeletion.originalDisplayIndex;
                    currentCardTransition.delay = (orderDifference - 1) * dominoStaggerDelaySeconds;
                  }
                }

                return (
                  <motion.div
                    key={note.id}
                    layoutId={`card-${note.id}`}
                    variants={cardBaseVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    transition={currentCardTransition}
                    className="relative bg-card rounded-xl"
                    style={{ opacity: selectedNote && selectedNote.id === note.id ? 1 : undefined }}
                  >
                    <div
                      onClick={() => setSelectedNote(note)}
                      className="p-4 cursor-pointer hover:bg-muted/50 rounded-xl flex flex-col h-full"
                    >
                      <div className="pr-8 flex-grow">
                        <div className="break-words font-semibold line-clamp-2">
                          {note.gist}
                        </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="absolute right-0 top-0 w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-grow items-center justify-center">
            <span className="text-muted-foreground text-center">
              {searchQuery // Check if there's a search query first
                ? "no matching notes for the current search"
                // : allNotes && allNotes.length === 0 // Check if underlying master list is empty
                // For simplicity, if no filtered notes and no search, assume no notes.
                // This part depends on whether you pass the original full list for this message.
                : "no notes yet"
              }
            </span>
          </div>
        )}

        {/* Modal Overlay */}
        <AnimatePresence>
          {selectedNote && (
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
              onClick={() => setSelectedNote(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                key={`modal-content-${selectedNote.id}`}
                layoutId={`card-${selectedNote.id}`}
                transition={sharedLayoutMorphTransition}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-card text-card-foreground p-6 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.25, ease: "easeOut" } }}
                  exit={{ opacity: 0, y: 5, transition: { duration: 0.15, ease: "easeIn" } }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-semibold pr-16">{selectedNote.gist}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedNote.details}</p>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-muted-foreground">
                      {getFormattedDate(new Date(selectedNote.createdAt))}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditFromModal}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity flex items-center space-x-2"
                      >
                        <Edit size={16} /> <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeleteFromModal}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity flex items-center space-x-2"
                      >
                        <Trash2 size={16} /> <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => setSelectedNote(null)}
                  className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

    </motion.div>
  );
} 