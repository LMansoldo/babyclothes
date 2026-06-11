import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = path.resolve(__dirname, '../../../proto/agent.proto')

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDef) as any
const AgentService = proto.agent.AgentService

const server = new grpc.Server()

server.addService(AgentService.service, {
  Chat: (call: grpc.ServerWritableStream<any, any>) => {
    call.write({ type: 'text', content: 'stub response' })
    call.end()
  },
  PredictGrowth: (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) => {
    callback(null, { next_size: 'M', days_until: 30 })
  },
})

const port = process.env.GRPC_PORT ?? '50051'
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err) => {
  if (err) {
    console.error('Failed to bind gRPC server:', err)
    process.exit(1)
  }
  console.log(`gRPC server listening on port ${port}`)
})
