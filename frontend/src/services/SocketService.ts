// src/services/SocketService.ts
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { Location } from '../types/session.types';

class SocketService {
  public socket: any | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  // Dynamic server URL based on platform and environment
  private getServerUrl(): string {
    // Get server config from environment variables with fallbacks
    const SERVER_HOST = process.env.EXPO_PUBLIC_SERVER_HOST;
    const SERVER_PORT = process.env.EXPO_PUBLIC_SERVER_PORT || "3000";
    
    if (__DEV__) {
      // Development mode
      if (Platform.OS === 'android') {
        // For Android devices, use configured host or auto-detection
        const host = SERVER_HOST || this.getCurrentNetworkIP() || "10.0.2.2";
        return `http://${host}:${SERVER_PORT}`;
      } else if (Platform.OS === 'ios') {
        // For iOS simulator/device, use configured host or auto-detection
        const host = SERVER_HOST || this.getCurrentNetworkIP() || "localhost";
        return `http://${host}:${SERVER_PORT}`;
      } else {
        // Web/other platforms
        return `http://localhost:${SERVER_PORT}`;
      }
    } else {
      // Production mode - replace with your production server URL
      return process.env.EXPO_PUBLIC_PRODUCTION_SERVER_URL || "https://your-production-server.com";
    }
  }

  // Auto-detect current network IP (fallback method)
  private getCurrentNetworkIP(): string | null {
    try {
      // This is a simple fallback - in a real app you might want to use a more robust solution
      // For now, we'll return the environment variable or null
      return process.env.EXPO_PUBLIC_SERVER_HOST || null;
    } catch (error) {
      console.warn('Could not detect network IP:', error);
      return null;
    }
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const serverUrl = this.getServerUrl();
      console.log('🔗 Connecting to server:', serverUrl);
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to socket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🔴 Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinHangout(hangoutId: string) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot join hangout');
      return;
    }
    
    console.log('📍 Joining hangout:', hangoutId);
    this.socket?.emit('joinHangout', hangoutId);
  }

  // Notify other participants about new hangout
  notifyHangoutCreated(hangoutId: string, participantIds: string[]) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot notify hangout creation');
      return;
    }
    
    console.log('📢 Notifying hangout created:', hangoutId, participantIds);
    this.socket?.emit('hangoutCreated', { hangoutId, participantIds });
  }

  // Listen for hangout invitations
  onHangoutInvitation(listener: (data: { hangoutId: string }) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on('hangoutInvitation', (data: { hangoutId: string }) => {
      console.log('📨 Received hangout invitation:', data);
      listener(data);
    });
  }
  
  sendLocationUpdate(data: { hangoutId: string; userId: string; location: Location }) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot send location update');
      return;
    }
    
    console.log('📍 Sending location update:', data);
    this.socket?.emit('locationUpdate', data);
  }

  onNewLocationUpdate(listener: (data: { userId: string; location: Location }) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on('newLocationUpdate', (data: { userId: string; location: Location }) => {
      console.log('📍 Received location update:', data);
      listener(data);
    });
  }

  // NEW: Real-time chat (pure socket, no Firestore)
  sendMessage(data: { hangoutId: string; userId: string; message: string; username: string }) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot send message');
      return;
    }
    
    console.log('💬 Sending message:', data);
    this.socket?.emit('sendMessage', data);
  }

  onNewMessage(listener: (data: { userId: string; username: string; message: string; timestamp: string; messageId: number }) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on('newMessage', (data: { userId: string; username: string; message: string; timestamp: string; messageId: number }) => {
      console.log('💬 Received message:', data);
      listener(data);
    });
  }

  // NEW: Test ping-pong for device-to-device communication
  pingDevice(data: { hangoutId: string; fromUserId: string; toUserId: string; message: string }) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot ping device');
      return;
    }
    
    console.log('🏓 Pinging device:', data);
    this.socket?.emit('pingDevice', data);
  }

  onPongDevice(listener: (data: { fromUserId: string; toUserId: string; originalMessage: string; response: string; timestamp: string }) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on('pongDevice', (data: { fromUserId: string; toUserId: string; originalMessage: string; response: string; timestamp: string }) => {
      console.log('🏓 Received pong:', data);
      listener(data);
    });
  }

  // Remove specific listener
  removeLocationUpdateListener() {
    this.socket?.off('newLocationUpdate');
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  // Get current socket status
  getStatus() {
    return {
      connected: this.isConnected(),
      id: this.socket?.id,
      transport: this.socket?.io.engine?.transport?.name,
    };
  }
}

export const socketService = new SocketService();