import { Server } from "socket.io";

const configureSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    // createRoom -> backend -> cria sala e gera o codigo -> retorna o codigo para o front

    socket.on(
      "createRoom",
      (data: any, callback?: (response: { roomId: string }) => void) => {
        const roomId = Math.floor(100000 + Math.random() * 900000).toString();
        socket.join(roomId);
        console.log(`Sala ${roomId} criada pelo remetente ${socket.id}`);
        // Utiliza callback se ele estiver definido
        callback?.({ roomId });
      }
    );

    socket.on(
      "joinRoom",
      (
        roomId: string,
        callback?: (response: { success?: boolean; error?: string }) => void
      ) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) {
          console.log(
            `Sala ${roomId} não encontrada para o socket ${socket.id}`
          );
          callback?.({ error: "Sala não encontrada" });
          return;
        }
        socket.join(roomId);
        console.log(`Socket ${socket.id} entrou na sala ${roomId}`);
        socket.to(roomId).emit("receiverJoined", { roomId });
        callback?.({ success: true });
      }
    );

    socket.on(
      "sendFile",
      (
        data: { roomId: string; file: any },
        callback?: (response: { success?: boolean; error?: string }) => void
      ) => {
        const { roomId, file } = data;
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) {
          callback?.({ error: "Sala não encontrada" });
          return;
        }
        console.log(
          `Arquivo enviado na sala ${roomId} pelo socket ${socket.id}`
        );
        socket.to(roomId).emit("receiveFile", { file });
        callback?.({ success: true });
      }
    );

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id);
    });
  });

  return io;
};

export default configureSocket;
