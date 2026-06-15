import type { ApplicationFields } from "@/lib/verification/types";

export const sampleApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Old Tom Distillery",
  classType: "Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Old Tom Distillery LLC",
  bottlerOrProducerAddress: "Louisville, Kentucky",
  imported: false,
  countryOfOrigin: ""
};

export const importedAgaveSampleApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Sierra Luz",
  classType: "Mezcal",
  alcoholContent: "42% Alc./Vol. (84 Proof)",
  netContents: "700 mL",
  bottlerOrProducerName: "Destileria Sierra Luz",
  bottlerOrProducerAddress: "Oaxaca, Mexico",
  imported: true,
  countryOfOrigin: "Mexico"
};

const riverbendChardonnayApplication: ApplicationFields = {
  beverageType: "wine",
  brandName: "Riverbend Cellars",
  classType: "Chardonnay",
  alcoholContent: "13.5% Alc./Vol.",
  netContents: "750 mL",
  bottlerOrProducerName: "Riverbend Cellars",
  bottlerOrProducerAddress: "Sonoma, California",
  imported: false,
  countryOfOrigin: ""
};

const hillsideMerlotApplication: ApplicationFields = {
  beverageType: "wine",
  brandName: "Hillside Ranch",
  classType: "Merlot",
  alcoholContent: "14.1% Alc./Vol.",
  netContents: "750 mL",
  bottlerOrProducerName: "Hillside Ranch Winery",
  bottlerOrProducerAddress: "Paso Robles, California",
  imported: false,
  countryOfOrigin: ""
};

const alpineRieslingApplication: ApplicationFields = {
  beverageType: "wine",
  brandName: "Alpine Star",
  classType: "Riesling",
  alcoholContent: "11.5% Alc./Vol.",
  netContents: "750 mL",
  bottlerOrProducerName: "Weingut Alpine Star",
  bottlerOrProducerAddress: "Mosel, Germany",
  imported: true,
  countryOfOrigin: "Germany"
};

const bayFogSparklingApplication: ApplicationFields = {
  beverageType: "wine",
  brandName: "Bay Fog",
  classType: "Sparkling Wine",
  alcoholContent: "12% Alc./Vol.",
  netContents: "750 mL",
  bottlerOrProducerName: "Bay Fog Winery",
  bottlerOrProducerAddress: "Napa, California",
  imported: false,
  countryOfOrigin: ""
};

const northPierLagerApplication: ApplicationFields = {
  beverageType: "malt_beverage",
  brandName: "North Pier",
  classType: "Lager Beer",
  alcoholContent: "5% Alc./Vol.",
  netContents: "355 mL",
  bottlerOrProducerName: "North Pier Brewing Co",
  bottlerOrProducerAddress: "Duluth, Minnesota",
  imported: false,
  countryOfOrigin: ""
};

const pineTrailIpaApplication: ApplicationFields = {
  beverageType: "malt_beverage",
  brandName: "Pine Trail",
  classType: "India Pale Ale",
  alcoholContent: "6.8% Alc./Vol.",
  netContents: "473 mL",
  bottlerOrProducerName: "Pine Trail Brewing",
  bottlerOrProducerAddress: "Bend, Oregon",
  imported: false,
  countryOfOrigin: ""
};

const cedarStoutApplication: ApplicationFields = {
  beverageType: "malt_beverage",
  brandName: "Cedar Works",
  classType: "Stout",
  alcoholContent: "7.2% Alc./Vol.",
  netContents: "355 mL",
  bottlerOrProducerName: "Cedar Works Brewery",
  bottlerOrProducerAddress: "Asheville, North Carolina",
  imported: false,
  countryOfOrigin: ""
};

const autumnAmberApplication: ApplicationFields = {
  beverageType: "malt_beverage",
  brandName: "Autumn Field",
  classType: "Amber Ale",
  alcoholContent: "5.6% Alc./Vol.",
  netContents: "473 mL",
  bottlerOrProducerName: "Autumn Field Brewing",
  bottlerOrProducerAddress: "Burlington, Vermont",
  imported: false,
  countryOfOrigin: ""
};

const czechPilsnerApplication: ApplicationFields = {
  beverageType: "malt_beverage",
  brandName: "Old Town Pils",
  classType: "Pilsner Beer",
  alcoholContent: "5.1% Alc./Vol.",
  netContents: "500 mL",
  bottlerOrProducerName: "Old Town Brewery",
  bottlerOrProducerAddress: "Prague, Czech Republic",
  imported: true,
  countryOfOrigin: "Czech Republic"
};

const moonGateGinApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Moon Gate",
  classType: "Gin",
  alcoholContent: "47% Alc./Vol. (94 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Moon Gate Spirits",
  bottlerOrProducerAddress: "Portland, Maine",
  imported: false,
  countryOfOrigin: ""
};

const copperRidgeVodkaApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Copper Ridge",
  classType: "Vodka",
  alcoholContent: "40% Alc./Vol. (80 Proof)",
  netContents: "1 L",
  bottlerOrProducerName: "Copper Ridge Distilling",
  bottlerOrProducerAddress: "Austin, Texas",
  imported: false,
  countryOfOrigin: ""
};

const harborRumApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Harbor Light",
  classType: "Aged Rum",
  alcoholContent: "43% Alc./Vol. (86 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Harbor Light Rum Co",
  bottlerOrProducerAddress: "San Juan, Puerto Rico",
  imported: false,
  countryOfOrigin: ""
};

const sierraTequilaApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Sierra Plata",
  classType: "Tequila Blanco",
  alcoholContent: "40% Alc./Vol. (80 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Destileria Sierra Plata",
  bottlerOrProducerAddress: "Jalisco, Mexico",
  imported: true,
  countryOfOrigin: "Mexico"
};

const mapleReserveWhiskeyApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Maple Reserve",
  classType: "Canadian Whisky",
  alcoholContent: "40% Alc./Vol. (80 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Maple Reserve Distillers",
  bottlerOrProducerAddress: "Ontario, Canada",
  imported: true,
  countryOfOrigin: "Canada"
};

export type SampleScenario = {
  label: string;
  application: ApplicationFields;
  samplePath: string;
};

export const sampleScenarios: SampleScenario[] = [
  {
    label: "Bourbon: match",
    application: sampleApplication,
    samplePath: "/samples/old-tom-distillery-label.png"
  },
  {
    label: "Bourbon: ABV mismatch",
    application: sampleApplication,
    samplePath: "/samples/old-tom-abv-mismatch-label.png"
  },
  {
    label: "Bourbon: size mismatch",
    application: sampleApplication,
    samplePath: "/samples/old-tom-net-contents-mismatch-label.png"
  },
  {
    label: "Bourbon: missing warning",
    application: sampleApplication,
    samplePath: "/samples/old-tom-missing-warning-label.png"
  },
  {
    label: "Mezcal import: match",
    application: importedAgaveSampleApplication,
    samplePath: "/samples/imported-agave-origin-label.png"
  },
  {
    label: "Mezcal import: missing origin",
    application: importedAgaveSampleApplication,
    samplePath: "/samples/imported-agave-missing-origin-label.png"
  },
  {
    label: "Chardonnay: match",
    application: riverbendChardonnayApplication,
    samplePath: "/samples/riverbend-chardonnay-label.png"
  },
  {
    label: "Chardonnay: ABV mismatch",
    application: riverbendChardonnayApplication,
    samplePath: "/samples/riverbend-chardonnay-abv-mismatch-label.png"
  },
  {
    label: "Merlot: match",
    application: hillsideMerlotApplication,
    samplePath: "/samples/hillside-merlot-label.png"
  },
  {
    label: "Merlot: missing warning",
    application: hillsideMerlotApplication,
    samplePath: "/samples/hillside-merlot-missing-warning-label.png"
  },
  {
    label: "Riesling import: match",
    application: alpineRieslingApplication,
    samplePath: "/samples/alpine-riesling-origin-label.png"
  },
  {
    label: "Riesling import: missing origin",
    application: alpineRieslingApplication,
    samplePath: "/samples/alpine-riesling-missing-origin-label.png"
  },
  {
    label: "Sparkling wine: size mismatch",
    application: bayFogSparklingApplication,
    samplePath: "/samples/bay-fog-sparkling-size-mismatch-label.png"
  },
  {
    label: "Lager beer: match",
    application: northPierLagerApplication,
    samplePath: "/samples/north-pier-lager-label.png"
  },
  {
    label: "Lager beer: ABV mismatch",
    application: northPierLagerApplication,
    samplePath: "/samples/north-pier-lager-abv-mismatch-label.png"
  },
  {
    label: "IPA: match",
    application: pineTrailIpaApplication,
    samplePath: "/samples/pine-trail-ipa-label.png"
  },
  {
    label: "IPA: warning needs review",
    application: pineTrailIpaApplication,
    samplePath: "/samples/pine-trail-ipa-warning-case-label.png"
  },
  {
    label: "Stout: size mismatch",
    application: cedarStoutApplication,
    samplePath: "/samples/cedar-stout-size-mismatch-label.png"
  },
  {
    label: "Amber ale: missing warning",
    application: autumnAmberApplication,
    samplePath: "/samples/autumn-amber-missing-warning-label.png"
  },
  {
    label: "Pilsner import: match",
    application: czechPilsnerApplication,
    samplePath: "/samples/old-town-pils-origin-label.png"
  },
  {
    label: "Gin: match",
    application: moonGateGinApplication,
    samplePath: "/samples/moon-gate-gin-label.png"
  },
  {
    label: "Vodka: producer mismatch",
    application: copperRidgeVodkaApplication,
    samplePath: "/samples/copper-ridge-vodka-producer-mismatch-label.png"
  },
  {
    label: "Rum: match",
    application: harborRumApplication,
    samplePath: "/samples/harbor-light-rum-label.png"
  },
  {
    label: "Tequila import: missing origin",
    application: sierraTequilaApplication,
    samplePath: "/samples/sierra-plata-tequila-missing-origin-label.png"
  },
  {
    label: "Canadian whisky: match",
    application: mapleReserveWhiskeyApplication,
    samplePath: "/samples/maple-reserve-whisky-origin-label.png"
  }
];
