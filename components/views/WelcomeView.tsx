import type React from "react"
import { motion } from "framer-motion"
import { Sparkles, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeViewProps {
  onDismiss: () => void
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onDismiss, isDarkMode, toggleDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card text-card-foreground p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 space-y-6"
      >
        <div className="flex items-center space-x-3">
          <Sparkles className="text-accent" size={24} />
          <h2 className="text-lg font-semibold">welcome to aha!</h2>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>capture what you're learning, right as you learn it.</p>
          <p>don't worry, everything is stored locally on device.</p>
        </div>
        
        <div className="flex items-center justify-between p-4 -m-2 bg-muted/50 rounded-lg">
          <label htmlFor="darkModeToggle" className="text-sm">
            {isDarkMode ? "switch to light mode?" : "switch to dark mode?"}
          </label>
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

        <div className="flex justify-end">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-card"
          >
            get started
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WelcomeView 