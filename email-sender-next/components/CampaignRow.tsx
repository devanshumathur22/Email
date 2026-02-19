
import React, { useRef, useEffect } from "react";
import {
    MoreVertical,
    Trash,
    Send,
    Clock,
    BarChart2,
    Eye,
    Pause,
    Play,
    AlertCircle
} from "lucide-react";

interface CampaignRowProps {
    campaign: any;
    open: boolean;
    onToggle: (e: React.MouseEvent) => void;
    onSend?: () => void;
    onDelete: () => void;
    onPreview: () => void;
    onAnalytics: () => void;
    onSchedule?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onRetry?: () => void;
}

export default function CampaignRow({
    campaign,
    open,
    onToggle,
    onSend,
    onDelete,
    onPreview,
    onAnalytics,
    onSchedule,
    onPause,
    onResume,
    onRetry,
}: CampaignRowProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // Should ideally call a close function, but here we rely on parent toggle logic if open matches id
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    const isDraft = campaign.status === "draft";
    const isSending = campaign.status === "sending";
    const isPaused = campaign.paused; // Might be a boolean field
    const isFailed = campaign.status === "failed" || (campaign.failureCount > 0 && isDraft === false);

    const total = campaign.totalRecipients || campaign.queueCount || 0;
    const success = campaign.successCount || 0;
    const failure = campaign.failureCount || 0;
    const pending = total - success - failure;
    const done = success + failure;

    const progress = total > 0 ? (done / total) * 100 : 0;

    return (
        <tr className="group border-b border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all relative">
            <td className="w-12 px-4 py-3 text-center">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
            </td>

            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800 text-sm truncate max-w-[200px] md:max-w-xs" title={campaign.subject}>
                        {campaign.subject || "(No Subject)"}
                    </span>
                    <span className="text-xs text-gray-500">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </td>

            <td className="px-4 py-3 align-middle">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${isDraft ? "bg-gray-100 text-gray-600" :
                        isSending ? "bg-blue-50 text-blue-700" :
                            campaign.status === 'sent' ? "bg-green-50 text-green-700" :
                                "bg-red-50 text-red-700"}`}>
                    {isPaused ? "Paused" : campaign.status}
                </span>
            </td>

            <td className="px-4 py-3 align-middle w-48">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isFailed ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono w-12 text-right">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
                    <span>Scan: {total}</span>
                    {success > 0 && <span className="text-green-600">✓ {success}</span>}
                    {failure > 0 && <span className="text-red-600">✗ {failure}</span>}
                </div>
            </td>

            <td className="px-4 py-3 text-right" ref={ref}>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                    <button onClick={onPreview} className="p-2 hover:bg-gray-200 rounded-full text-gray-600" title="Preview">
                        <Eye size={18} />
                    </button>
                    <button onClick={onAnalytics} className="p-2 hover:bg-gray-200 rounded-full text-gray-600" title="Analytics">
                        <BarChart2 size={18} />
                    </button>

                    <button
                        onClick={onToggle}
                        className={`p-2 hover:bg-gray-200 rounded-full text-gray-600 ${open ? "bg-gray-200" : ""}`}
                        title="More Options"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>

                {open && (
                    <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left origin-top-right transform transition-all">
                        {isDraft && (
                            <>
                                <button onClick={() => { onSend && onSend(); }} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                    <Send size={14} /> Send Now
                                </button>
                                <button onClick={() => { onSchedule && onSchedule(); }} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                    <Clock size={14} /> Schedule
                                </button>
                            </>
                        )}

                        {isSending && onPause && !isPaused && (
                            <button onClick={onPause} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-orange-600 flex items-center gap-2">
                                <Pause size={14} /> Pause Campaign
                            </button>
                        )}

                        {isPaused && onResume && (
                            <button onClick={onResume} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-green-600 flex items-center gap-2">
                                <Play size={14} /> Resume Campaign
                            </button>
                        )}

                        {isFailed && onRetry && (
                            <button onClick={onRetry} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-orange-600 flex items-center gap-2">
                                <AlertCircle size={14} /> Retry Failed
                            </button>
                        )}

                        <div className="border-t my-1 border-gray-100"></div>

                        <button onClick={onDelete} className="w-full px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2">
                            <Trash size={14} /> Delete
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}
