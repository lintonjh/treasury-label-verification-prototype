import type { ExtractedLabel } from "@/lib/verification/types";

const governmentWarning =
  "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.";

const warningNeedsReview =
  "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY.";

type LabelDefinition = {
  fileName: string;
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  bottlerOrProducerName: string;
  bottlerOrProducerAddress: string;
  countryOfOrigin?: string;
  warning?: "pass" | "needs_review" | "missing";
};

function evidenceText(value: string): string {
  return value.toUpperCase();
}

function createExtractedLabel(definition: LabelDefinition): ExtractedLabel {
  const warning =
    definition.warning === "missing"
      ? undefined
      : definition.warning === "needs_review"
        ? warningNeedsReview
        : governmentWarning;

  const rawParts = [
    definition.brandName,
    definition.classType,
    definition.alcoholContent,
    definition.netContents,
    definition.bottlerOrProducerName,
    definition.bottlerOrProducerAddress,
    definition.countryOfOrigin ? `Product of ${definition.countryOfOrigin}` : undefined,
    warning || "PLEASE DRINK RESPONSIBLY."
  ].filter((part): part is string => Boolean(part));

  const evidence = [
    {
      field: "brandName",
      text: evidenceText(definition.brandName),
      confidence: 0.99
    },
    {
      field: "classType",
      text: evidenceText(definition.classType),
      confidence: 0.98
    },
    {
      field: "alcoholContent",
      text: evidenceText(definition.alcoholContent),
      confidence: 0.99
    },
    {
      field: "netContents",
      text: evidenceText(definition.netContents),
      confidence: 0.99
    },
    {
      field: "bottlerOrProducerName",
      text: evidenceText(definition.bottlerOrProducerName),
      confidence: 0.95
    },
    {
      field: "bottlerOrProducerAddress",
      text: evidenceText(definition.bottlerOrProducerAddress),
      confidence: 0.95
    },
    definition.countryOfOrigin
      ? {
          field: "countryOfOrigin",
          text: `PRODUCT OF ${definition.countryOfOrigin.toUpperCase()}`,
          confidence: 0.98
        }
      : undefined,
    warning
      ? {
          field: "governmentWarning",
          text:
            definition.warning === "needs_review"
              ? "Government Warning: According to the Surgeon General..."
              : "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL...",
          confidence: 0.97
        }
      : undefined
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    rawText: rawParts.join("\n"),
    brandName: definition.brandName,
    classType: definition.classType,
    alcoholContent: definition.alcoholContent,
    netContents: definition.netContents,
    bottlerOrProducerName: definition.bottlerOrProducerName,
    bottlerOrProducerAddress: definition.bottlerOrProducerAddress,
    countryOfOrigin: definition.countryOfOrigin,
    governmentWarning: warning,
    evidence
  };
}

const labelDefinitions: LabelDefinition[] = [
  {
    fileName: "old-tom-distillery-label.png",
    brandName: "Old Tom Distillery",
    classType: "Straight Bourbon Whiskey",
    alcoholContent: "45% Alc./Vol. (90 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Old Tom Distillery LLC",
    bottlerOrProducerAddress: "Louisville, Kentucky"
  },
  {
    fileName: "old-tom-abv-mismatch-label.png",
    brandName: "Old Tom Distillery",
    classType: "Straight Bourbon Whiskey",
    alcoholContent: "40% Alc./Vol. (80 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Old Tom Distillery LLC",
    bottlerOrProducerAddress: "Louisville, Kentucky"
  },
  {
    fileName: "old-tom-net-contents-mismatch-label.png",
    brandName: "Old Tom Distillery",
    classType: "Straight Bourbon Whiskey",
    alcoholContent: "45% Alc./Vol. (90 Proof)",
    netContents: "375 mL",
    bottlerOrProducerName: "Old Tom Distillery LLC",
    bottlerOrProducerAddress: "Louisville, Kentucky"
  },
  {
    fileName: "old-tom-missing-warning-label.png",
    brandName: "Old Tom Distillery",
    classType: "Straight Bourbon Whiskey",
    alcoholContent: "45% Alc./Vol. (90 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Old Tom Distillery LLC",
    bottlerOrProducerAddress: "Louisville, Kentucky",
    warning: "missing"
  },
  {
    fileName: "imported-agave-origin-label.png",
    brandName: "Sierra Luz",
    classType: "Mezcal",
    alcoholContent: "42% Alc./Vol. (84 Proof)",
    netContents: "700 mL",
    bottlerOrProducerName: "Destileria Sierra Luz",
    bottlerOrProducerAddress: "Oaxaca, Mexico",
    countryOfOrigin: "Mexico"
  },
  {
    fileName: "imported-agave-missing-origin-label.png",
    brandName: "Sierra Luz",
    classType: "Mezcal",
    alcoholContent: "42% Alc./Vol. (84 Proof)",
    netContents: "700 mL",
    bottlerOrProducerName: "Destileria Sierra Luz",
    bottlerOrProducerAddress: "Oaxaca"
  },
  {
    fileName: "riverbend-chardonnay-label.png",
    brandName: "Riverbend Cellars",
    classType: "Chardonnay",
    alcoholContent: "13.5% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Riverbend Cellars",
    bottlerOrProducerAddress: "Sonoma, California"
  },
  {
    fileName: "riverbend-chardonnay-abv-mismatch-label.png",
    brandName: "Riverbend Cellars",
    classType: "Chardonnay",
    alcoholContent: "12.5% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Riverbend Cellars",
    bottlerOrProducerAddress: "Sonoma, California"
  },
  {
    fileName: "hillside-merlot-label.png",
    brandName: "Hillside Ranch",
    classType: "Merlot",
    alcoholContent: "14.1% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Hillside Ranch Winery",
    bottlerOrProducerAddress: "Paso Robles, California"
  },
  {
    fileName: "hillside-merlot-missing-warning-label.png",
    brandName: "Hillside Ranch",
    classType: "Merlot",
    alcoholContent: "14.1% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Hillside Ranch Winery",
    bottlerOrProducerAddress: "Paso Robles, California",
    warning: "missing"
  },
  {
    fileName: "alpine-riesling-origin-label.png",
    brandName: "Alpine Star",
    classType: "Riesling",
    alcoholContent: "11.5% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Weingut Alpine Star",
    bottlerOrProducerAddress: "Mosel, Germany",
    countryOfOrigin: "Germany"
  },
  {
    fileName: "alpine-riesling-missing-origin-label.png",
    brandName: "Alpine Star",
    classType: "Riesling",
    alcoholContent: "11.5% Alc./Vol.",
    netContents: "750 mL",
    bottlerOrProducerName: "Weingut Alpine Star",
    bottlerOrProducerAddress: "Mosel"
  },
  {
    fileName: "bay-fog-sparkling-size-mismatch-label.png",
    brandName: "Bay Fog",
    classType: "Sparkling Wine",
    alcoholContent: "12% Alc./Vol.",
    netContents: "375 mL",
    bottlerOrProducerName: "Bay Fog Winery",
    bottlerOrProducerAddress: "Napa, California"
  },
  {
    fileName: "north-pier-lager-label.png",
    brandName: "North Pier",
    classType: "Lager Beer",
    alcoholContent: "5% Alc./Vol.",
    netContents: "355 mL",
    bottlerOrProducerName: "North Pier Brewing Co",
    bottlerOrProducerAddress: "Duluth, Minnesota"
  },
  {
    fileName: "north-pier-lager-abv-mismatch-label.png",
    brandName: "North Pier",
    classType: "Lager Beer",
    alcoholContent: "4.2% Alc./Vol.",
    netContents: "355 mL",
    bottlerOrProducerName: "North Pier Brewing Co",
    bottlerOrProducerAddress: "Duluth, Minnesota"
  },
  {
    fileName: "pine-trail-ipa-label.png",
    brandName: "Pine Trail",
    classType: "India Pale Ale",
    alcoholContent: "6.8% Alc./Vol.",
    netContents: "473 mL",
    bottlerOrProducerName: "Pine Trail Brewing",
    bottlerOrProducerAddress: "Bend, Oregon"
  },
  {
    fileName: "pine-trail-ipa-warning-case-label.png",
    brandName: "Pine Trail",
    classType: "India Pale Ale",
    alcoholContent: "6.8% Alc./Vol.",
    netContents: "473 mL",
    bottlerOrProducerName: "Pine Trail Brewing",
    bottlerOrProducerAddress: "Bend, Oregon",
    warning: "needs_review"
  },
  {
    fileName: "cedar-stout-size-mismatch-label.png",
    brandName: "Cedar Works",
    classType: "Stout",
    alcoholContent: "7.2% Alc./Vol.",
    netContents: "500 mL",
    bottlerOrProducerName: "Cedar Works Brewery",
    bottlerOrProducerAddress: "Asheville, North Carolina"
  },
  {
    fileName: "autumn-amber-missing-warning-label.png",
    brandName: "Autumn Field",
    classType: "Amber Ale",
    alcoholContent: "5.6% Alc./Vol.",
    netContents: "473 mL",
    bottlerOrProducerName: "Autumn Field Brewing",
    bottlerOrProducerAddress: "Burlington, Vermont",
    warning: "missing"
  },
  {
    fileName: "old-town-pils-origin-label.png",
    brandName: "Old Town Pils",
    classType: "Pilsner Beer",
    alcoholContent: "5.1% Alc./Vol.",
    netContents: "500 mL",
    bottlerOrProducerName: "Old Town Brewery",
    bottlerOrProducerAddress: "Prague, Czech Republic",
    countryOfOrigin: "Czech Republic"
  },
  {
    fileName: "moon-gate-gin-label.png",
    brandName: "Moon Gate",
    classType: "Gin",
    alcoholContent: "47% Alc./Vol. (94 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Moon Gate Spirits",
    bottlerOrProducerAddress: "Portland, Maine"
  },
  {
    fileName: "copper-ridge-vodka-producer-mismatch-label.png",
    brandName: "Copper Ridge",
    classType: "Vodka",
    alcoholContent: "40% Alc./Vol. (80 Proof)",
    netContents: "1 L",
    bottlerOrProducerName: "Copper Hill Distilling",
    bottlerOrProducerAddress: "Austin, Texas"
  },
  {
    fileName: "harbor-light-rum-label.png",
    brandName: "Harbor Light",
    classType: "Aged Rum",
    alcoholContent: "43% Alc./Vol. (86 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Harbor Light Rum Co",
    bottlerOrProducerAddress: "San Juan, Puerto Rico"
  },
  {
    fileName: "sierra-plata-tequila-missing-origin-label.png",
    brandName: "Sierra Plata",
    classType: "Tequila Blanco",
    alcoholContent: "40% Alc./Vol. (80 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Destileria Sierra Plata",
    bottlerOrProducerAddress: "Jalisco, Mexico"
  },
  {
    fileName: "maple-reserve-whisky-origin-label.png",
    brandName: "Maple Reserve",
    classType: "Canadian Whisky",
    alcoholContent: "40% Alc./Vol. (80 Proof)",
    netContents: "750 mL",
    bottlerOrProducerName: "Maple Reserve Distillers",
    bottlerOrProducerAddress: "Ontario, Canada",
    countryOfOrigin: "Canada"
  }
];

export const sampleExtractedLabel = createExtractedLabel(labelDefinitions[0]);

export const sampleExtractedLabelsByFileName: Record<string, ExtractedLabel> =
  Object.fromEntries(
    labelDefinitions.map((definition) => [
      definition.fileName,
      createExtractedLabel(definition)
    ])
  );
