import http from "http";
import app from "./app";
import configureSocket from "./config/socket";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = configureSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

export { io };
