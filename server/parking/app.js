// Importing libraries and loading proto definition
var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var PROTO_PATH = __dirname + '/../../protos/parking.proto'
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var parking_proto = grpc.loadPackageDefinition(packageDefinition).parking

// Connecting to Naming Service
var namingPackageDef = protoLoader.loadSync(__dirname + '/../../protos/naming.proto');
var namingProto = grpc.loadPackageDefinition(namingPackageDef).naming;

var namingClient = new namingProto.NamingService(
    "0.0.0.0:50050",
    grpc.credentials.createInsecure()
);

// Registering this service
namingClient.RegisterService({
    name: "ParkingSensorService",
    host: "0.0.0.0",
    port: 50051
}, (err, res) => {
    if (err) console.error("Registration error:", err);
    else console.log(res.message);
});

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
