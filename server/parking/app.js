// Importing libraries and loading proto definition
var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var PROTO_PATH = __dirname + '/../../protos/parking.proto'
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var parking_proto = grpc.loadPackageDefinition(packageDefinition).parking

// Unary RPC
function CheckAvailability(call, callback) {
    callback(null, { freeSlots: 10 })
}

// Server-side streaming RPC
function StreamOccupancyUpdates(call) {
    call.write({ message: "Slot 1 occupied" })
    call.write({ message: "Slot 3 free" })
    call.end()
}

// Creating and starting the gRPC server

var server = new grpc.Server()

server.addService(parking_proto.ParkingSensorService.service, {
    CheckAvailability: CheckAvailability,
    StreamOccupancyUpdates: StreamOccupancyUpdates
})

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Parking Service running on port 50051")
    server.start()
})
