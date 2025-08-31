const fs = require("fs");
const axios = require("axios");

async function transcribeAudio(filePath) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  // 1️⃣ Try OpenAI API first
  if (OPENAI_KEY) {
    try {
      const FormData = require("form-data");
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      if (response.data?.text) {
        return response.data.text;
      }
    } catch (err) {
      console.warn(
        "⚠️ OpenAI transcription failed, falling back to local model:",
        err.message
      );
    }
  }

  // 2️⃣ Fallback → send file to local Flask server
  try {
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "http://host.docker.internal:8000/transcribe", // Flask running locally
      formData,
      { headers: formData.getHeaders() }
    );

    if (response.data?.text) {
      return response.data.text;
    } else {
      throw new Error("Local Whisper returned no text");
    }
  } catch (err) {
    console.error("❌ Local Whisper error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { transcribeAudio };
