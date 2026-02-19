export default function QueueRow({
  row,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(row._id)}
        />
      </td>

      <td className="px-3 py-2">{row.email}</td>

      <td className="px-3 py-2">
        {row.subject || "—"}
      </td>

      <td className="px-3 py-2 capitalize text-sm">
        {row.status}
      </td>

      <td className="px-3 py-2 text-right space-x-2">
        <button
          onClick={onPreview}
          className="text-xs px-2 py-1 bg-gray-100 rounded"
        >
          Preview
        </button>

        <button
          onClick={onEdit}
          className="text-xs px-2 py-1 bg-indigo-100 rounded"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
