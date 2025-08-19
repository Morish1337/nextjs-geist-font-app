import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import pool from './db';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new ServerIO(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join chat room
      socket.on('join-chat', (userData) => {
        socket.join('public-chat');
        (socket as any).userData = userData;
        console.log(`${userData.username} joined public chat`);
      });

      // Handle new message
      socket.on('send-message', async (messageData) => {
        try {
          const { userId, content } = messageData;
          
          // Save message to database
          const [result] = await pool.execute(
            'INSERT INTO messages (user_id, content) VALUES (?, ?)',
            [userId, content]
          );

          // Get user info for the message
          const [userResult] = await pool.execute(
            'SELECT username, role FROM users WHERE id = ?',
            [userId]
          );

          const user = (userResult as any[])[0];
          
          const messageWithUser = {
            id: (result as any).insertId,
            content,
            username: user.username,
            role: user.role,
            created_at: new Date().toISOString()
          };

          // Broadcast message to all users in public chat
          io.to('public-chat').emit('new-message', messageWithUser);
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', 'Erreur lors de l\'envoi du message');
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  res.end();
}
