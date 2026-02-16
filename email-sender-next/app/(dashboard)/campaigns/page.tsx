
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import CampaignRow from "@/components/CampaignRow";
import ContactSelector from "@/components/ContactSelector";
import TemplatePicker from "@/components/TemplatePicker";
import CampaignAnalytics from "@/components/CampaignAnalytics";
import CampaignPreviewModal from "@/components/CampaignPreviewModal";
import CampaignScheduleModal from "@/components/CampaignScheduleModal";

export default function Campaigns() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const [showTemplates, setShowTemplates] = useState(false);
    const [previewCampaign, setPreviewCampaign] = useState(null);
    const [analyticsCampaign, setAnalyticsCampaign] = useState(null);

    const [showContacts, setShowContacts] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
    const [scheduleCampaign, setScheduleCampaign] = useState<any>(null);

    /* ================= LOAD ================= */
    const load = async () => {
        try {
            const data = await api("/campaigns");
            setCampaigns(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // 🔥 auto refresh ONLY when no modal is open
    useEffect(() => {
        if (
            previewCampaign ||
            analyticsCampaign ||
            showContacts ||
            scheduleCampaign
        )
            return;

        const i = setInterval(load, 5000);
        return () => clearInterval(i);
    }, [previewCampaign, analyticsCampaign, showContacts, scheduleCampaign]);

    // 🔥 outside click close menu
    useEffect(() => {
        const close = () => setOpenMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    /* ================= ACTIONS ================= */

    const deleteCampaign = async (id: string) => {
        if (!confirm("Delete campaign?")) return;
        try {
            await api(`/campaigns/${id}`, { method: "DELETE" });
            setOpenMenu(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const sendCampaign = async (campaign: any) => {
        setOpenMenu(null);

        const total = campaign.totalRecipients || campaign.queueCount || 0;

        if (total > 0) {
            try {
                await api(`/campaigns/${campaign._id}/send-now`, {
                    method: "POST",
                });
                load();
            } catch (err) {
                console.error(err);
            }
            return;
        }

        // manual draft only
        setSelectedCampaign(campaign._id);
        setShowContacts(true);
    };

    const attachAndSend = async ({ contactIds, groupIds }: any) => {
        try {
            await api(`/campaigns/${selectedCampaign}/recipients/save`, {
                method: "POST",
                body: {
                    contactIds,
                    groupIds,
                    excludeContactIds: [],
                },
            });

            await api(`/campaigns/${selectedCampaign}/send-now`, {
                method: "POST",
            });

            setShowContacts(false);
            setSelectedCampaign(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const saveSchedule = async ({ time }: any) => {
        try {
            await api(`/campaigns/${scheduleCampaign._id}/reschedule`, {
                method: "PATCH",
                body: {
                    scheduledAt: new Date(time).toISOString(),
                },
            });

            setScheduleCampaign(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTemplateSelect = (template: any) => {
        router.push(`/compose?templateId=${template._id}`);
    };

    /* ================= FILTER ================= */
    const filtered = campaigns.filter((c) => {
        const matchText = c.subject
            ?.toLowerCase()
            .includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "all" || c.status === statusFilter;
        return matchText && matchStatus;
    });

    /* ================= UI ================= */
    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
                <button
                    onClick={() => setShowTemplates(true)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                    + New Campaign
                </button>
            </div>

            {/* FILTER */}
            <div className="flex gap-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subject..."
                    className="px-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Progress</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No campaigns found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <CampaignRow
                                        key={c._id}
                                        campaign={c}
                                        open={openMenu === c._id}
                                        onToggle={(e: any) => {
                                            e.stopPropagation();
                                            setOpenMenu(openMenu === c._id ? null : c._id);
                                        }}
                                        onSend={() => sendCampaign(c)}
                                        onDelete={() => deleteCampaign(c._id)}
                                        onPreview={() => setPreviewCampaign(c)}
                                        onAnalytics={() => setAnalyticsCampaign(c)}
                                        onSchedule={
                                            c.status === "draft" || c.status === "pending"
                                                ? () => setScheduleCampaign(c)
                                                : undefined
                                        }
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            {scheduleCampaign && (
                <CampaignScheduleModal
                    campaign={scheduleCampaign}
                    onClose={() => setScheduleCampaign(null)}
                    onSave={saveSchedule}
                />
            )}

            {showContacts && (
                <ContactSelector
                    onSelect={attachAndSend}
                    onClose={() => setShowContacts(false)}
                />
            )}

            {previewCampaign && (
                <CampaignPreviewModal
                    campaign={previewCampaign}
                    onClose={() => setPreviewCampaign(null)}
                />
            )}

            {analyticsCampaign && (
                <CampaignAnalytics
                    campaign={analyticsCampaign}
                    onClose={() => setAnalyticsCampaign(null)}
                />
            )}

            {showTemplates && (
                <TemplatePicker
                    onSelect={handleTemplateSelect}
                    onClose={() => setShowTemplates(false)}
                />
            )}
        </div>
    );
}
