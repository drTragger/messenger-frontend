class WebSocketManager {
    constructor(url, token) {
        if (!WebSocketManager.instance) {
            this.url = url;
            this.token = token;
            this.socket = null;
            this.messageHandlers = [];
            this.isConnected = false;
            this.reconnectAttempts = 0; // Track reconnect attempts
            this.maxReconnectAttempts = 5; // Maximum reconnect attempts
            this.reconnectInterval = 3000; // Interval between reconnect attempts (in ms)
            WebSocketManager.instance = this;
        }
        return WebSocketManager.instance;
    }

    connect() {
        if (this.socket && this.isConnected) return;

        const wsUrl = `${this.url}?token=${this.token}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach((handler) => handler(data));
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = (event) => {
            this.isConnected = false;
            this.socket = null;

            // Reconnect only if the closure was unexpected
            if (!event.wasClean) {
                console.warn(`WebSocket closed unexpectedly: Code ${event.code}, Reason: ${event.reason}`);
                this.scheduleReconnect();
            } else {
                console.log("WebSocket closed cleanly");
            }
        };
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnect attempts reached. Giving up.");
            return;
        }

        this.reconnectAttempts += 1;

        console.log(`Reconnect attempt ${this.reconnectAttempts} in ${this.reconnectInterval}ms`);

        setTimeout(() => {
            console.log("Attempting to reconnect...");
            this.connect();
        }, this.reconnectInterval);
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    }

    sendMessage(message) {
        if (this.isConnected) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket is not connected. Message not sent:", message);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, "Client disconnected"); // Close cleanly with code 1000
            this.socket = null;
            this.isConnected = false;
            this.reconnectAttempts = 0; // Reset reconnect attempts
        }
    }
}

// Export a function to get the singleton instance
let webSocketManagerInstance = null;

export function getWebSocketManager(url, token) {
    if (!webSocketManagerInstance) {
        webSocketManagerInstance = new WebSocketManager(url, token);
    }
    if (webSocketManagerInstance.token !== token) {
        webSocketManagerInstance.disconnect();
        webSocketManagerInstance.token = token;
    }
    return webSocketManagerInstance;
}

export const WebSocketEvents = Object.freeze({
    NEW_MESSAGE: "newMessage",
    EDIT_MESSAGE: "editMessage",
    DELETE_MESSAGE: "deleteMessage",
    READ_MESSAGE: "readMessage",
    USER_STATUS_CHANGE: "statusChange",
});