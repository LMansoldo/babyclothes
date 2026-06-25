/**
 * gRPC server implementation for the agents service.
 *
 * Implements two RPCs from proto/agent.proto:
 * - Chat: Server-streaming chat with AI
 * - PredictGrowth: Unary growth prediction
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chatGraph } from './graphs/chat.js';
import { growthGraph } from './graphs/growth.js';
import type { ChatChunk, GrowthPredictionResult, ChildContext } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, '../../../proto/agent.proto');

function loadProto() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition);
}

function chatHandler(
  call: grpc.ServerWritableStream<any, any>
) {
  const request = call.request;
  const childCtx = request.context;
  const message = request.message as string;

  // Map proto ChildContext to our internal type
  const childContext: ChildContext = {
    child_id: request.child_id,
    name: childCtx?.name || '',
    birth_date: childCtx?.birth_date || '',
    gender: 'unisex',
    measurements: (childCtx?.history || []).map((m: any) => ({
      recorded_at: m.recorded_at,
      weight_g: m.weight_g,
      height_cm: m.height_cm,
      clothing_size: m.clothing_size,
    })),
  };

  // Add last_measurement if present
  if (childCtx?.last_measurement) {
    const lm = childCtx.last_measurement;
    const exists = childContext.measurements.some(
      (m) => m.recorded_at === lm.recorded_at
    );
    if (!exists) {
      childContext.measurements.push({
        recorded_at: lm.recorded_at,
        weight_g: lm.weight_g,
        height_cm: lm.height_cm,
        clothing_size: lm.clothing_size,
      });
    }
  }

  console.log(`[Chat] Child: ${childContext.child_id}, Message: ${message}`);

  chatGraph({
    message,
    child_context: childContext,
  })
    .then((state) => {
      // Send response text chunk
      if (state.response) {
        const chunk: ChatChunk = {
          type: 'text',
          content: state.response,
        };
        call.write(chunk);
      }

      // Send component references as JSON chunks
      if (state.components) {
        for (const component of state.components) {
          const chunk: ChatChunk = {
            type: 'component',
            content: JSON.stringify(component),
          };
          call.write(chunk);
        }
      }

      // Stream ends by EOF per proto definition
      call.end();
    })
    .catch((error) => {
      console.error('[Chat] Error:', error);
      call.destroy(error);
    });
}

function predictGrowthHandler(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
) {
  const request = call.request;
  const childId = request.child_id;

  // Map proto measurements to our internal type
  const measurements = (request.measurements || []).map((m: any) => ({
    recorded_at: m.recorded_at,
    weight_g: m.weight_g,
    height_cm: m.height_cm,
    clothing_size: m.clothing_size,
  }));

  const childContext: ChildContext = {
    child_id: childId,
    name: '',
    birth_date: '',
    gender: 'unisex',
    measurements,
  };

  console.log(`[PredictGrowth] Child: ${childId}`);

  growthGraph({
    child: childContext,
    measurements,
  })
    .then((state) => {
      const result: GrowthPredictionResult = {
        predicted_size: state.prediction?.predicted_size || 'P',
        confidence: state.prediction?.confidence || 0,
        days_until_next_size: state.prediction?.days_until_needed || -1,
      };

      callback(null, {
        next_size: result.predicted_size,
        days_until: result.days_until_next_size,
      });
    })
    .catch((error) => {
      console.error('[PredictGrowth] Error:', error);
      callback(error);
    });
}

export function startServer(port: number = 50051): grpc.Server {
  const proto = loadProto() as any;
  const server = new grpc.Server();

  server.addService(proto.agent.AgentService.service, {
    Chat: chatHandler,
    PredictGrowth: predictGrowthHandler,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        process.exit(1);
      }

      console.log(`gRPC server running on port ${boundPort}`);
    }
  );

  return server;
}
