import type React from "react"
import { motion } from "framer-motion"

interface WelcomeViewProps {
  onDismiss: () => void
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="bg-card border rounded-lg p-6 w-full max-w-sm mx-4 text-center">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>capture what you're learning, right as you learn it.</p>
          <p>
            don't worry, everything is stored locally on device.
          </p>
          <p>
            just try everything out, this is just a test on whether it is useful or not.
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 w-full"
          >
            get started
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WelcomeView 