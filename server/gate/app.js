// Importing libraries and loading proto file
var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var PROTO_PATH = __dirname + '/../../protos/gate.proto'
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var gate_proto = grpc.loadPackageDefinition(packageDefinition).gate

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

    stream.on('data', function (command) {
        console.log("Received command: ", command.action)

        if (command.action === "open") {
            stream.write({ status: "Gate opening..." })
            setTimeout(() => stream.write({ status: "Gate opened" }), 1000)
        }else if (command.action === "close") {
            stream.write({ status: "Gate closing..." })
            setTimeout(() => stream.write({ status: "Gate closed" }), 1000)
        }else {
            stream.write({ status: "Unknown command" })
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
    server.start()
})