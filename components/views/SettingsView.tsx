"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, AlertTriangle, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { viewTransitionVariants } from "@/lib/animations"
import { useRef } from "react"

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
  handleAccentColorChange: (colorKey: string) => void;
  showClearNotesDialog: boolean;
  setShowClearNotesDialog: (show: boolean) => void;
  notesClearedMessageVisible: boolean;
  handleClearAllNotesFromSettings: () => void;
  handleExportAllData: () => void;
  handleImportAllData: (file: File) => void;
  // isMounted: boolean; // We'll assume the parent handles ensuring this view only renders when appropriate
}

export default function SettingsView({
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
  handleExportAllData,
  handleImportAllData,
}: SettingsViewProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      key="settings"
      variants={viewTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col p-6 min-h-screen flex-grow"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => setView("capture")} className="flex items-center text-muted-foreground hover:text-accent">
          <ChevronLeft size={18} />
          <span className="ml-1 text-sm">back</span>
        </button>
        <h1 className="text-xl font-normal lowercase">settings</h1>
        <div className="w-16"></div> {/* Spacer */}
      </header>

      <main className="space-y-10 flex-grow">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card text-card-foreground rounded-lg shadow-sm">
              <label htmlFor="darkModeToggle" className="text-sm">dark mode</label>
              <button
                id="darkModeToggle"
                onClick={toggleDarkMode}
                className={cn(
                  "relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-card",
                  isDarkMode ? "bg-accent" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out",
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  )}
                />
                {isDarkMode ? 
                  <Moon size={12} className="absolute right-1.5 text-accent-foreground" /> : 
                  <Sun size={12} className="absolute left-1.5 text-muted-foreground" />
                }
              </button>
            </div>

            <div className="p-4 bg-card text-card-foreground rounded-lg shadow-sm">
              <h3 className="text-sm mb-3">accent color</h3>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.key}
                    title={color.name}
                    onClick={() => handleAccentColorChange(color.key)}
                    className={cn(
                      "w-8 h-8 rounded-full focus:outline-none transition-all duration-150",
                      color.previewClass,
                      selectedAccentKey === color.key ? 
                        `ring-2 ring-offset-2 dark:ring-offset-card ring-accent` :
                        "hover:opacity-80"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">data management</h2>
          <div className="p-4 bg-card text-card-foreground rounded-lg shadow-sm space-y-3">
            <input
              type="file"
              accept=".json"
              ref={importInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImportAllData(e.target.files[0]);
                }
                e.target.value = "";
              }}
              hidden
            />
            <button
              onClick={() => importInputRef.current?.click()}
              className="w-full px-4 py-2.5 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-card transition-colors"
            >
              import all data
            </button>
            <button
              onClick={handleExportAllData}
              className="w-full px-4 py-2.5 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-card transition-colors"
            >
              export all data
            </button>
            <button
              onClick={() => setShowClearNotesDialog(true)}
              className="w-full px-4 py-2.5 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 dark:focus:ring-offset-card transition-colors"
            >
              factory reset
            </button>
             <p className="text-xs text-muted-foreground mt-2 px-1 text-center">
                this will permanently delete all notes and reset all settings.
            </p>
          </div>
        </section>
      </main>
      
      <footer className="text-center pb-4">
        <p className="text-xs text-muted-foreground">
          version {process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </footer>

      <AnimatePresence>
        {showClearNotesDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowClearNotesDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card text-card-foreground p-6 rounded-xl shadow-xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center">
                <AlertTriangle className="text-destructive mr-3" size={24} />
                <h2 className="text-lg font-semibold">are you sure?</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                this will permanently delete all your data. this action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearNotesDialog(false)}
                  className="px-4 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-card"
                >
                  cancel
                </button>
                <button
                  onClick={handleClearAllNotesFromSettings}
                  className="px-4 py-2 text-sm font-medium rounded-md text-destructive-foreground bg-destructive hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 dark:focus:ring-offset-card"
                >
                  yes, reset everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 