const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const geminiModel = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
      model: "gemini-1.5-flash",
    })
  : null;

const openAI = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

console.log("Initialized models:", { geminiModel, openAI });

async function analyzeCall(transcript) {
  const prompt = `
You are an automated call-quality evaluator. Analyze the TRANSCRIPT below and return ONLY a VALID JSON object that exactly follows the schema described.

IMPORTANT: Return JSON only. Do NOT include any extra text, explanation, or markdown. The JSON must be parseable by JSON.parse.

TRANSCRIPT:
${transcript}

REQUIREMENTS & RULES:
1. Use the following top-level JSON schema (fields and types MUST match):
{
  "schemaVersion": "string",            // e.g. "1.0"
  "model": "string",                    // model id used, e.g. "gemini-1.5-flash"
  "qualityScores": {                    // numeric scores, 0-10 (integers)
    "callOpening": number,
    "issueCapture": number,
    "sentiment": number,
    "csat": number,
    "resolutionQuality": number
  },
  "metricExplanations": {               // short explanation per metric (1-2 sentences)
    "callOpening": "string",
    "issueCapture": "string",
    "sentiment": "string",
    "csat": "string",
    "resolutionQuality": "string"
  },
  "coachingPlanText": "string",         // short human readable coaching summary (1-3 paragraphs)
  "coachingActions": [                  // short actionable checklist items (array of strings)
    "string"
  ],
  "references": [                       // suggested learning resources (0..3). Provide valid URLs when possible.
    { "title": "string", "url": "string" }
  ],
  "snippets": [                         // optional — short helpful call excerpts with time estimates if available
    {
      "start": "string",                // timestamp or approximate e.g. "00:01:15" or "75s" or null
      "end": "string",                  // timestamp or approximate or null
      "speaker": "Agent" | "Customer" | "Unknown",
      "text": "string"
    }
  ],
  "quiz": [                             // optional short quiz to test agent learning
    {
      "question": "string",
      "options": ["string", "string", "..."],
      "answerIndex": number,            // 0-based index to the correct option
      "explanation": "string"           // short explanation for correct answer
    }
  ],
  "completionCriteria": "string",       // how to mark training as complete (short)
  "metadata": {
    "generatedAt": "ISO8601 timestamp string",
    "modelConfidence": number | null    // optional 0..1 confidence
  }
}

2. DEFINITIONS (how to score 0–10):
- callOpening: 0 = no greeting/hostile; 10 = professional, friendly, confirms customer identity/purpose quickly.
- issueCapture: 0 = did not identify issue or captured incorrectly; 10 = accurately summarizes issue, asks clarifying q's.
- sentiment: 0 = negative/hostile; 10 = positive/empathetic tone across agent and customer (give one averaged score).
- csat: 0 = likely dissatisfied/low FCR; 10 = likely highly satisfied / issue resolved on first call.
- resolutionQuality: 0 = no solution/poor; 10 = clear, tested solution with confirmation.

Round each score to nearest integer 0..10. If information is missing, set the score to 0 and explain why in metricExplanations.

3. OUTPUT RULES:
- Use integers (not strings) for scores.
- Provide short (1-2 sentence) **metricExplanations** for each metric — cite the text snippet(s) or describe evidence from the transcript.
- Coaching actions should be 3–6 concrete bullet items (max 12 words each).
- Provide up to 3 reference links (YouTube/article) with short titles where possible.
- If you can locate transcript snippets that justify a score, return them in "snippets" with approximate timestamps (if no timestamps present, provide 'null' for start/end but include text).
- In the "quiz" array, include 1–3 multiple-choice questions that test the coaching points. Provide the correct option with answerIndex.
- "completionCriteria" should be specific (e.g., "Agent must score ≥ 8 on Call Opening and complete quiz with 80%").

4. PARSING SAFETY:
- Your entire response must be a single JSON object. Do NOT include any commentary, explanation, or extraneous characters before or after JSON.
- All URLs must be validly formatted strings (if none, return an empty array).
- Use ISO8601 for metadata.generatedAt (e.g. "2025-08-31T12:34:56Z").

5. EXAMPLE (exact shape; use only as reference — DO NOT return this example):
{
  "schemaVersion": "1.0",
  "model": "gemini-1.5-flash",
  "qualityScores": {
    "callOpening": 7,
    "issueCapture": 8,
    "sentiment": 6,
    "csat": 7,
    "resolutionQuality": 8
  },
  "metricExplanations": {
    "callOpening": "Agent greeted politely but did not confirm account details; greeting lasted 3s.",
    "issueCapture": "Agent asked clarifying questions and summarized the billing error at 00:01:12.",
    "sentiment": "Agent remained calm; customer expressed frustration early but later settled.",
    "csat": "Customer thanked agent after solution; likely satisfied.",
    "resolutionQuality": "Clear steps given and agent confirmed fix; resolution confirmed at end."
  },
  "coachingPlanText": "Short summary paragraph explaining main strengths and weaknesses and priority improvements.",
  "coachingActions": [
    "Use a friendly standard greeting and confirm account details",
    "Ask two clarifying questions before proposing solution",
    "Repeat customer's issue in one sentence",
    "Confirm resolution and next steps verbally"
  ],
  "references": [
    { "title": "Active Listening 101", "url": "https://example.com/active-listening" }
  ],
  "snippets": [
    { "start": "00:01:10", "end": "00:01:20", "speaker": "Agent", "text": "So the issue is a billing error..." }
  ],
  "quiz": [
    {
      "question": "What is the best next step after hearing a billing discrepancy?",
      "options": ["Ask for account number", "Offer refund immediately", "Transfer to billing without questions"],
      "answerIndex": 0,
      "explanation": "Always confirm identity/account details before transactional steps."
    }
  ],
  "completionCriteria": "Agent must score ≥8 on Call Opening and pass quiz >=80%",
  "metadata": {
    "generatedAt": "2025-08-31T12:34:56Z",
    "modelConfidence": 0.86
  }
}

NOW: produce JSON only following the schema above for the provided transcript.
`;

  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const textResponse = await result.response.text();

      const jsonStart = textResponse.indexOf("{");
      const jsonEnd = textResponse.lastIndexOf("}") + 1;
      const jsonString =
        jsonStart !== -1 && jsonEnd !== -1
          ? textResponse.substring(jsonStart, jsonEnd)
          : "{}";

      const parsed = JSON.parse(jsonString);
      parsed.model = "gemini-1.5-flash";
      return parsed;
    } catch (err) {
      console.warn("Gemini failed, falling back to OpenAI:", err.message);
    }
  }

  if (openAI) {
    try {
      const completion = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const textResponse = completion.choices[0].message.content;
      const jsonStart = textResponse.indexOf("{");
      const jsonEnd = textResponse.lastIndexOf("}") + 1;
      const jsonString =
        jsonStart !== -1 && jsonEnd !== -1
          ? textResponse.substring(jsonStart, jsonEnd)
          : "{}";

      const parsed = JSON.parse(jsonString);
      parsed.model = "gpt-3.5-turbo";
      return parsed;
    } catch (err) {
      console.error("OpenAI also failed:", err.message);
      return {
        schemaVersion: "1.0",
        model: "none",
        qualityScores: {
          callOpening: 0,
          issueCapture: 0,
          sentiment: 0,
          csat: 0,
          resolutionQuality: 0,
        },
        metricExplanations: {},
        coachingPlanText: "",
        coachingActions: [],
        references: [],
        snippets: [],
        quiz: [],
        completionCriteria: "",
        metadata: {
          generatedAt: new Date().toISOString(),
          modelConfidence: null,
        },
      };
    }
  }

  return {
    schemaVersion: "1.0",
    model: "none",
    qualityScores: {
      callOpening: 0,
      issueCapture: 0,
      sentiment: 0,
      csat: 0,
      resolutionQuality: 0,
    },
    metricExplanations: {},
    coachingPlanText: "",
    coachingActions: [],
    references: [],
    snippets: [],
    quiz: [],
    completionCriteria: "",
    metadata: {
      generatedAt: new Date().toISOString(),
      modelConfidence: null,
    },
  };
}

module.exports = { analyzeCall };
