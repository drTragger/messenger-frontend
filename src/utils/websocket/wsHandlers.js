import {WebSocketEvents} from "@/utils/websocket/websocket";
import i18n from "@/utils/i18n";

export function chatPageWsHandler(context, data) {
    if (!data || !data.event) {
        console.warn("Invalid WebSocket data received:", data);
        return;
    }

    switch (data.event) {
        case WebSocketEvents.NEW_MESSAGE:
            handleCPNewMessage(context, data.message);
            break;

        case WebSocketEvents.EDIT_MESSAGE:
            handleCPEditMessage(context, data.message);
            break;

        case WebSocketEvents.DELETE_MESSAGE:
            handleCPDeleteMessage(context, data.message);
            break;

        case WebSocketEvents.READ_MESSAGE:
            handleCPReadMessage(context, data.message);
            break;

        case WebSocketEvents.USER_STATUS_CHANGE:
            handleCPUserStatusChange(context, data);
            break;

        default:
            console.warn(`Unhandled WebSocket event: ${data.event}`);
            break;
    }
}

async function handleCPNewMessage(context, message) {
    if (message?.chatId !== context.chatId) return;

    const container = context.$refs.messagesContainer;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;

    context.messages.push(message);

    await context.$nextTick(() => {
        if (isAtBottom) {
            context.scrollToBottom();
        }
    });
}

function handleCPEditMessage(context, message) {
    if (message?.chatId !== context.chatId) return;

    const index = context.messages.findIndex((m) => m.id === message.id);
    if (index !== -1) {
        context.messages[index] = {
            ...context.messages[index],
            content: message.content,
            updatedAt: message.updatedAt,
        };
    }
}

function handleCPDeleteMessage(context, message) {
    context.animateMessageDelete(message.deleted.id);
}

function handleCPReadMessage(context, message) {
    if (message?.chatId !== context.chatId && message?.senderId !== context.authStore.user.id) return;

    const index = context.messages.findIndex((m) => m.id === message.id);
    if (index !== -1) {
        context.messages[index] = {
            ...context.messages[index],
            readAt: message.readAt,
        };
    }
}

function handleCPUserStatusChange(context, {userId, isOnline, lastSeen}) {
    if (context.chatPartner?.id !== userId) return;

    context.chatPartner.isOnline = isOnline;
    context.chatPartner.lastSeen = lastSeen;
}

export function homePageWsHandler(context, data) {
    if (!data || !data.event) {
        console.warn("Invalid WebSocket data received:", data);
        return;
    }

    switch (data.event) {
        case WebSocketEvents.NEW_MESSAGE:
            handleHPNewMessage(context, data.message);
            break;

        case WebSocketEvents.EDIT_MESSAGE:
            handleHPEditMessage(context, data.message);
            break;

        case WebSocketEvents.DELETE_MESSAGE:
            handleHPDeleteMessage(context, data.message);
            break;

        case WebSocketEvents.READ_MESSAGE:
            handleHPReadMessage(context, data.message);
            break;

        case WebSocketEvents.USER_STATUS_CHANGE:
            handleHPUserStatusChange(context, data);
            break;

        default:
            console.warn(`Unhandled WebSocket event: ${data.event}`);
            break;
    }
}

function handleHPNewMessage(context, message) {
    if (!message?.chatId) return;

    const index = context.chats.findIndex((chat) => chat.id === message.chatId);

    if (index !== -1) {
        const updatedChat = {...context.chats[index]};
        updatedChat.lastMessage = message;
        updatedChat.updatedAt = message.createdAt;

        context.chats.splice(index, 1);
        context.chats.unshift(updatedChat);

        if (Notification.permission === 'granted' && context.$route.name !== 'ChatPage') {
            const notification = new Notification(i18n.global.t('chat.message.notification', {username: message.sender.username}), {
                body: message.content,
                icon: require('@/assets/logo.webp'),
                lang: i18n.global.locale.value,
            });

            notification.onclick = () => {
                context.$router.push({name: 'ChatPage', params: {chatId: message.chatId}});
                notification.close();
            };
        }
    } else {
        console.warn("Chat not found for new message:", message.chatId);
    }
}

function handleHPEditMessage(context, message) {
    if (!message?.chatId) return;

    const index = context.chats.findIndex((chat) => chat.id === message.chatId);

    if (index !== -1) {
        const updatedChat = {...context.chats[index]};

        // Update the lastMessage if it matches the edited message
        if (updatedChat.lastMessage?.id === message.id) {
            updatedChat.lastMessage = {
                ...updatedChat.lastMessage,
                content: message.content,
                updatedAt: message.updatedAt,
            };
            updatedChat.updatedAt = message.updatedAt;
        }


        context.chats.splice(index, 1);
        context.chats.unshift(updatedChat);
    } else {
        console.warn("Chat not found for edited message:", message.chatId);
    }
}

function handleHPDeleteMessage(context, message) {
    const chatIndex = context.chats.findIndex((chat) => chat.lastMessage?.id === message.deleted.id);

    if (chatIndex !== -1) {
        const updatedChat = {...context.chats[chatIndex]};

        updatedChat.lastMessage = message.last;

        context.chats.splice(chatIndex, 1);
        context.chats.unshift(updatedChat);
    }
}

function handleHPReadMessage(context, message) {
    const chatIndex = context.chats.findIndex((chat) => chat.lastMessage?.id === message.id);

    if (chatIndex !== -1) {
        const updatedChat = {...context.chats[chatIndex]};

        updatedChat.lastMessage.readAt = message.readAt;

        context.chats.splice(chatIndex, 1);
        context.chats.unshift(updatedChat);
    }
}

function handleHPUserStatusChange(context, message) {
    if (!message?.userId) return;

    context.chats.forEach((chat) => {
        if (chat.user1.id === message.userId) {
            chat.user1.isOnline = message.isOnline;
        }
        if (chat.user2.id === message.userId) {
            chat.user2.isOnline = message.isOnline;
        }
    });
}