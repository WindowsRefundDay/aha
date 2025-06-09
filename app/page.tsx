"use client"

import type React from "react"
// Link will be removed as settings is no longer a separate page
// import Link from "next/link" 

import { useState, useRef, useEffect, useMemo, useCallback } from "react" // Added useCallback
import { motion, AnimatePresence } from "framer-motion"
// Added AlertTriangle, Sun, Moon
import { Search, ChevronLeft, X, AlertTriangle, Sun, Moon } from "lucide-react" 
import { cn } from "@/lib/utils"
import type { Note } from "../types"
import CaptureView from "@/components/views/CaptureView" // Added import
import HistoryView from "@/components/views/HistoryView" // Added import
import DetailView from "@/components/views/DetailView" // Added import
import FocusNoteView from "@/components/views/FocusNoteView" // Added import
import SettingsView from "@/components/views/SettingsView" // Added import
import WelcomeView from "@/components/views/WelcomeView"
import { useVisualViewport } from "@/lib/hooks/useVisualViewport"

// Constants from settings/page.tsx
const ACCENT_COLORS = [
  { name: "Default Blue", key: "blue", hsl: "217 91% 60%", fgHsl: "0 0% 100%", previewClass: "bg-blue-500", ringClass: "ring-blue-500" },
  { name: "Green", key: "green", hsl: "142 71% 45%", fgHsl: "0 0% 100%", previewClass: "bg-green-500", ringClass: "ring-green-500" },
  { name: "Purple", key: "purple", hsl: "262 83% 58%", fgHsl: "0 0% 100%", previewClass: "bg-purple-500", ringClass: "ring-purple-500" },
  { name: "Orange", key: "orange", hsl: "25 95% 53%", fgHsl: "0 0% 100%", previewClass: "bg-orange-500", ringClass: "ring-orange-500" },
  { name: "Pink", key: "pink", hsl: "330 80% 55%", fgHsl: "0 0% 100%", previewClass: "bg-pink-500", ringClass: "ring-pink-500" },
  { name: "Teal", key: "teal", hsl: "162 72% 45%", fgHsl: "0 0% 100%", previewClass: "bg-teal-500", ringClass: "ring-teal-500" },
  { name: "Graphite", key: "gray", hsl: "215 14% 47%", fgHsl: "0 0% 100%", previewClass: "bg-gray-500", ringClass: "ring-gray-500" },
];

const DEFAULT_ACCENT_KEY = ACCENT_COLORS[0].key;
// const DEFAULT_ACCENT_HSL = ACCENT_COLORS[0].hsl; // Not directly used in the integrated logic
// const DEFAULT_ACCENT_FG_HSL = ACCENT_COLORS[0].fgHsl; // Not directly used in the integrated logic

// Moved helper functions outside the component
const getFormattedDate = (date: Date) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "today"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday"
  } else {
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      .toLowerCase()
  }
}

const renderMarkdown = (text: string) => {
  // Simple markdown rendering for bold and italic
  // Newlines will be handled by white-space: pre-wrap on the container
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
  return <div dangerouslySetInnerHTML={{ __html: formattedText }} />
}

export default function Home() {
  // Added "settings" to the view state
  const [view, setView] = useState<"capture" | "history" | "detail" | "focusNote" | "settings">("capture")
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [gistInput, setGistInput] = useState("")
  const [detailInput, setDetailInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0 })
  const [pendingDeletion, setPendingDeletion] = useState<{
    noteId: string;
    originalDisplayIndex: number;
    filteredListSnapshot: Note[];
  } | null>(null);

  // State from settings/page.tsx
  const [isMounted, setIsMounted] = useState(false); // We'll manage mounting effects carefully
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedAccentKey, setSelectedAccentKey] = useState(DEFAULT_ACCENT_KEY);
  const [showClearNotesDialog, setShowClearNotesDialog] = useState(false);
  const [notesClearedMessageVisible, setNotesClearedMessageVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null)
  const detailRef = useRef<HTMLTextAreaElement>(null)
  
  // Use the visual viewport hook
  const viewportHeight = useVisualViewport();

  // Focus input on mount
  useEffect(() => {
    if (view === "capture" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [view])

  // useEffect for settings page logic (theme and accent color loading)
  useEffect(() => {
    // This effect now runs for all views, but its logic is mostly for initializing settings.
    // Consider if this needs to be conditional or scoped if it causes issues.
    setIsMounted(true); // Indicates client-side has mounted

    const hasVisited = localStorage.getItem("aha_has_visited") === 'true';
    if (!hasVisited) {
      setShowWelcome(true);
    }

    const savedDarkMode = localStorage.getItem("aha_darkMode");
    if (savedDarkMode === null) {
      // First visit, default to dark mode
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem("aha_darkMode", 'true');
    } else {
      // Returning user, respect their choice
      const isDark = savedDarkMode === 'true';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const savedAccentKey = localStorage.getItem("aha_accentColor_key") || DEFAULT_ACCENT_KEY;
    const accentToApply = ACCENT_COLORS.find(c => c.key === savedAccentKey) || ACCENT_COLORS[0];
    setSelectedAccentKey(accentToApply.key);
    document.documentElement.style.setProperty('--accent-hsl', accentToApply.hsl);
    document.documentElement.style.setProperty('--accent-foreground-hsl', accentToApply.fgHsl);

  }, []); // Empty dependency array, runs once on mount for the Home component

  // Handle 'Esc' key to go back from history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'history') {
          setView('capture');
        } else if (view === 'detail' || view === 'focusNote') {
          setView('history');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, setView]);

  // Filtered notes using useMemo
  const filteredNotes: Note[] = useMemo(() => {
    let tempFilteredNotes = notes;

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      tempFilteredNotes = tempFilteredNotes.filter(
        (note) =>
          note.gist.toLowerCase().includes(lowerSearchQuery) ||
          (note.details && note.details.toLowerCase().includes(lowerSearchQuery))
      );
    }
    // Sort by creation date, newest first, for a consistent order
    return tempFilteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, searchQuery]);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("aha_notes")
      if (savedNotes) {
        const parsedNotes: Note[] = JSON.parse(savedNotes, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "createdAt" || key === "updatedAt") {
            return new Date(value)
          }
          return value
        })
        setNotes(parsedNotes)
      }
    } catch (error) {
      console.error("Error loading notes from localStorage:", error)
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("aha_notes", JSON.stringify(notes))
    } catch (error) {
      console.error("Error saving notes to localStorage:", error)
    }
  }, [notes])

  // Helper functions from settings/page.tsx
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem("aha_darkMode", JSON.stringify(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  }, []);

  const handleAccentColorChange = useCallback((colorKey: string) => {
    const selectedColor = ACCENT_COLORS.find(c => c.key === colorKey);
    if (selectedColor) {
      setSelectedAccentKey(selectedColor.key);
      document.documentElement.style.setProperty('--accent-hsl', selectedColor.hsl);
      document.documentElement.style.setProperty('--accent-foreground-hsl', selectedColor.fgHsl);
      localStorage.setItem("aha_accentColor_key", selectedColor.key);
      localStorage.setItem("aha_accentColor_hsl", selectedColor.hsl);
      localStorage.setItem("aha_accentColor_fg_hsl", selectedColor.fgHsl);
    }
  }, []);

  const handleFactoryReset = useCallback(() => {
    // Clear all app-related localStorage items
    localStorage.removeItem("aha_notes");
    localStorage.removeItem("aha_darkMode");
    localStorage.removeItem("aha_accentColor_key");
    localStorage.removeItem("aha_accentColor_hsl");
    localStorage.removeItem("aha_accentColor_fg_hsl");
    localStorage.removeItem("aha_has_visited");
    
    // Reload the page to apply the factory reset state
    window.location.reload();
  }, []);

  const handleExportAllData = useCallback(() => {
    if (notes.length === 0) {
      // Maybe show a message to the user that there is nothing to export.
      // For now, we'll just log it and do nothing.
      console.log("No notes to export.");
      return;
    }
  
    const jsonData = JSON.stringify(notes, null, 2); // Pretty print JSON
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aha-notes.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [notes]);

  // Add import notes handler
  const handleImportAllData = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Unable to read file');
        const imported = JSON.parse(text, (key, value) => {
          if ((key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        if (!Array.isArray(imported)) {
          console.error('Invalid format: expected an array of notes');
          return;
        }
        setNotes(imported);
        localStorage.setItem('aha_notes', JSON.stringify(imported));
        console.log(`Imported ${imported.length} notes.`);
      } catch (err) {
        console.error('Error importing notes:', err);
      }
    };
    reader.readAsText(file);
  }, [setNotes]);

  const handleWelcomeDismiss = () => {
    localStorage.setItem("aha_has_visited", "true");
    setShowWelcome(false);
  };

  const handleClearAllNotesFromSettings = useCallback(() => { // Renamed to avoid conflict if a general one exists
    localStorage.removeItem("aha_notes");
    setNotes([]); // Also clear notes from app state
    setShowClearNotesDialog(false);
    setNotesClearedMessageVisible(true);
    setTimeout(() => setNotesClearedMessageVisible(false), 5000);
  }, [setNotes, setShowClearNotesDialog, setNotesClearedMessageVisible]); // Added dependencies (setters are stable)

  const handleGistSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!gistInput.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      gist: gistInput.trim(),
      details: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes((prev) => [newNote, ...prev])
    setCurrentNote(newNote)
    setGistInput("")
    setDetailInput("")
    setView("focusNote")
  }, [gistInput, setNotes, setCurrentNote, setGistInput, setDetailInput, setView]); // Added dependencies

  const handleDetailSubmit = useCallback(() => {
    if (!currentNote) return

    const updatedNote: Note = {
      ...currentNote,
      details: detailInput.trim(),
      updatedAt: new Date(),
    }

    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    )
    setView("history")
  }, [currentNote, detailInput, setNotes, setView]); // Added dependencies

  const handleNoteSelect = useCallback((note: Note) => {
    setCurrentNote(note)
    setDetailInput(note.details || "")
    setView("detail")
  }, [setCurrentNote, setDetailInput, setView]); // Added dependencies

  const handleBackToHistory = useCallback(() => {
    setCurrentNote(null)
    setDetailInput("")
    setView("history")
  }, [setCurrentNote, setDetailInput, setView]); // Added dependencies

  const handleDeleteNote = useCallback((idToDelete: string) => {
    // Find the note in the *currently displayed filtered list*
    const currentDisplayIndexInFilteredList = filteredNotes.findIndex(note => note.id === idToDelete);
  
    if (currentDisplayIndexInFilteredList === -1) {
      console.warn("Attempted to delete a note not found in filtered list. Deleting from master list as a fallback.");
      setNotes(prev => prev.filter(n => n.id !== idToDelete));
      return;
    }
  
    // If deleting the note currently in detail view, navigate back
    if (currentNote && currentNote.id === idToDelete) {
        handleBackToHistory();
    }
  
    // 1. Set pending deletion info, capturing the current state of filteredNotes
    setPendingDeletion({
      noteId: idToDelete,
      originalDisplayIndex: currentDisplayIndexInFilteredList,
      filteredListSnapshot: [...filteredNotes], // Crucial: snapshot of the list
    });
  
    // 2. Define animation timings
    const deletedCardExitAnimationDuration = 0.25 * 1000; // 250ms (from cardVariants.exit)
  
    // 3. Delay the actual removal from the master 'notes' array.
    setTimeout(() => {
      setNotes(currentMasterNotes => currentMasterNotes.filter(note => note.id !== idToDelete));
  
      // 4. Clear pending info after a longer delay.
      const dominoStaggerMs = 0.05 * 1000; // 50ms
      const maxAffectedCardsInSnapshot = filteredNotes.length - 1 - currentDisplayIndexInFilteredList;
      const estimatedDominoEffectDuration = maxAffectedCardsInSnapshot > 0 ? (maxAffectedCardsInSnapshot * dominoStaggerMs) : 0;
  
      const clearPendingTimeout = Math.max(deletedCardExitAnimationDuration, estimatedDominoEffectDuration) + 300;
  
      setTimeout(() => {
        setPendingDeletion(null);
      }, clearPendingTimeout);
  
    }, 50); // A small delay (e.g., 50ms) to allow re-render
  }, [filteredNotes, currentNote, handleBackToHistory]);

  const handleFocusNote = useCallback((note: Note) => {
    setCurrentNote(note)
    setDetailInput(note.details || "")
    setView("focusNote")
  }, [setCurrentNote, setDetailInput, setView]); // Added dependencies

  const handleSelectionChange = () => {
    if (detailRef.current) {
      setSelectedText({
        start: detailRef.current.selectionStart,
        end: detailRef.current.selectionEnd,
      })
    }
  }

  const handleClearSelection = () => {
    setSelectedText({ start: 0, end: 0 })
    if (detailRef.current) {
      detailRef.current.setSelectionRange(
        detailRef.current.value.length,
        detailRef.current.value.length
      )
      detailRef.current.focus()
    }
  }

  const getSelectedText = () => {
    if (!detailRef.current) return ""
    return detailRef.current.value.substring(
      selectedText.start,
      selectedText.end
    )
  }

  const getScript = () => {
    const selection = getSelectedText()
    if (!selection) return
    const newNote = {
      id: Date.now().toString(),
      gist: selection,
      details: `source: ${currentNote?.gist}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
    handleClearSelection()
  }

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">
       <AnimatePresence>
         {showWelcome && <WelcomeView key="welcome" onDismiss={handleWelcomeDismiss} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
       </AnimatePresence>

      <div style={{ height: `${viewportHeight}px` }} className="flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "capture" && (
            <CaptureView 
              inputRef={inputRef}
              gistInput={gistInput}
              setGistInput={setGistInput}
              handleGistSubmit={handleGistSubmit}
              setView={setView}
              notes={notes}
              handleNoteClick={handleNoteSelect}
            />
          )}
          {view === "history" && (
            <HistoryView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setView={setView}
              filteredNotes={filteredNotes}
              getFormattedDate={getFormattedDate}
              handleDeleteNote={handleDeleteNote}
              pendingDeletion={pendingDeletion}
              handleFocusNote={handleFocusNote}
            />
          )}
          {view === "focusNote" && currentNote && (
            <FocusNoteView
              currentNote={currentNote}
              detailInput={detailInput}
              setDetailInput={setDetailInput}
              detailRef={detailRef}
              handleDetailSubmit={handleDetailSubmit}
              setView={setView}
              setCurrentNote={setCurrentNote}
            />
          )}
          {/* Settings View - Content from app/settings/page.tsx */}
          {view === "settings" && (
            <SettingsView
              setView={setView}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              ACCENT_COLORS={ACCENT_COLORS}
              selectedAccentKey={selectedAccentKey}
              handleAccentColorChange={handleAccentColorChange}
              showClearNotesDialog={showClearNotesDialog}
              setShowClearNotesDialog={setShowClearNotesDialog}
              notesClearedMessageVisible={notesClearedMessageVisible}
              handleClearAllNotesFromSettings={handleFactoryReset}
              handleExportAllData={handleExportAllData}
              handleImportAllData={handleImportAllData}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
