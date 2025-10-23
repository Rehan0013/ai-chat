require("dotenv").config();
const app = require("./src/app");

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {/* options */});

io.on("connection", (socket) => {
    // console.log("a user connected");
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`App listening on port ${port}`);
});