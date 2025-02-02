const { Server, Socket } = require("socket.io");
let io;

module.exports = {
  socketInit: (httpServer) => {
    io = new Server(httpServer);
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket not initialize");
    }
    return io;
  }
};
