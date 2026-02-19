export default function AttachmentBar({ files, onRemove }) {
  if (!files.length) return null

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {files.map((f, i) => (
        <div
          key={i}
          className="px-3 py-1 bg-gray-100 rounded text-sm flex items-center gap-2"
        >
          📎 {f.name}
          <button onClick={() => onRemove(i)}>✕</button>
        </div>
      ))}
    </div>
  )
}
