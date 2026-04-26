// Importing libraries and loading proto file
var readlineSync = require('readline-sync')
var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var PROTO_PATH = __dirname + '/../../protos/parking.proto'
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var parking_proto = grpc.loadPackageDefinition(packageDefinition).parking

// Creating client instance
var client = new parking_proto.ParkingSensorService(
    "0.0.0.0:50051",
    grpc.credentials.createInsecure()
)

// Asking user what they want to do
var action = readlineSync.question(
    "What would you like to do?\n" +
    "\t1 - Check availability (Unary RPC)\n" +
    "\t2 - Stream occupancy updates (Server-side streaming)\n"
)

action = parseInt(action)

// Option 1: Unary RPC

if (action === 1) {
    try {
        client.CheckAvailability({}, function (error, response) {
            if (error) {
                console.log("Error:", error)
            } else {
                console.log("Free slots:", response.freeSlots)
            }
        })
    } catch (e) {
        console.log("An error occurred")
    }
}

// Option 2: Server-side streaming

else if (action === 2) {
    try {
        var call = client.StreamOccupancyUpdates({})

        call.on('data', function (update) {
            console.log("Update:", update.message)
        })

        call.on('end', function () {
            console.log("Stream ended")
        })

        call.on('error', function (e) {
            console.log("Error:", e)
        })
    } catch (e) {
        console.log("An error occurred")
    }
}

else {
    console.log("Invalid option")
}
