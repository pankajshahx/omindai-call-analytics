const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  audioRef: { type: mongoose.Schema.Types.ObjectId, ref: "Audio" },

  qualityScores: {
    callOpening: Number,
    issueCapture: Number,
    sentiment: Number,
    csat: Number,
    resolutionQuality: Number,
  },

  // Detailed explanations for each metric
  metricExplanations: {
    callOpening: String,
    issueCapture: String,
    sentiment: String,
    csat: String,
    resolutionQuality: String,
  },

  // Coaching
  coachingPlanText: String,
  coachingActions: [String], // bullet list recommendations

  // References (links / articles / videos)
  references: [
    {
      title: String,
      url: String,
    },
  ],

  // Transcript snippets
  snippets: [
    {
      start: String,
      end: String,
      speaker: String,
      text: String,
    },
  ],

  // Quiz for coaching reinforcement
  quiz: [
    {
      question: String,
      options: [String],
      answerIndex: Number,
      explanation: String,
    },
  ],

  // Completion criteria (when training is considered successful)
  completionCriteria: String,

  // Metadata
  metadata: {
    generatedAt: { type: Date, default: Date.now },
    model: String,
    modelConfidence: Number,
  },

  analyzedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analysis", analysisSchema);
