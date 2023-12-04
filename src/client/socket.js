import { Server } from "socket.io";

let GLOBAL_SOCKET_IO = null;
let GLOBAL_SOCKET = null

const PRIVATE_MESSAGE_ID = {};

export const initSocketConnection = (server) => {
  const io = new Server(server, {
    path: '/booking-event',
    cors: {},
    transports: ["polling", "websocket"]
  });
  GLOBAL_SOCKET_IO = io;
  GLOBAL_SOCKET = io;

  GLOBAL_SOCKET_IO.on('connection', (socket) => {
    GLOBAL_SOCKET = socket;
  });

  GLOBAL_SOCKET_IO.on('disconnect', (socket) => {
    GLOBAL_SOCKET = socket;
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
