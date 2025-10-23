const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(chatHostory) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: chatHostory,
  });

  return response.text;
}

module.exports = {
  generateResponse,
};
