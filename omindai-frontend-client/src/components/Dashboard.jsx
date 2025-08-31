import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";


const COLORS = ["#16a34a", "#facc15", "#dc2626", "#3b82f6", "#9333ea"];


export default function Dashboard() {
  const [audios, setAudios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [analyzing, setAnalyzing] = useState({});


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/all", {
        withCredentials: true,
      });
      setAudios(res?.data ?? []);
      if (res?.data?.length > 0 && !selected) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  const handleAnalyze = async (audioId) => {
    try {
      setAnalyzing((prev) => ({ ...prev, [audioId]: true }));


      const res = await axios.post(
        `http://localhost:5000/api/analyze/${audioId}`,
        {},
        { withCredentials: true }
      );


      // Update the selected audio with new analysis directly
      setAudios((prev) =>
        prev.map((a) =>
          a.audio._id === audioId ? { ...a, analysis: res.data.analysis } : a
        )
      );


      setSelected((prev) =>
        prev.audio._id === audioId
          ? { ...prev, analysis: res.data.analysis }
          : prev
      );
    } catch (err) {
      console.error("Error analyzing:", err);
      alert("Failed to analyze. Try again.");
    } finally {
      setAnalyzing((prev) => ({ ...prev, [audioId]: false }));
    }
  };


  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500 text-lg">
        ⏳ Loading...
      </div>
    );


  const chartData = selected
    ? [
        {
          name: "Call Opening",
          value: selected.analysis?.qualityScores?.callOpening || 0,
        },
        {
          name: "Capturing Issue",
          value: selected.analysis?.qualityScores?.issueCapture || 0,
        },
        {
          name: "Sentiment",
          value: selected.analysis?.qualityScores?.sentiment || 0,
        },
        {
          name: "CSAT/FCR",
          value: selected.analysis?.qualityScores?.csat || 0,
        },
        {
          name: "Resolution",
          value: selected.analysis?.qualityScores?.resolutionQuality || 0,
        },
      ]
    : [];


  const averageScore = selected
    ? (
        Object.values(selected.analysis?.qualityScores || {}).reduce(
          (a, b) => a + b,
          0
        ) / Object.keys(selected.analysis?.qualityScores || {}).length
      ).toFixed(1)
    : 0;


  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-3">
      {/* Left Sidebar */}
      <div className="border-r bg-gray-50 p-4 space-y-4 overflow-y-auto h-screen">
        <input
          type="text"
          placeholder="🔍 Search audios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <ul className="space-y-2">
          {audios
            .filter((a) =>
              a.audio?.filename?.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <li
                key={item.audio?._id}
                onClick={() => setSelected(item)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selected?.audio?._id === item.audio?._id
                    ? "bg-indigo-100 border border-indigo-400"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-gray-800">
                  {item.audio?.filename?.split('.')[0] ?? "Unnamed"}
                </div>
                <div className="text-xs text-gray-500">
                  {item.audio?.uploadDate
                    ? new Date(item.audio.uploadDate).toLocaleString()
                    : "Unknown"}
                </div>
              </li>
            ))}
        </ul>
      </div>


      {/* Right Panel */}
      <div className="col-span-2 p-6 overflow-y-auto">
        {!selected ? (
          <div className="text-gray-500 text-center mt-20">
            Select an audio file from the left panel to see details.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                📂 {selected.audio?.filename}
              </h2>
              <button
                onClick={() => handleAnalyze(selected.audio?._id)}
                disabled={analyzing[selected.audio?._id]}
                className={`px-4 py-2 rounded-lg text-white shadow transition ${
                  analyzing[selected.audio?._id]
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {analyzing[selected.audio?._id]
                  ? selected.analysis
                    ? "Re-analyzing..."
                    : "Analyzing..."
                  : selected.analysis
                  ? "Re-analyze"
                  : "Analyze Now"}
              </button>
            </div>


            {/* Chart + Scores */}
            {selected.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Pie Chart */}
                <div className="h-64 relative bg-white p-4 rounded-2xl shadow-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        innerRadius={40}
                        label
                      >
                        {COLORS.map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex justify-center items-center text-lg font-bold text-gray-800">
                    {averageScore} / 10
                  </div>
                </div>


                {/* Scores Table */}
                <div className="bg-white p-4 rounded-2xl shadow-md overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Metric</th>
                        <th className="px-3 py-2 text-right">Score</th>
                        <th className="px-3 py-2 text-left">Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        selected.analysis.metricExplanations || {}
                      ).map(([metric, explanation], i) => (
                        <tr
                          key={i}
                          className="border-b last:border-none hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 capitalize">{metric}</td>
                          <td className="px-3 py-2 text-right">
                            {selected.analysis?.qualityScores?.[metric] ?? 0}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* Transcript */}
            {selected.audio?.transcript && (
              <details className="bg-gray-50 rounded-2xl p-4 cursor-pointer shadow-md">
                <summary className="font-semibold text-gray-800">
                  📝 Transcript
                </summary>
                <pre className="text-gray-700 whitespace-pre-wrap text-sm mt-2 max-h-64 overflow-y-auto">
                  {selected.audio?.transcript}
                </pre>
              </details>
            )}


            {/* Coaching Plan */}
            {selected.analysis?.coachingPlanText && (
              <div className="bg-indigo-50 p-4 rounded-2xl border-l-4 border-indigo-600 space-y-2 shadow-md">
                <h3 className="text-lg font-semibold">🎯 Coaching Plan</h3>
                <p className="text-gray-700">
                  {selected.analysis.coachingPlanText}
                </p>
                <ul className="list-disc ml-5 text-gray-700">
                  {selected.analysis.coachingActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}


            {/* Snippets */}
            {selected.analysis?.snippets?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="font-semibold mb-2">🎬 Example Snippets</h3>
                {selected.analysis.snippets.map((snip, i) => (
                  <blockquote
                    key={i}
                    className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400 mb-2"
                  >
                    <span className="font-medium text-gray-700">
                      {snip.speaker}:
                    </span>
                    <p className="text-gray-600">{snip.text}</p>
                  </blockquote>
                ))}
              </div>
            )}


            {/* Quiz */}
            {selected.analysis?.quiz?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md space-y-4">
                <h3 className="font-semibold">📝 Quiz</h3>
                {selected.analysis.quiz.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium">
                      Q{i + 1}. {q.question}
                    </p>
                    <ul className="list-disc ml-5">
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={`p-2 rounded-lg ${
                            j === q.answerIndex
                              ? "bg-green-100 font-semibold"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500">{q.explanation}</p>
                  </div>
                ))}
              </div>
            )}


            {/* Completion Criteria */}
            {selected.analysis?.completionCriteria && (
              <div className="bg-green-50 p-4 rounded-2xl border-l-4 border-green-600 shadow-md">
                <h3 className="font-semibold">✅ Completion Criteria</h3>
                <p>{selected.analysis.completionCriteria}</p>
              </div>
            )}


            {/* Metadata */}
            {selected.analysis?.metadata && (
              <div className="text-xs text-gray-500 mt-2">
                Generated at: {selected.analysis.metadata.generatedAt} | Model:{" "}
                {selected.analysis.metadata.model}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}