import type { WebSocket as WS } from 'ws';

type MessageListener = (message: any) => void;
type ConnectionStatusListener = (status: boolean) => void;

const getWebSocketUrl = () => {
  const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
  console.log('Configured WebSocket URL:', wsUrl);

  if (wsUrl) {
    return wsUrl;
  }

  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const devUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Development WebSocket URL:', devUrl);
    return devUrl;
  }

  // For production, use secure WebSocket with API key
  const protocol = 'wss:'; // Always use secure in production
  const apiKey = import.meta.env.VITE_WEBSOCKET_API_KEY;
  const prodUrl = `${protocol}//${import.meta.env.VITE_API_URL}/ws?apiKey=${apiKey}`;
  console.log('Production WebSocket URL (without API key):', prodUrl.replace(apiKey || '', '[REDACTED]'));
  return prodUrl;
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: MessageListener[] = [];
  private statusListeners: ConnectionStatusListener[] = [];
  private reconnectInterval: number = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnecting: boolean = false;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;

  public getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.socket) return 'disconnected';
    return this.socket.readyState === WebSocket.OPEN ? 'connected' : 'connecting';
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    if (this.socket?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket connection in progress');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('Attempting WebSocket connection to:', wsUrl);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connection established successfully');
        console.log('WebSocket readyState:', this.socket?.readyState);
        this.notifyStatusListeners(true);
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.reconnecting = false;
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          readyState: this.socket?.readyState
        });
        this.notifyStatusListeners(false);
        if (!this.reconnecting) {
          this.setupReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        console.log('WebSocket readyState on error:', this.socket?.readyState);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message.type);
          this.notifyMessageListeners(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.setupReconnect();
    }
  }

  private setupReconnect(): void {
    if (this.reconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached or already reconnecting');
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    this.messageListeners = [];
    this.statusListeners = [];
  }

  public onMessage(callback: MessageListener): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  public onConnectionStatus(callback: ConnectionStatusListener): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  private notifyMessageListeners(message: any): void {
    this.messageListeners.forEach((listener) => listener(message));
  }

  private notifyStatusListeners(status: boolean): void {
    this.statusListeners.forEach((listener) => listener(status));
  }

  public send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const stringifiedMessage = JSON.stringify(message);
      console.log('Sending WebSocket message:', message.type);
      this.socket.send(stringifiedMessage);
    } else {
      console.warn('WebSocket not connected, attempting reconnection. Message queued:', message.type);
      this.connect();
    }
  }

  // Helper methods for different message types
  public sendMessage(message: {
    content: string;
    senderId: string;
    receiverId?: string;
    groupId?: number;
    replyToId?: string;
  }): void {
    this.send({
      type: 'message',
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  public sendTypingIndicator(data: {
    userId: string;
    receiverId?: string;
    groupId?: number;
    isTyping: boolean;
  }): void {
    this.send({
      type: 'typing',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public sendPresenceUpdate(data: {
    userId: string;
    isOnline: boolean;
  }): void {
    this.send({
      type: 'presence',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export const websocketService = new WebSocketService();