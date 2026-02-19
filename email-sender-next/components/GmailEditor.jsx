import { useRef, useEffect } from "react"

export default function GmailEditor({ value, onChange }) {
  const ref = useRef()

  /* ================= COMMAND EXEC ================= */
  const exec = (cmd, val = null) => {
    ref.current.focus()
    document.execCommand(cmd, false, val)
    onChange(ref.current.innerHTML)
  }

  /* ================= KEEP VALUE IN SYNC ================= */
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ""
    }
  }, [value])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex gap-2 border-b px-3 py-2 bg-gray-50 text-sm">
        <button onClick={() => exec("bold")} className="font-bold">B</button>
        <button onClick={() => exec("italic")} className="italic">I</button>
        <button onClick={() => exec("underline")} className="underline">U</button>

        <button onClick={() => exec("insertUnorderedList")}>• List</button>
        <button onClick={() => exec("insertOrderedList")}>1. List</button>

        <button
          onClick={() => {
            const url = prompt("Enter link")
            if (url) exec("createLink", url)
          }}
        >
          🔗 Link
        </button>

        <button onClick={() => exec("removeFormat")}>✖ Clear</button>
      </div>

      {/* EDITOR */}
      <div
        ref={ref}
        contentEditable
        className="min-h-[220px] p-4 outline-none text-sm"
        placeholder="Write your email…"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />

      {/* PLACEHOLDER */}
      {!value && (
        <div className="pointer-events-none absolute mt-[-200px] ml-4 text-gray-400 text-sm">
          Write your email…
        </div>
      )}
    </div>
  )
}
