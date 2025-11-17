"use client";

import { useState } from "react";
import { fetchAtomic, sendCompositeData } from "./services/api";

export default function Home() {
  const [atomicData, setAtomicData] = useState(null);
  const [compositeData, setCompositeData] = useState(null);

  const handleGetAtomic = async () => {
    try {
      const data = await fetchAtomic();
      setAtomicData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostComposite = async () => {
    try {
      const data = await sendCompositeData({ test: "hello" });
      setCompositeData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="font-sans min-h-screen p-10 flex flex-col items-center gap-10 bg-gray-100">
      <h1 className="text-3xl font-bold">Nice 2 Meet U</h1>
      <p className="text-lg text-gray-700">🚧 Coming Soon — Sprint 2 Integration 🚧</p>

      <div className="flex gap-4">
        <button
          onClick={handleGetAtomic}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
        >
          Call Atomic Service
        </button>

        <button
          onClick={handlePostComposite}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold"
        >
          Call Composite Service
        </button>
      </div>

      {atomicData && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-bold">Atomic Response:</h2>
          <pre className="text-sm mt-2 overflow-x-auto">
            {JSON.stringify(atomicData, null, 2)}
          </pre>
        </div>
      )}

      {compositeData && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-bold">Composite Response:</h2>
          <pre className="text-sm mt-2 overflow-x-auto">
            {JSON.stringify(compositeData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
