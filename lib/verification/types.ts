import { z } from "zod";

export const beverageTypeSchema = z.enum([
  "distilled_spirits",
  "wine",
  "malt_beverage"
]);

export const applicationFieldsSchema = z
  .object({
    beverageType: beverageTypeSchema,
    brandName: z.string().trim().min(1, "Brand name is required."),
    classType: z.string().trim().min(1, "Class/type is required."),
    alcoholContent: z.string().trim().min(1, "Alcohol content is required."),
    netContents: z.string().trim().min(1, "Net contents is required."),
    bottlerOrProducerName: z.string().trim().optional(),
    bottlerOrProducerAddress: z.string().trim().optional(),
    imported: z.boolean(),
    countryOfOrigin: z.string().trim().optional()
  })
  .superRefine((value, context) => {
    if (value.imported && !value.countryOfOrigin) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["countryOfOrigin"],
        message: "Country of origin is required for imported products."
      });
    }
  });

export type ApplicationFields = z.infer<typeof applicationFieldsSchema>;

export type ExtractedEvidence = {
  field: string;
  text: string;
  confidence?: number;
};

export type ExtractedLabel = {
  rawText: string;
  brandName?: string;
  classType?: string;
  alcoholContent?: string;
  netContents?: string;
  bottlerOrProducerName?: string;
  bottlerOrProducerAddress?: string;
  countryOfOrigin?: string;
  governmentWarning?: string;
  evidence: ExtractedEvidence[];
};

export type CheckStatus = "pass" | "needs_review" | "fail";

export type VerificationCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  expected?: string;
  found?: string;
  evidence?: string;
  explanation: string;
};

export type VerificationResult = {
  overallStatus: CheckStatus;
  checks: VerificationCheck[];
  extractedLabel: ExtractedLabel;
  processingTimeMs: number;
  providerMode: "openai";
};
