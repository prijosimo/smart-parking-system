// Importing libraries and loading proto file
var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var PROTO_PATH = __dirname + '/../../protos/gate.proto'
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var gate_proto = grpc.loadPackageDefinition(packageDefinition).gate

// Connecting to Naming Service
var namingPackageDef = protoLoader.loadSync(__dirname + '/../../protos/naming.proto');
var namingProto = grpc.loadPackageDefinition(namingPackageDef).naming;

var namingClient = new namingProto.NamingService(
    "0.0.0.0:50050",
    grpc.credentials.createInsecure()
);

// Registering this service
namingClient.RegisterService({
    name: "GateControlService",
    host: "0.0.0.0",
    port: 50052
}, (err, res) => {
    if (err) console.error("Registration error:", err);
    else console.log(res.message);
});

//Unary RPC
function RequestEntry(call, callback) {
    console.log("Received entry request from vehicle: ", call.request.vehicleId)
    callback(null, { allowed: true, message: "Gate opening for vehicle " + call.request.vehicleId })
}

//Unary RPC:
function NotifyExit(call, callback) {
    console.log("Exit notification received from vehicle: ", call.request.vehicleId)
    callback(null, { success: true,message: "Exit recorded for vehicle " + call.request.vehicleId })
}

// Bidirectional streaming RPC
function GateControl(stream) {
    console.log("GateControl stream started")

    // Error handling: client cancellation
    stream.on('cancelled', () => {
        console.log("Client cancelled the GateControl stream");
    });

    stream.on('data', function (command) {
        console.log("Received command: ", command.event)

        if (command.event === "open") {
            stream.write({ status: "Gate opening..." })
            setTimeout(() => {
                stream.write({ status: "Gate opened" })
                stream.end()
            }, 1000)
        } else if (command.event === "close") {
            stream.write({ status: "Gate closing..." })
            setTimeout(() => {
                stream.write({ status: "Gate closed" })
                stream.end()
            }, 1000)
        }
    })

    stream.on('end', function () {
        console.log("GateControl stream ended")
        stream.end()
    })
}

var server = new grpc.Server()

server.addService(gate_proto.GateControlService.service, {
    RequestEntry: RequestEntry,
    NotifyExit: NotifyExit,
    GateControl: GateControl
})

server.bindAsync("0.0.0.0:50052", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Gate Control Server running on port 50052")
    server.start();
})