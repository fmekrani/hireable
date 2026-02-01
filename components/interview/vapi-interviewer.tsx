"use client";

import { useEffect, useMemo, useState } from "react";
import { vapi, validateVapiConfig, type VapiVariableValues } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

type VapiInterviewerProps = {
  assistantName?: string;
  variableValues?: VapiVariableValues;
  firstMessage?: string;
};

type Message = {
  type: string;
  transcriptType?: string;
  role?: "user" | "assistant" | "system";
  transcript?: string;
};

export function VapiInterviewer({ assistantName = "AI Interviewer", variableValues, firstMessage }: VapiInterviewerProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [lastMessage, setLastMessage] = useState<string>("Interview transcript will appear here...");
  const [error, setError] = useState<string | null>(null);

  const assistantId = useMemo(() => {
    try {
      return validateVapiConfig().assistantId;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  useEffect(() => {
    const handleCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const handleCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const handleMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final" && message.transcript) {
        setLastMessage(message.transcript);
      }
    };

    const handleError = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, []);

  const handleStart = async () => {
    if (!assistantId) return;
    setError(null);
    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(assistantId, {
        variableValues,
        firstMessage,
      });
    } catch (err) {
      setCallStatus(CallStatus.INACTIVE);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStop = async () => {
    if (callStatus !== CallStatus.ACTIVE) return;
    try {
      await vapi.stop();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="bg-black/30 rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{assistantName}</h3>
          <p className="text-xs text-white/50">Voice interview session</p>
        </div>
        <span className="text-xs text-white/60">{callStatus}</span>
      </div>

      <div className="mt-4 min-h-[64px] rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80">
        {lastMessage}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex gap-2">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            onClick={handleStart}
            disabled={callStatus === CallStatus.CONNECTING || !assistantId}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Voice Interview"}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold"
          >
            End Interview
          </button>
        )}
      </div>
    </div>
  );
}
