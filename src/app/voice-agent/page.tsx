"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Volume2, Sparkles, Bot, User } from "lucide-react";

export default function VoiceAgentPage() {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string; final?: boolean }[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const isSpeakingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/voice-agent";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        if (data.type === "transcript") {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.final !== false);
            return [...filtered, { role: "user", text: data.text, final: data.final }];
          });
        } else if (data.type === "text_response") {
          setMessages((prev) => [...prev, { role: "assistant", text: data.text, final: true }]);
        }
      } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        isSpeakingRef.current = true;
        audio.onended = () => { isSpeakingRef.current = false; };
        audio.onerror = () => { isSpeakingRef.current = false; };

        audio.play().catch((err) => {
          console.warn("Audio playback notice:", err);
          isSpeakingRef.current = false;
        });
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isSpeakingRef.current) return; // Prevent mic from capturing speaker output

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        wsRef.current.send(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  const stopMicrophone = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-10rem)] flex flex-col justify-between py-6 space-y-6">
      {/* Hero Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Volume2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              Konthora Voice Agent
              <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold border border-primary/25">
                AssemblyAI Realtime
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Natural speech recognition with Kokoro voice synthesis.
            </p>
          </div>
        </div>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-border text-foreground shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>{isConnected ? "Engine Ready" : "Connecting..."}</span>
        </div>
      </div>

      {/* Conversation Workspace (Chat Canvas) */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/80 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[420px]">
        <div className="h-[420px] overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 px-4 text-muted-foreground">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Ready for your voice</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Click <strong className="text-primary font-semibold">Start Talking</strong> below to begin live speech transcription and voice assistant response.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                      : "bg-muted/80 border border-border/50 text-foreground rounded-tl-none"
                  } ${!m.final ? "opacity-75 italic animate-pulse border border-dashed border-primary/40" : ""}`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Docked Action Controls Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isListening ? (
            <button
              onClick={startMicrophone}
              disabled={!isConnected}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Mic className="w-5 h-5" /> Start Talking
            </button>
          ) : (
            <button
              onClick={stopMicrophone}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 py-3 rounded-xl animate-pulse flex items-center gap-2 cursor-pointer text-sm"
            >
              <Square className="w-5 h-5" /> Stop Listening
            </button>
          )}
        </div>

        {isListening && (
          <div className="text-destructive font-semibold text-xs flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
            </span>
            Microphone Live
          </div>
        )}
      </div>
    </div>
  );
}
