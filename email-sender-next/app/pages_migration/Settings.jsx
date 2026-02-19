import { useState } from "react";
import { api } from "../api";
import Button from "../components/Button";

export default function Settings() {
  const [form, setForm] = useState({
    host: "smtp.gmail.com",
    port: "587", // string rakha input ke liye
    user: "",
    pass: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveSMTP = async () => {
  setLoading(true);
  setMessage(null);

  // Validation
  if (!form.host.trim() || !form.port.trim() || !form.user.trim() || !form.pass.trim()) {
    setMessage({
      type: "error",
      text: "Sab fields bhar do",
    });
    setLoading(false);
    return;
  }

  // Payload object bhej (stringify mat kar – api.js karega)
  const payload = {
    host: form.host.trim(),
    port: Number(form.port.trim()),
    user: form.user.trim(),
    pass: form.pass.trim(),
  };

  console.log("Sending payload:", payload); // check karega

  try {
    await api("/smtp", {
      method: "POST",
      body: payload, // ← object direct (no JSON.stringify)
    });

    setMessage({
      type: "success",
      text: "✅ SMTP saved & verified!",
    });

    setForm({ ...form, pass: "" });
  } catch (err) {
    console.error("SMTP error:", err);
    setMessage({
      type: "error",
      text: err.message || "SMTP save failed – check console/network",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">SMTP Settings</h1>

      <p className="text-sm text-gray-600">
        Configure your email SMTP. Emails will be sent from this address.
      </p>

      {message && (
        <div
          className={`p-4 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <input
          name="host"
          placeholder="SMTP Host"
          value={form.host}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="port"
          type="number"
          placeholder="SMTP Port (587 or 465)"
          value={form.port}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="user"
          placeholder="Email (SMTP User)"
          value={form.user}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="pass"
          type="password"
          placeholder="App Password"
          value={form.pass}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <Button
        text={loading ? "Verifying..." : "Save & Verify SMTP"}
        onClick={saveSMTP}
        disabled={loading}
      />

      <div className="text-xs text-gray-500 mt-4">
        ⚠️ Gmail users must use <b>App Password</b>, not normal password.
      </div>
    </div>
  );
}