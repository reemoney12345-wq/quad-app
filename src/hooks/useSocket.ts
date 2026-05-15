import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const onNewUpdate = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('update:new', callback);
    return () => {
      socketRef.current?.off('update:new', callback);
    };
  }, []);

  const onUpdateVerified = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('update:verified', callback);
    return () => {
      socketRef.current?.off('update:verified', callback);
    };
  }, []);

  const onRoomStatusChange = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('room:status', callback);
    return () => {
      socketRef.current?.off('room:status', callback);
    };
  }, []);

  return { onNewUpdate, onUpdateVerified, onRoomStatusChange };
}