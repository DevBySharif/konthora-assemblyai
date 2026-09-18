'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-3xl mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-4">
          Konthora AI Suite
        </h1>
        <p className="text-slate-400 text-lg">
          Real-Time Multilingual Speech Intelligence powered by AssemblyAI v3, Groq LLM, and Kokoro TTS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Card 1: Voice Agent */}
        <Link
          href="/voice-agent"
          className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🎙️
            </div>
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
              Full Voice Agent
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Interactive end-to-end multilingual conversational AI with real-time echo guard and sub-second responses.
            </p>
          </div>
          <span className="mt-6 text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Launch Agent &rarr;
          </span>
        </Link>

        {/* Card 2: Transcribe (STT) */}
        <Link
          href="/transcribe"
          className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📝
            </div>
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
              STT Transcribe
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sub-second live streaming speech recognition powered by AssemblyAI Streaming v3 WebSocket.
            </p>
          </div>
          <span className="mt-6 text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Transcribe &rarr;
          </span>
        </Link>

        {/* Card 3: Kokoro TTS */}
        <Link
          href="/tts"
          className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔊
            </div>
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">
              Kokoro Speech Synthesis
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Standalone local text-to-speech audio generator with high-fidelity phonetic voice models.
            </p>
          </div>
          <span className="mt-6 text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Synthesis &rarr;
          </span>
        </Link>
      </div>

      <footer className="mt-16 text-slate-500 text-xs tracking-wide uppercase">
        Built for AssemblyAI Hackathon • Konthora AI
      </footer>
    </main>
  );
}