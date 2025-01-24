// chatService.js
import apiClient from "@/utils/api";
import {authStore} from "@/utils/auth";

export async function fetchChatDetails(chatId, currentUserId) {
    const response = await apiClient.get(`/chats/${chatId}`, {
        headers: {Authorization: `Bearer ${authStore.token}`},
    });

    const chat = response.data.data;
    const chatPartner = chat.user1.id === currentUserId ? chat.user2 : chat.user1;

    const statusResponse = await apiClient.get(`/users/online/${chatPartner.id}`, {
        headers: {Authorization: `Bearer ${authStore.token}`},
    });

    if (statusResponse.data?.data) {
        chatPartner.isOnline = statusResponse.data.data.isOnline;
    }

    return chatPartner;
}

export async function fetchMessages(chatId, offset, limit) {
    const response = await apiClient.get(`/chats/${chatId}/messages`, {
        params: {limit, offset},
        headers: {Authorization: `Bearer ${authStore.token}`},
    });

    return response.data.data;
}

export async function sendMessageApi(chatId, messagePayload, files = []) {
    const formData = new FormData();

    formData.append("content", messagePayload.content);
    formData.append("recipientId", messagePayload.recipientId);
    formData.append("parentId", messagePayload?.parentId || '0');

    files.forEach((file) => {
        formData.append("attachments", file);
    });

    return await apiClient.post(`/chats/${chatId}/messages`, formData, {
        headers: {
            Authorization: `Bearer ${authStore.token}`,
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function editMessageApi(chatId, messageId, messagePayload) {
    return await apiClient.patch(`/chats/${chatId}/messages/${messageId}`, messagePayload, {
        headers: {Authorization: `Bearer ${authStore.token}`},
    });
}

export async function deleteMessageApi(chatId, messageId) {
    return await apiClient.delete(`/chats/${chatId}/messages/${messageId}`, {
        headers: {Authorization: `Bearer ${authStore.token}`},
    });
}

export function animateMessageDelete(messageId, context) {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
        messageElement.classList.add("fade-out");
        setTimeout(() => {
            context.messages = context.messages.filter((msg) => msg.id !== messageId);
        }, 300);
    }
}

export async function markMessageAsReadApi(chatId, messageId) {
    return await apiClient.patch(`/chats/${chatId}/messages/${messageId}/read`, null, {
        headers: {Authorization: `Bearer ${authStore.token}`},
    });
}