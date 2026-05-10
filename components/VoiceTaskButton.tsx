"use client";

import { useRef, useState, useCallback } from "react";
import { Mic } from "lucide-react";

interface VoiceTaskButtonProps {
  onCreateTask: (title: string) => void;
}

export function VoiceTaskButton({ onCreateTask }: VoiceTaskButtonProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [unsupported, setUnsupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setUnsupported(true);
      return;
    }

    setListening(true);
    setTranscript("");

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);

    const title = transcript.trim();
    if (title) {
      onCreateTask(title);
    }
  }, [transcript, onCreateTask]);

  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      startListening();
    }, 300);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (listening) {
      stopListening();
    }
  };

  const handlePointerLeave = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (listening) {
      stopListening();
    }
  };

  if (unsupported) return null;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-14 h-14 rounded-full animate-pulse bg-gold-500/10" />
        <div
          className="absolute w-16 h-16 rounded-full animate-ping opacity-20"
          style={{
            backgroundColor: listening ? "#4ade80" : "#e0be6a",
            animationDuration: "2s",
          }}
        />

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg select-none touch-none ${
            listening
              ? "bg-red-500 text-white scale-110 shadow-red-500/30"
              : "bg-gold-500 text-navy-950 shadow-gold-500/30"
          }`}
        >
          {listening ? (
            <Mic size={24} className="animate-pulse" />
          ) : (
            <Mic size={24} />
          )}
        </button>
      </div>

      <span className="text-[10px] text-text-muted text-center font-medium">
        {listening
          ? transcript
            ? `"${transcript.substring(0, 30)}..."`
            : "Listening..."
          : "Hold To Create Task"}
      </span>
    </div>
  );
}
