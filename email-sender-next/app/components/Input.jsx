export default function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
