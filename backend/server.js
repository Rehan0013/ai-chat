require("dotenv").config();
const app = require("./src/app");

const { generateResponse } = require("./src/services/ai.service");

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  const chatHostory = [];

  socket.on("ai-message", async (data) => {
    chatHostory.push({
      role: "user",
      parts: [
        {
          text: data,
        },
      ],
    });

    const response = await generateResponse(chatHostory);

    chatHostory.push({
      role: "model",
      parts: [
        {
          text: response,
        },
      ],
    });

    socket.emit("ai-message-response", { response });
  });
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
