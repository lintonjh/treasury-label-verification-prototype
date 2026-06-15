import type { ExtractedLabel } from "@/lib/verification/types";

export type VisionInput = {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
  requestId?: string;
  safetyIdentifier?: string;
};

export interface VisionProvider {
  extractLabelFields(input: VisionInput): Promise<ExtractedLabel>;
}

export type VisionProviderMode = "openai";

export type ResolvedVisionProvider = {
  mode: VisionProviderMode;
  provider: VisionProvider;
};
