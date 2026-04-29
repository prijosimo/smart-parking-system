// Importing libraries and loading proto
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/naming.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var namingProto = grpc.loadPackageDefinition(packageDefinition).naming;

// In-memory registry to store service information
var registry = {};  

// Implementing RPC functions
function RegisterService(call, callback) {
    const { name, host, port } = call.request;

    registry[name] = { host, port };

    console.log(`Registered service: ${name} at ${host}:${port}`);

    callback(null, {
        success: true,
        message: `${name} registered successfully`
    });
}

function LookupService(call, callback) {
    const name = call.request.name;

    if (registry[name]) {
        console.log(`Lookup request for ${name}: found`);
        callback(null, registry[name]);
    } else {
        console.log(`Lookup request for ${name}: NOT found`);
        callback(null, { host: "", port: 0 });
    }
}

// Creating and starting the Naming Service server
var server = new grpc.Server();

server.addService(namingProto.NamingService.service, {
    RegisterService: RegisterService,
    LookupService: LookupService
});

server.bindAsync(
    "0.0.0.0:50050",
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log("Naming Service running on port 50050");
        server.start();
    }
);
