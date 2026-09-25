export interface FAQItem {
  question: string;
  answer: string;
}

export const voiceDocFaqs: FAQItem[] = [
  {
    question: 'What makes Konthora different from generic transcription or TTS tools?',
    answer:
      'Unlike simple transcribe or text-to-speech tools, Konthora is a complete, full-duplex enterprise voice production engine. It doesn’t just transcribe audio; it reasons in real-time via Groq, executes structured business tool schemas (like generate_invoice or generate_hr_offer_letter), and instantly produces downloadable corporate documents with local Kokoro audio confirmation.',
  },
  {
    question: 'How is sub-second latency achieved across the entire pipeline?',
    answer:
      'We combine 16kHz raw PCM streaming over AssemblyAI v3 WebSockets (~150ms chunks), sub-200ms structured JSON inference on Groq’s ultra-fast LPU hardware, and zero-egress local Kokoro-82M neural synthesis (~120ms). The entire round-trip from spoken utterance to rendered document and voice playback completes in under 850ms.',
  },
  {
    question: 'How does Acoustic Echo Cancellation (AEC) prevent feedback loops?',
    answer:
      'During conversation, an AI assistant’s audio playback can bleed into the microphone and trigger false transcription loops. Konthora implements hardware echo cancellation and a software audio-gate filter that suppresses playback frequencies while the assistant is speaking, enabling smooth full-duplex conversations without headphones.',
  },
  {
    question: 'Does Konthora support Bangla and Banglish code-switching?',
    answer:
      'Yes. Konthora is engineered specifically for multilingual enterprise teams. Whether you speak fluent English, native Bengali (বাংলা), or everyday conversational Banglish (e.g., “Apex Digital er jonno ekta invoice banau rate $85/hr”), the engine accurately isolates intent, normalizes currencies, and formats clean corporate documents.',
  },
  {
    question: 'Can I export, print, or edit the generated documents?',
    answer:
      'Every document produced by Konthora is rendered as a clean, reactive card with print-optimized stylesheets and one-click PDF generation. You can inspect line items, verify tax calculations, and print or download them on the spot.',
  },
  {
    question: 'Is my enterprise audio data private and secure?',
    answer:
      'All audio streams are processed in-memory. Voice synthesis runs directly on the local inference runtime via Kokoro-82M without uploading audio to third-party TTS clouds. No training on enterprise voice data is conducted.',
  },
];
