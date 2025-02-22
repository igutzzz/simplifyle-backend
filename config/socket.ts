import { Server } from "socket.io";
import { processFiles } from "../helpers/helpers";

const configureSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", async (socket) => {
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
        socket.to(roomId).emit("receiverJoined", { receiverId: socket.id });
        callback?.({ success: true });
      }
    );

    socket.on(
      "sendFile",
      async (
        data: { roomId: string; files: { name: string; data: ArrayBuffer }[] },
        callback?: (response: { success?: boolean; error?: string }) => void
      ) => {
        try {
          console.log("Recebendo arquivos do frontend:", data);

          const { roomId, files } = data;

          const room = io.sockets.adapter.rooms.get(roomId);
          if (!room) {
            callback?.({ error: "Sala não encontrada" });
            return;
          }

          // Converte ArrayBuffer para Buffer antes de processar
          const processedFiles = files.map((file) => ({
            name: file.name,
            data: Buffer.from(file.data),
          }));

          console.log("Arquivos processados:", processedFiles);

          // Envia os arquivos processados para os clientes na sala
          socket.to(roomId).emit("receiveFile", { files: processedFiles });

          callback?.({ success: true });
        } catch (error) {
          console.error("Erro ao processar arquivos:", error);
          callback?.({ error: "Erro ao processar arquivos" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id);
    });
  });

  return io;
};

export default configureSocket;
