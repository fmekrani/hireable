import Vapi from "@vapi-ai/web";

export type VapiVariableValues = Record<string, string | number | boolean>;

export type VapiAssistantOverrides = {
  variableValues?: VapiVariableValues;
  firstMessage?: string;
};

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || "");

export function validateVapiConfig() {
  const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

  if (!webToken) {
    throw new Error("NEXT_PUBLIC_VAPI_WEB_TOKEN is required");
  }

  if (!assistantId) {
    throw new Error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is required");
  }

  return { webToken, assistantId };
}
