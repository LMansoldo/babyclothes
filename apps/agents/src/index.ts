import { startServer } from './server.js';
import { startHttpServer } from './http-server.js';

const GRPC_PORT = parseInt(process.env.GRPC_PORT || '50051', 10);
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '50052', 10);

console.log('Starting agents service...');
const grpcServer = startServer(GRPC_PORT);
const httpServer = startHttpServer(HTTP_PORT);

// Graceful shutdown
function shutdown() {
  console.log('Shutting down...');
  httpServer.close();
  grpcServer.tryShutdown(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
