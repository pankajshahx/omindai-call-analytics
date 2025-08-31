const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

async function transcribeAudio(filePath) {
  // 1️⃣ Check OpenAI key
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  console.log(OPENAI_KEY);

  if (OPENAI_KEY) {
    try {
      const audioData = fs.createReadStream(filePath);

      // Call OpenAI transcription API
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        audioData,
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "multipart/form-data",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      if (response.data && response.data.text) {
        return response.data.text;
      }
    } catch (err) {
      console.warn(
        "OpenAI transcription failed, falling back to local model:",
        err.message
      );
      // continue to run in-house model
    }
  }

  // 2️⃣ Fallback to in-house Whisper script
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "../../../omindai-whisper/transcribe.py"
    );

    const process = spawn("python3", [scriptPath, filePath]);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        console.error("Whisper script error:", errorOutput);
        reject(new Error(errorOutput));
      } else {
        resolve(output.trim());
      }
    });
  });
}

module.exports = { transcribeAudio };
