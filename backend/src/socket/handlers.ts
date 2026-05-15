import { Server, Socket } from 'socket.io';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join campus-wide room for updates
    socket.join('campus-updates');

    // Handle room status updates
    socket.on('room:update', (data) => {
      io.emit('room:status', data);
    });

    // Handle new update notifications
    socket.on('update:new', (data) => {
      socket.to('campus-updates').emit('update:new', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Make io accessible to routes
  return io;
};