export function isImage(file) {
    return file?.file?.type?.startsWith("image/") || file?.fileType?.startsWith("image/");
}

export function isVideo(file) {
    return file?.file?.type?.startsWith("video/") || file?.fileType?.startsWith("video/");
}

export function generateFilePreview(file) {
    const fileIcons = {
        "application/pdf": require('@/assets/pictures/file-icons/pdf.png'),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": require('@/assets/pictures/file-icons/docx.png'),
        "application/msword": require('@/assets/pictures/file-icons/doc.png'),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": require('@/assets/pictures/file-icons/xlsx.png'),
        "application/vnd.ms-excel": require('@/assets/pictures/file-icons/xls.png'),
        "text/plain": require('@/assets/pictures/file-icons/txt.png'),
    };

    if (file?.type in fileIcons || file?.fileType in fileIcons) {
        return fileIcons[file?.type || file?.fileType];
    }

    return require('@/assets/pictures/file-icons/default.png');
}

export function truncateFileName(fileName, maxLength = 30) {
    if (fileName.length > maxLength) {
        const ext = fileName.split('.').pop(); // Get file extension
        const baseName = fileName.slice(0, fileName.lastIndexOf('.')); // Get the file name without extension
        const charsToShow = maxLength - ext.length - 3; // Subtract space for dots and extension
        const startChars = Math.ceil(charsToShow / 2); // Characters to show from the start
        const endChars = Math.floor(charsToShow / 2); // Characters to show from the end

        return `${baseName.slice(0, startChars)}...${baseName.slice(-endChars)}.${ext}`;
    }
    return fileName;
}

export function formatFileSize(size) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    const formattedSize = size % 1 === 0 ? size.toFixed(0) : size.toFixed(1);

    return `${formattedSize} ${units[i]}`;
}

export function getAttachmentUrl(attachment, message) {
    return `${process.env.VUE_APP_API_URL}/chats/${message.chatId}/messages/${message.id}/attachments/${attachment.filePath}`;
}