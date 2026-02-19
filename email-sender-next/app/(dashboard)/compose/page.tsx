
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GmailEditor from "@/components/GmailEditor";
import AttachmentBar from "@/components/AttachmentBar";
import ScheduleModal from "@/components/ScheduleModal";
import Button from "@/components/Button";
import { api } from "@/lib/api";

const toast = (msg: string) => {
    const el = document.createElement("div");
    el.innerText = msg;
    el.className =
        "fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow z-50 text-sm";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
};

function ComposeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [to, setTo] = useState("");
    const [cc, setCc] = useState("");
    const [bcc, setBcc] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [footer, setFooter] = useState("");
    const [files, setFiles] = useState<any[]>([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load template if present in query params
    useEffect(() => {
        const templateId = searchParams.get("templateId");
        if (templateId) {
            api(`/templates/${templateId}`).then((t) => {
                setSubject(t.subject);
                setBody(t.html);
                // setFooter(t.footer || ""); // If template has footer
            }).catch(console.error);
        }
    }, [searchParams]);

    /* ================= AUTO SIGNATURE ================= */
    useEffect(() => {
        const sig = localStorage.getItem("email_signature");
        if (sig) setFooter(sig);
    }, []);

    useEffect(() => {
        if (footer) localStorage.setItem("email_signature", footer);
    }, [footer]);

    /* ================= CTRL / CMD + ENTER ================= */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                sendNow();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    });

    /* ================= VALIDATION ================= */
    const validate = () => {
        if (!to || !subject || !body) {
            toast("To, Subject & Body required");
            return false;
        }
        return true;
    };

    /* ================= CLOSE COMPOSE (GMAIL STYLE) ================= */
    const closeCompose = () => {
        router.back();
    };

    /* ================= SEND NOW ================= */
    const sendNow = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            // 1️⃣ create campaign
            const { id } = await api("/campaigns", {
                method: "POST",
                body: { subject, html: body, footer },
            });

            // 2️⃣ add recipient to campaign
            await api(`/campaigns/${id}/recipients`, {
                method: "POST",
                body: { emails: [to] },
            });

            // 3️⃣ send now
            await api(`/campaigns/${id}/send-now`, { method: "POST" });

            toast("Message sent");
            closeCompose();
        } catch (err) {
            console.error(err);
            toast("Send failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= SAVE DRAFT ================= */
    const saveDraft = async () => {
        try {
            setLoading(true);
            await api("/email/draft", {
                method: "POST",
                body: { email: to, cc, bcc, subject, html: body, footer },
            });
            toast("Draft saved");
            closeCompose();
        } catch {
            toast("Draft save failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= SCHEDULE ================= */
    const scheduleMail = async (scheduledAt: string) => {
        if (!validate()) return;
        try {
            setLoading(true);
            const { id } = await api("/campaigns", {
                method: "POST",
                body: { subject, html: body, footer },
            });

            await api(`/campaigns/${id}/recipients`, {
                method: "POST",
                body: { emails: [to] },
            });

            await api(`/campaigns/${id}/schedule`, {
                method: "POST",
                body: { scheduledAt: new Date(scheduledAt).toISOString() },
            });

            toast("Message scheduled");
            closeCompose();
        } catch (err) {
            console.error(err);
            toast("Schedule failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-6 bg-white border rounded-xl shadow">
            {/* HEADER */}
            <div className="px-6 py-3 border-b font-medium text-sm flex justify-between">
                <span>New Message</span>
                <button onClick={closeCompose}>✕</button>
            </div>

            {/* FIELDS */}
            <div className="p-6 space-y-4">
                <input
                    placeholder="To"
                    className="w-full border-b outline-none py-1"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                />

                <div className="flex gap-4 text-sm">
                    <input
                        placeholder="Cc"
                        className="flex-1 border-b outline-none py-1"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                    />
                    <input
                        placeholder="Bcc"
                        className="flex-1 border-b outline-none py-1"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                    />
                </div>

                <input
                    placeholder="Subject"
                    className="w-full border-b outline-none py-1"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <GmailEditor value={body} onChange={setBody} />

                <textarea
                    placeholder="Signature"
                    className="w-full border rounded p-2 text-sm"
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                />

                <AttachmentBar
                    files={files}
                    onRemove={(i: number) => setFiles((f) => f.filter((_, x) => x !== i))}
                />
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <div className="flex gap-2">
                    <Button
                        text={loading ? "Sending..." : "Send"}
                        onClick={sendNow}
                        disabled={loading}
                    />
                    <Button
                        text="Schedule"
                        variant="secondary"
                        onClick={() => setShowSchedule(true)}
                    />
                </div>

                <Button text="Save Draft" variant="secondary" onClick={saveDraft} />
            </div>

            <ScheduleModal
                open={showSchedule}
                onClose={() => setShowSchedule(false)}
                onDone={({ scheduledAt }: any) => scheduleMail(scheduledAt)}
            />
        </div>
    );
}

export default function Compose() {
    return (
        <Suspense fallback={<div className="p-6">Loading editor...</div>}>
            <ComposeContent />
        </Suspense>
    );
}
