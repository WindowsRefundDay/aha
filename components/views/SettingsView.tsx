"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, AlertTriangle, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { viewTransitionVariants } from "@/lib/animations"

// Define a more specific type for AccentColor if it's simple enough, otherwise 'any' or a broader type
interface AccentColor {
  name: string;
  key: string;
  hsl: string;
  fgHsl: string;
  previewClass: string;
  ringClass: string; 
}

interface SettingsViewProps {
  setView: (view: "capture" | "history" | "detail" | "focusNote" | "settings") => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  ACCENT_COLORS: AccentColor[];
  selectedAccentKey: string;
  handleAccentColorChange: (key: string) => void;
  showClearNotesDialog: boolean;
  setShowClearNotesDialog: (show: boolean) => void;
  notesClearedMessageVisible: boolean;
  handleClearAllNotesFromSettings: () => void;
  // isMounted: boolean; // We'll assume the parent handles ensuring this view only renders when appropriate
}

const SettingsView: React.FC<SettingsViewProps> = ({
  setView,
  isDarkMode,
  toggleDarkMode,
  ACCENT_COLORS,
  selectedAccentKey,
  handleAccentColorChange,
  showClearNotesDialog,
  setShowClearNotesDialog,
  notesClearedMessageVisible,
  handleClearAllNotesFromSettings,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full min-h-screen p-4 flex flex-col"
    >
      <div className="flex items-center mb-6">
        <button onClick={() => setView("capture")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">settings</h1>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">theme</h2>
          <div className="flex items-center justify-between bg-card border rounded-md p-3">
            <label htmlFor="dark-mode" className="text-sm">
              dark mode
            </label>
            <button onClick={toggleDarkMode} className="relative">
              <Sun className={`w-5 h-5 transition-transform duration-300 ${isDarkMode ? "rotate-90 scale-0" : "rotate-0 scale-100"}`} />
              <Moon className={`w-5 h-5 absolute top-0 left-0 transition-transform duration-300 ${isDarkMode ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
            </button>
          </div>
        </div>

        {/* Accent Color Settings */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">accent color</h2>
          <div className="grid grid-cols-4 gap-3 bg-card border rounded-md p-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.key}
                onClick={() => handleAccentColorChange(color.key)}
                className={`flex items-center justify-center p-2 rounded-md transition-all duration-200 ${selectedAccentKey === color.key ? `ring-2 ${color.ringClass}` : ""}`}
              >
                <div className={`w-6 h-6 rounded-full ${color.previewClass}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">data management</h2>
          <button
            onClick={() => setShowClearNotesDialog(true)}
            className="w-full flex items-center justify-center p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-colors duration-200"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm">factory reset</span>
          </button>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            this will permanently delete all notes and reset all settings.
          </p>
        </div>
      </div>

      {/* Spacer to push content up */}
      <div className="flex-grow" />

      {/* Version Number */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">
          version {process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </div>

      {/* Clear Notes Dialog */}
      <AnimatePresence>
        {showClearNotesDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="bg-card border rounded-lg p-6 w-full max-w-sm mx-4">
              <h3 className="text-lg font-bold text-center">are you sure?</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                this action cannot be undone. this will permanently delete all data.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowClearNotesDialog(false)}
                  className="px-4 py-2 rounded-md text-sm"
                >
                  cancel
                </button>
                <button
                  onClick={handleClearAllNotesFromSettings}
                  className="px-4 py-2 rounded-md text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  yes, reset everything
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {notesClearedMessageVisible && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm py-2 px-4 rounded-md"
              >
                  all notes have been cleared.
              </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SettingsView 