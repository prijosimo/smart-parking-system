// Importing libraries and loading proto
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/naming.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var namingProto = grpc.loadPackageDefinition(packageDefinition).naming;

// In-memory registry to store service information
var registry = {};  
