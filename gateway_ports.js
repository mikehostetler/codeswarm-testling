var ports = [];

var start = 8080;
var end = 8100;

for(var port = start ; port <= end; port ++ ) {
  ports.push(port);
}

module.exports = ports;