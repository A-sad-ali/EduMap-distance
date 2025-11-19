import { LayerVisibility } from "./types";

export const DEFAULT_CENTER = { lat: 30.1798, lng: 66.9750 }; // Approx Quetta/Balochistan center based on context
export const DEFAULT_ZOOM = 7;

export const INITIAL_LAYERS: LayerVisibility = {
  'high': true,
  'higher secondary': true,
  'degree': true,
  'inter': true,
  'commerce': true,
  'physical': true,
  'post graduate': true
};

// Mapping for display names matching Python script
export const LAYER_NAMES: Record<keyof LayerVisibility, string> = {
  'high': 'HSSC High Schools (H)',
  'higher secondary': 'HSSC Higher Secondary Schools (HS)',
  'degree': 'Colleges - Degree (D)',
  'inter': 'Colleges - Intermediate (I)',
  'commerce': 'Colleges - Commerce (C)',
  'physical': 'Colleges - Physical Education (PE)',
  'post graduate': 'Colleges - Post Graduate (PG)'
};

export const ICON_COLORS = {
  boys: "#338ca9", // green-blue
  girls: "#ff69b4", // pink
  "co-edu": "#ff7f0e", // orange
  unknown: "#888888"
};

export const LEVEL_CODES: Record<string, string> = {
  'high': 'H',
  'higher secondary': 'HS',
  'degree': 'D',
  'inter': 'I',
  'commerce': 'C',
  'physical': 'PE',
  'post graduate': 'PG',
  'unknown': '?'
};