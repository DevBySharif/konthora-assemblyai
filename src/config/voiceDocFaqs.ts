export interface FAQItem {
  question: string;
  answer: string;
}

export const voiceDocFaqs: FAQItem[] = [
  {
    question: 'What makes Konthora different from generic transcription or TTS tools?',
    answer:
      'Unlike simple transcribe or text-to-speech tools, Konthora is a complete, full-duplex enterprise voice production engine powered by AssemblyAI\'s managed Voice Agent API. It handles STT, LLM reasoning, and natural voice synthesis in a single WebSocket connection with built-in tool calling for document generation.',
  },
  {
    question: 'How is sub-second latency achieved across the entire pipeline?',
    answer:
      'AssemblyAI\'s Voice Agent API manages the entire pipeline in one WebSocket: real-time speech capture at 24kHz, LLM inference, and neural voice synthesis — eliminating network hops between separate services. The result is sub-second response times from spoken utterance to voice reply.',
  },
  {
    question: 'How does echo cancellation work?',
    answer:
      'Browser-native AEC (echo cancellation) handles speaker-to-mic feedback automatically via getUserMedia. Additionally, the mic worklet mutes audio during agent speech to prevent any residual echo, ensuring clean full-duplex conversations without headphones.',
  },
  {
    question: 'Does Konthora support Bangla and Banglish code-switching?',
    answer:
      'Yes. Konthora is engineered specifically for multilingual enterprise teams. Whether you speak fluent English, native Bengali (বাংলা), or everyday conversational Banglish (e.g., "Apex Digital er jonno ekta invoice banau rate $85/hr"), the engine accurately isolates intent, normalizes currencies, and formats clean corporate documents.',
  },
  {
    question: 'Can I export, print, or edit the generated documents?',
    answer:
      'Every document produced by Konthora is rendered as a clean, reactive card with print-optimized stylesheets and one-click PDF generation. You can inspect line items, verify tax calculations, and print or download them on the spot.',
  },
  {
    question: 'Is my enterprise audio data private and secure?',
    answer:
      'Audio is processed by AssemblyAI\'s Voice Agent API with enterprise-grade security. Document generation happens on our backend. Voice data is never stored beyond the active session. No training on enterprise voice data is conducted.',
  },
];
