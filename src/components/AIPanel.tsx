import { useState } from "react";
import { askAI } from "@/api/ai";

export function AIPanel({ trucks, neighborhoods }: any) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);

    const res = await askAI(
      { trucks, neighborhoods },
      question || "Qual o estado da cidade?"
    );

    setAnswer(res);
    setLoading(false);
  }

  return (
    <div className="p-4 border rounded-xl bg-white">
      <h2 className="font-bold mb-2">🤖 IA da Cidade</h2>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Pergunte algo..."
        className="border p-2 w-full rounded mb-2"
      />

      <button
        onClick={handleAsk}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Pensando..." : "Perguntar"}
      </button>

      {answer && (
        <div className="mt-3 text-sm whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}