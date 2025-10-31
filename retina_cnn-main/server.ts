// server.ts - Next.js Standalone + Socket.IO + .env support
import 'dotenv/config'; // ✅ ensures .env.local and .env load automatically
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

// === Environment setup ===
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '127.0.0.1';
const currentPort = Number(process.env.PORT) || 3000;

// === Initialize custom server ===
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({
      dev,
      dir: process.cwd(),
      conf: dev ? undefined : { distDir: './.next' },
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer((req, res) => {
      // Skip socket.io route
      if (req.url?.startsWith('/api/socketio')) return;
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    setupSocket(io);

    // Start server
    server.listen(currentPort, hostname, () => {
      console.log(`🚀 Next.js ready at http://${hostname}:${currentPort}`);
      console.log(`🔌 Socket.IO running at ws://${hostname}:${currentPort}/api/socketio`);
      if (process.env.NEXT_PUBLIC_BACKEND_URL) {
        console.log(`🧠 Connected backend: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
      } else {
        console.warn('⚠️ No NEXT_PUBLIC_BACKEND_URL found in .env.local');
      }
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

createCustomServer();
