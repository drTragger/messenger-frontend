import i18n from '@/utils/i18n';
import {formatReadAt} from "@/utils/formatTime";

export function myMessageContextMenuItems(message, context) {
    return [
        {
            label: message?.readAt ? formatReadAt(message.readAt) : formatReadAt(message.createdAt),
            icon: message?.readAt ? "pi pi-check-circle" : "pi pi-check",
            disabled: true,
        },
        {
            separator: true,
        },
        {
            label: i18n.global.t("chat.contextMenu.reply"),
            icon: "pi pi-reply",
            command: () => context.replyToMessage(message),
        },
        {
            label: i18n.global.t("chat.contextMenu.copy"),
            icon: "pi pi-copy",
            command: () => copyToClipboard(message.content),
        },
        {
            label: i18n.global.t("chat.contextMenu.edit"),
            icon: "pi pi-pencil",
            command: () => context.prepareForEdit(message),
        },
        {
            separator: true,
        },
        {
            label: i18n.global.t("chat.contextMenu.delete"),
            icon: "pi pi-trash",
            color: "#ff595a",
            command: () => context.deleteMessage(message),
        }
    ];
}

export function partnerMessageContextMenuItems(message, context) {
    return [
        {
            label: i18n.global.t("chat.contextMenu.reply"),
            icon: "pi pi-reply",
            command: () => context.replyToMessage(message),
        },
        {
            label: i18n.global.t("chat.contextMenu.copy"),
            icon: "pi pi-copy",
            command: () => copyToClipboard(message.content),
        },
    ];
}

function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling to the bottom
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            console.log("Fallback: Text copied to clipboard");
        } catch (err) {
            console.error("Fallback: Unable to copy text", err);
        }
        document.body.removeChild(textArea);
        return;
    }

    // Modern method using Clipboard API
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log("Text copied to clipboard");
        })
        .catch(err => {
            console.error("Failed to copy text to clipboard", err);
        });
}