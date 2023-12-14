import { Server } from "socket.io";

let GLOBAL_SOCKET_IO = null;
let GLOBAL_SOCKET = null

const PRIVATE_MESSAGE_ID = {};

export const initSocketConnection = (server) => {
  const io = new Server(server, {
    path: '/booking-event',
    cors: {},
    pingTimeout: 50000,
    transports: ["polling", "websocket"]
  });
  GLOBAL_SOCKET_IO = io;
  GLOBAL_SOCKET = io;

  io.on('connection', (socket) => {
    // if (!GLOBAL_SOCKET) {
      // GLOBAL_SOCKET = socket;
    // }
  });

  io.on('disconnect', (socket) => {
    console.log('Socket disconnect', socket.id);
  });
}

const setBookingPrivateMsgId = (messageId) => {
  PRIVATE_MESSAGE_ID[messageId] = true;
}

export const broadcastPrivateMessage = (messageId, message) => {
  setBookingPrivateMsgId(messageId);
  GLOBAL_SOCKET.emit(messageId, message);
}

export const handlePrivateMessage = (messageId, callback) => {
  GLOBAL_SOCKET.on(messageId, callback);
}
