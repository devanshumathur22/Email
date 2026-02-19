import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function PreviewModal({ item, onClose }) {
  const boxRef = useRef(null)

  // ESC key close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // outside click close
  const handleOutsideClick = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      onClose()
    }
  }

  if (!item) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={handleOutsideClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={boxRef}
        className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-y-auto p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Email Preview</h2>

        <div className="text-sm mb-3">
          <b>To:</b> {item.email}
        </div>

        <div className="text-sm mb-4">
          <b>Subject:</b> {item.subject}
        </div>

        <div className="border rounded-lg p-4 text-sm bg-gray-50">
          {item.body || item.html ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: item.body || item.html,
              }}
            />
          ) : (
            <div className="text-gray-400 italic">
              No email body found
            </div>
          )}
        </div>

        {item.footer && (
          <div className="mt-4 text-xs text-gray-500 border-t pt-3">
            <div
              dangerouslySetInnerHTML={{ __html: item.footer }}
            />
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
