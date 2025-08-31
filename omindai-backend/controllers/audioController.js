const Audio = require("../models/Audio");
const Analysis = require("../models/Analysis");
const { transcribeAudio } = require("../services/sttService");
const { analyzeCall } = require("../services/llmService");

exports.uploadAndTranscribe = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Launch all transcriptions in parallel, no concurrency limit
    const tasks = req.files.map(async (file) => {
      const audioDoc = new Audio({
        filename: file.filename,
        filepath: file.path,
        user: req.user.userId,
      });
      await audioDoc.save();

      const transcript = await transcribeAudio(file.path);
      audioDoc.transcript = transcript;
      audioDoc.transcribedAt = new Date();
      await audioDoc.save();

      return audioDoc;
    });

    // Wait for all to finish; handle individual failures without stopping all
    const results = await Promise.allSettled(tasks);

    // Format response with successes & errors
    const audios = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason ? r.reason.message : "Unknown error");

    res.json({ audios, errors });
  } catch (error) {
    console.error("Upload/Transcribe Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.analyzeTranscript = async (req, res) => {
  try {
    const { audioId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure audio belongs to current user
    const audioDoc = await Audio.findOne({
      _id: audioId,
      user: req.user.userId,
    });

    if (!audioDoc) {
      return res.status(404).json({ error: "Audio not found" });
    }

    if (!audioDoc.transcript) {
      return res
        .status(400)
        .json({ error: "Transcript not available for this audio" });
    }

    // Get structured analysis from LLM
    const analysisResponse = await analyzeCall(audioDoc.transcript);

    const analysisDoc = new Analysis({
      audioRef: audioDoc._id,
      qualityScores: analysisResponse.qualityScores || {},
      metricExplanations: analysisResponse.metricExplanations || {},
      coachingPlanText: analysisResponse.coachingPlanText || "",
      coachingActions: analysisResponse.coachingActions || [],
      references: analysisResponse.references || [],
      snippets: analysisResponse.snippets || [],
      quiz: analysisResponse.quiz || [],
      completionCriteria: analysisResponse.completionCriteria || "",
      metadata: {
        generatedAt: new Date(),
        model: "gemini-1.5-flash",
        modelConfidence: analysisResponse.modelConfidence || null,
      },
      analyzedAt: new Date(),
    });

    await analysisDoc.save();

    res.json({ audio: audioDoc, analysis: analysisDoc });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all audio + analyses for logged-in user
 */
exports.getAllAudioAnalysis = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const audios = await Audio.find({ user: req.user.userId }).lean();
    const audioIds = audios.map((a) => a._id);

    const analyses = await Analysis.find({
      audioRef: { $in: audioIds },
    }).lean();

    const analysisMap = analyses.reduce((acc, analysis) => {
      acc[analysis.audioRef.toString()] = analysis;
      return acc;
    }, {});

    const combined = audios.map((audio) => ({
      audio,
      analysis: analysisMap[audio._id.toString()] || null,
    }));

    res.json(combined);
  } catch (error) {
    console.error("Get all audios error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
