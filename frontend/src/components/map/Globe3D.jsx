import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// ============================================================
// DATA: Country centroids (lat, lng) for globe markers
// ============================================================
const COUNTRIES = [
  { id: 'US', name: 'United States', lat: 39.8, lng: -98.5 },
  { id: 'RU', name: 'Russia', lat: 61.5, lng: 105.3 },
  { id: 'CN', name: 'China', lat: 35.9, lng: 104.2 },
  { id: 'GB', name: 'United Kingdom', lat: 55.4, lng: -3.4 },
  { id: 'FR', name: 'France', lat: 46.2, lng: 2.2 },
  { id: 'DE', name: 'Germany', lat: 51.2, lng: 10.4 },
  { id: 'JP', name: 'Japan', lat: 36.2, lng: 138.3 },
  { id: 'IN', name: 'India', lat: 20.6, lng: 79.0 },
  { id: 'BR', name: 'Brazil', lat: -14.2, lng: -51.9 },
  { id: 'AU', name: 'Australia', lat: -25.3, lng: 133.8 },
  { id: 'ZA', name: 'South Africa', lat: -30.6, lng: 22.9 },
  { id: 'EG', name: 'Egypt', lat: 26.8, lng: 30.8 },
  { id: 'NG', name: 'Nigeria', lat: 9.1, lng: 8.7 },
  { id: 'KE', name: 'Kenya', lat: -0.02, lng: 37.9 },
  { id: 'MX', name: 'Mexico', lat: 23.6, lng: -102.6 },
  { id: 'AR', name: 'Argentina', lat: -38.4, lng: -63.6 },
  { id: 'CL', name: 'Chile', lat: -35.7, lng: -71.5 },
  { id: 'CO', name: 'Colombia', lat: 4.6, lng: -74.3 },
  { id: 'PE', name: 'Peru', lat: -9.2, lng: -75.0 },
  { id: 'VE', name: 'Venezuela', lat: 6.4, lng: -66.6 },
  { id: 'CU', name: 'Cuba', lat: 21.5, lng: -77.8 },
  { id: 'TR', name: 'Turkey', lat: 38.9, lng: 35.2 },
  { id: 'IR', name: 'Iran', lat: 32.4, lng: 53.7 },
  { id: 'IQ', name: 'Iraq', lat: 33.2, lng: 43.7 },
  { id: 'SY', name: 'Syria', lat: 34.8, lng: 38.9 },
  { id: 'SA', name: 'Saudi Arabia', lat: 23.9, lng: 45.1 },
  { id: 'IL', name: 'Israel', lat: 31.0, lng: 34.9 },
  { id: 'PS', name: 'Palestine', lat: 31.9, lng: 35.2 },
  { id: 'LB', name: 'Lebanon', lat: 33.9, lng: 35.9 },
  { id: 'AF', name: 'Afghanistan', lat: 33.9, lng: 67.7 },
  { id: 'PK', name: 'Pakistan', lat: 30.4, lng: 69.3 },
  { id: 'UA', name: 'Ukraine', lat: 48.4, lng: 31.2 },
  { id: 'PL', name: 'Poland', lat: 51.9, lng: 19.1 },
  { id: 'SE', name: 'Sweden', lat: 60.1, lng: 18.6 },
  { id: 'NO', name: 'Norway', lat: 60.5, lng: 8.5 },
  { id: 'FI', name: 'Finland', lat: 61.9, lng: 25.7 },
  { id: 'ES', name: 'Spain', lat: 40.5, lng: -3.7 },
  { id: 'IT', name: 'Italy', lat: 41.9, lng: 12.6 },
  { id: 'GR', name: 'Greece', lat: 39.1, lng: 21.8 },
  { id: 'KR', name: 'South Korea', lat: 35.9, lng: 127.8 },
  { id: 'KP', name: 'North Korea', lat: 40.3, lng: 127.5 },
  { id: 'VN', name: 'Vietnam', lat: 14.1, lng: 108.3 },
  { id: 'TH', name: 'Thailand', lat: 15.9, lng: 100.9 },
  { id: 'MM', name: 'Myanmar', lat: 21.9, lng: 96.0 },
  { id: 'ID', name: 'Indonesia', lat: -0.8, lng: 113.9 },
  { id: 'PH', name: 'Philippines', lat: 12.9, lng: 121.8 },
  { id: 'ET', name: 'Ethiopia', lat: 9.1, lng: 40.5 },
  { id: 'CD', name: 'DR Congo', lat: -4.0, lng: 21.8 },
  { id: 'SD', name: 'Sudan', lat: 12.9, lng: 30.2 },
  { id: 'LY', name: 'Libya', lat: 26.3, lng: 17.2 },
  { id: 'DZ', name: 'Algeria', lat: 28.0, lng: 1.7 },
  { id: 'MA', name: 'Morocco', lat: 31.8, lng: -7.1 },
  { id: 'TN', name: 'Tunisia', lat: 33.9, lng: 9.5 },
  { id: 'YE', name: 'Yemen', lat: 15.6, lng: 48.5 },
  { id: 'SO', name: 'Somalia', lat: 5.2, lng: 46.2 },
  { id: 'GE', name: 'Georgia', lat: 42.3, lng: 43.4 },
  { id: 'RS', name: 'Serbia', lat: 44.0, lng: 21.0 },
  { id: 'BA', name: 'Bosnia', lat: 43.9, lng: 17.7 },
  { id: 'HR', name: 'Croatia', lat: 45.1, lng: 15.2 },
  { id: 'RW', name: 'Rwanda', lat: -1.9, lng: 29.9 },
  { id: 'BI', name: 'Burundi', lat: -3.4, lng: 29.9 },
  { id: 'TW', name: 'Taiwan', lat: 23.7, lng: 121.0 },
  { id: 'NL', name: 'Netherlands', lat: 52.1, lng: 5.3 },
  { id: 'BE', name: 'Belgium', lat: 50.5, lng: 4.5 },
  { id: 'PT', name: 'Portugal', lat: 39.4, lng: -8.2 },
  { id: 'IE', name: 'Ireland', lat: 53.1, lng: -8.2 },
  { id: 'AT', name: 'Austria', lat: 47.5, lng: 14.6 },
  { id: 'CH', name: 'Switzerland', lat: 46.8, lng: 8.2 },
  { id: 'RO', name: 'Romania', lat: 45.9, lng: 25.0 },
  { id: 'BG', name: 'Bulgaria', lat: 42.7, lng: 25.5 },
  { id: 'HU', name: 'Hungary', lat: 47.2, lng: 19.5 },
  { id: 'CZ', name: 'Czechia', lat: 49.8, lng: 15.5 },
  { id: 'SK', name: 'Slovakia', lat: 48.7, lng: 19.7 },
  { id: 'ER', name: 'Eritrea', lat: 15.2, lng: 39.8 },
  { id: 'SS', name: 'South Sudan', lat: 6.9, lng: 31.3 },
  { id: 'ML', name: 'Mali', lat: 17.6, lng: -4.0 },
  { id: 'NE', name: 'Niger', lat: 17.6, lng: 8.1 },
  { id: 'BF', name: 'Burkina Faso', lat: 12.2, lng: -1.6 },
  { id: 'TD', name: 'Chad', lat: 15.5, lng: 18.7 },
  { id: 'CF', name: 'Central African Republic', lat: 6.6, lng: 20.9 },
  { id: 'MZ', name: 'Mozambique', lat: -18.7, lng: 35.5 },
  { id: 'KH', name: 'Cambodia', lat: 12.6, lng: 105.0 },
  { id: 'LA', name: 'Laos', lat: 19.9, lng: 102.5 },
  { id: 'BD', name: 'Bangladesh', lat: 23.7, lng: 90.4 },
  { id: 'LK', name: 'Sri Lanka', lat: 7.9, lng: 80.8 },
  { id: 'NP', name: 'Nepal', lat: 28.4, lng: 84.1 },
  { id: 'AO', name: 'Angola', lat: -11.2, lng: 17.9 },
  { id: 'UG', name: 'Uganda', lat: 1.4, lng: 32.3 },
  { id: 'SN', name: 'Senegal', lat: 14.5, lng: -14.5 },
  { id: 'GH', name: 'Ghana', lat: 7.9, lng: -1.0 },
  { id: 'CM', name: 'Cameroon', lat: 7.4, lng: 12.4 },
  { id: 'CI', name: "Cote d'Ivoire", lat: 7.5, lng: -5.5 },
  { id: 'TZ', name: 'Tanzania', lat: -6.4, lng: 34.9 },
  { id: 'BO', name: 'Bolivia', lat: -16.3, lng: -63.6 },
  { id: 'EC', name: 'Ecuador', lat: -1.8, lng: -78.2 },
  { id: 'GT', name: 'Guatemala', lat: 15.8, lng: -90.2 },
  { id: 'HN', name: 'Honduras', lat: 15.2, lng: -86.2 },
  { id: 'SV', name: 'El Salvador', lat: 13.8, lng: -88.9 },
  { id: 'NI', name: 'Nicaragua', lat: 12.9, lng: -85.2 },
  { id: 'HT', name: 'Haiti', lat: 19.1, lng: -72.3 },
  { id: 'JO', name: 'Jordan', lat: 30.6, lng: 36.2 },
  { id: 'AE', name: 'UAE', lat: 23.4, lng: 53.8 },
  { id: 'QA', name: 'Qatar', lat: 25.4, lng: 51.2 },
  { id: 'KW', name: 'Kuwait', lat: 29.3, lng: 47.5 },
  { id: 'BH', name: 'Bahrain', lat: 26.0, lng: 50.6 },
  { id: 'OM', name: 'Oman', lat: 21.5, lng: 55.9 },
  { id: 'MY', name: 'Malaysia', lat: 4.2, lng: 101.9 },
  { id: 'SG', name: 'Singapore', lat: 1.4, lng: 103.8 },
  { id: 'NZ', name: 'New Zealand', lat: -40.9, lng: 174.9 },
  { id: 'CA', name: 'Canada', lat: 56.1, lng: -106.3 },
  { id: 'IS', name: 'Iceland', lat: 65.0, lng: -19.0 },
  { id: 'DK', name: 'Denmark', lat: 56.3, lng: 9.5 },
  { id: 'EH', name: 'Western Sahara', lat: 24.2, lng: -12.9 },
];

// ============================================================
// DATA: Major conflicts & wars with sides
// ============================================================
const CONFLICTS = [
  {
    id: 'ww2', name: 'World War II', type: 'interstate',
    startYear: 1939, endYear: 1945, casualties: '70-85 million',
    description: 'The deadliest conflict in human history, fought between the Allies and the Axis powers.',
    sides: [
      { name: 'Allies', color: '#22c55e', countries: ['US', 'GB', 'FR', 'RU', 'CN', 'AU', 'CA', 'IN', 'BR', 'NZ', 'ZA', 'PL', 'NL', 'BE', 'NO', 'GR'] },
      { name: 'Axis', color: '#dc2626', countries: ['DE', 'JP', 'IT', 'HU', 'RO', 'BG', 'FI'] },
    ],
  },
  {
    id: 'korean', name: 'Korean War', type: 'interstate',
    startYear: 1950, endYear: 1953, casualties: '~3 million',
    description: 'Cold War proxy conflict between North and South Korea backed by major powers.',
    sides: [
      { name: 'UN Coalition', color: '#3b82f6', countries: ['KR', 'US', 'GB', 'AU', 'CA', 'TR', 'FR', 'TH', 'PH', 'NL', 'BE', 'GR', 'NZ', 'ET', 'CO'] },
      { name: 'Communist', color: '#dc2626', countries: ['KP', 'CN', 'RU'] },
    ],
  },
  {
    id: 'vietnam', name: 'Vietnam War', type: 'interstate',
    startYear: 1955, endYear: 1975, casualties: '~3.5 million',
    description: 'Anti-imperialist war of liberation against US intervention in Southeast Asia.',
    sides: [
      { name: 'North Vietnam & Allies', color: '#dc2626', countries: ['VN', 'CN', 'RU', 'KP', 'CU'] },
      { name: 'US & Allies', color: '#3b82f6', countries: ['US', 'KR', 'AU', 'NZ', 'TH', 'PH'] },
    ],
  },
  {
    id: 'palestine', name: 'Israeli-Palestinian Conflict', type: 'occupation',
    startYear: 1948, endYear: 2026, casualties: 'Ongoing',
    description: 'Ongoing occupation and settler-colonial project against the Palestinian people.',
    sides: [
      { name: 'Palestine & Solidarity', color: '#22c55e', countries: ['PS', 'LB', 'SY', 'IR', 'IQ', 'YE', 'JO', 'EG', 'SA', 'DZ', 'TN', 'MA', 'LY', 'QA', 'TR'] },
      { name: 'Israel & Backers', color: '#3b82f6', countries: ['IL', 'US', 'GB'] },
    ],
  },
  {
    id: 'ukraine', name: 'Russia-Ukraine War', type: 'interstate',
    startYear: 2022, endYear: 2026, casualties: '500,000+',
    description: 'Russian invasion of Ukraine, largest European conflict since WWII.',
    sides: [
      { name: 'Ukraine & NATO Allies', color: '#3b82f6', countries: ['UA', 'US', 'GB', 'FR', 'DE', 'PL', 'CA', 'AU', 'NL', 'NO', 'SE', 'FI', 'DK', 'CZ', 'SK', 'RO', 'BG', 'ES', 'IT', 'BE', 'PT'] },
      { name: 'Russia & Allies', color: '#dc2626', countries: ['RU', 'KP', 'IR'] },
    ],
  },
  {
    id: 'syria', name: 'Syrian Civil War', type: 'civil',
    startYear: 2011, endYear: 2024, casualties: '600,000+',
    description: 'Multi-faction civil war following the Arab Spring uprising against Assad.',
    sides: [
      { name: 'Opposition & Kurdish Forces', color: '#22c55e', countries: ['SY', 'TR', 'SA', 'QA', 'US'] },
      { name: 'Assad Regime & Allies', color: '#dc2626', countries: ['RU', 'IR', 'LB'] },
    ],
  },
  {
    id: 'yemen', name: 'Yemeni Civil War', type: 'civil',
    startYear: 2014, endYear: 2026, casualties: '377,000+',
    description: 'Conflict between Houthi forces and Saudi-backed government coalition.',
    sides: [
      { name: 'Houthi / Ansar Allah', color: '#22c55e', countries: ['YE', 'IR'] },
      { name: 'Saudi Coalition', color: '#f97316', countries: ['SA', 'AE', 'BH', 'KW', 'EG', 'SD'] },
    ],
  },
  {
    id: 'coldwar', name: 'Cold War', type: 'interstate',
    startYear: 1947, endYear: 1991, casualties: 'Proxy wars: millions',
    description: 'Global ideological confrontation between capitalist West and socialist East.',
    sides: [
      { name: 'NATO / Western Bloc', color: '#3b82f6', countries: ['US', 'GB', 'FR', 'DE', 'IT', 'CA', 'AU', 'JP', 'KR', 'TR', 'NL', 'BE', 'NO', 'DK', 'IS', 'PT', 'ES', 'GR'] },
      { name: 'Warsaw Pact / Eastern Bloc', color: '#dc2626', countries: ['RU', 'CN', 'CU', 'KP', 'VN', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'ET'] },
    ],
  },
  {
    id: 'ethiopia_tigray', name: 'Tigray War', type: 'civil',
    startYear: 2020, endYear: 2022, casualties: '600,000+',
    description: 'Devastating civil war between Ethiopian government and Tigray forces.',
    sides: [
      { name: 'Ethiopian Government', color: '#f97316', countries: ['ET', 'ER', 'SO'] },
      { name: 'Tigray Forces', color: '#a855f7', countries: ['ET'] },
    ],
  },
  {
    id: 'sudan_civil', name: 'Sudan Civil War', type: 'civil',
    startYear: 2023, endYear: 2026, casualties: '150,000+',
    description: 'War between Sudanese Armed Forces and Rapid Support Forces.',
    sides: [
      { name: 'SAF (Army)', color: '#3b82f6', countries: ['SD', 'EG'] },
      { name: 'RSF (Paramilitaries)', color: '#dc2626', countries: ['SD'] },
    ],
  },
  {
    id: 'myanmar', name: 'Myanmar Civil War', type: 'civil',
    startYear: 2021, endYear: 2026, casualties: '50,000+',
    description: 'Resistance against military junta following 2021 coup.',
    sides: [
      { name: 'Resistance Forces', color: '#22c55e', countries: ['MM'] },
      { name: 'Military Junta', color: '#dc2626', countries: ['MM', 'CN', 'RU'] },
    ],
  },
  {
    id: 'drc', name: 'Congo Wars', type: 'civil',
    startYear: 1996, endYear: 2026, casualties: '6 million+',
    description: 'Deadliest conflict since WWII. Ongoing resource wars in eastern Congo.',
    sides: [
      { name: 'DRC Government', color: '#3b82f6', countries: ['CD', 'AO', 'ZA'] },
      { name: 'M23 & Rwanda-backed', color: '#dc2626', countries: ['RW', 'UG'] },
    ],
  },
  {
    id: 'iraq_war', name: 'Iraq War', type: 'interstate',
    startYear: 2003, endYear: 2011, casualties: '~1 million',
    description: 'US-led invasion and occupation of Iraq based on false pretenses.',
    sides: [
      { name: 'US-led Coalition', color: '#3b82f6', countries: ['US', 'GB', 'AU', 'PL', 'IT', 'ES', 'DK', 'NL'] },
      { name: 'Iraqi Resistance', color: '#dc2626', countries: ['IQ'] },
    ],
  },
  {
    id: 'afghan', name: 'Afghanistan War', type: 'interstate',
    startYear: 2001, endYear: 2021, casualties: '176,000+',
    description: 'US/NATO invasion and 20-year occupation of Afghanistan.',
    sides: [
      { name: 'NATO Coalition', color: '#3b82f6', countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'NL', 'NO', 'DK', 'TR'] },
      { name: 'Taliban & Insurgents', color: '#dc2626', countries: ['AF', 'PK'] },
    ],
  },
  {
    id: 'rwanda', name: 'Rwandan Genocide', type: 'civil',
    startYear: 1994, endYear: 1994, casualties: '800,000+',
    description: 'Genocide against Tutsi people by Hutu extremists.',
    sides: [
      { name: 'RPF (Resistance)', color: '#22c55e', countries: ['RW', 'UG'] },
      { name: 'Hutu Govt / Interahamwe', color: '#dc2626', countries: ['RW'] },
    ],
  },
  {
    id: 'bosnia', name: 'Bosnian War', type: 'civil',
    startYear: 1992, endYear: 1995, casualties: '100,000+',
    description: 'Ethnic conflict and genocide during the breakup of Yugoslavia.',
    sides: [
      { name: 'Bosniak / NATO', color: '#3b82f6', countries: ['BA', 'HR', 'US'] },
      { name: 'Bosnian Serbs / Serbia', color: '#dc2626', countries: ['RS'] },
    ],
  },
  {
    id: 'libya', name: 'Libyan Civil Wars', type: 'civil',
    startYear: 2011, endYear: 2020, casualties: '30,000+',
    description: 'NATO intervention and subsequent civil war following Arab Spring.',
    sides: [
      { name: 'GNA / NATO', color: '#3b82f6', countries: ['LY', 'US', 'GB', 'FR', 'IT', 'TR', 'QA'] },
      { name: 'LNA / Haftar', color: '#dc2626', countries: ['RU', 'EG', 'AE', 'SA'] },
    ],
  },
  {
    id: 'sahel', name: 'Sahel Insurgency', type: 'civil',
    startYear: 2012, endYear: 2026, casualties: '50,000+',
    description: 'Jihadist insurgency across the Sahel region of West Africa.',
    sides: [
      { name: 'Sahel States', color: '#f97316', countries: ['ML', 'BF', 'NE', 'TD', 'NG'] },
      { name: 'Former Colonial Powers', color: '#3b82f6', countries: ['FR', 'US'] },
    ],
  },
];

// ============================================================
// LIBERATION STRUGGLES
// ============================================================
const LIBERATION_STRUGGLES = [
  { id: 'palestine', name: 'Palestine', lat: 31.5, lng: 35.0, color: '#22c55e', description: '418 Nakba villages destroyed, 500+ checkpoints, ongoing settlement expansion' },
  { id: 'kurdistan', name: 'Kurdistan', lat: 37.0, lng: 43.0, color: '#f97316', description: '4,000+ villages destroyed by Turkish & Iraqi forces' },
  { id: 'kashmir', name: 'Kashmir', lat: 34.1, lng: 74.8, color: '#a855f7', description: '700,000+ Indian troops occupying Kashmir' },
  { id: 'tibet', name: 'Tibet', lat: 31.2, lng: 88.8, color: '#eab308', description: '6,000+ monasteries destroyed, 160+ self-immolations' },
  { id: 'western_sahara', name: 'Western Sahara', lat: 24.2, lng: -12.9, color: '#06b6d4', description: '2,700km sand berm, 7M+ landmines, 173,000 refugees' },
  { id: 'west_papua', name: 'West Papua', lat: -4.0, lng: 138.0, color: '#ec4899', description: '500,000+ killed since 1963 Indonesian occupation' },
  { id: 'ireland', name: 'Northern Ireland', lat: 54.6, lng: -5.9, color: '#14b8a6', description: 'The Troubles: 3,500+ killed, ongoing division' },
  { id: 'uyghur', name: 'Uyghur Region', lat: 41.0, lng: 85.0, color: '#f43f5e', description: '1M+ detained in concentration camps' },
];

// ============================================================
// UTILITIES
// ============================================================
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createCurvedLine(start, end, color, height = 0.2, segments = 64) {
  const points = [];
  const startV = latLngToVector3(start.lat, start.lng, 1);
  const endV = latLngToVector3(end.lat, end.lng, 1);
  const mid = new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5);
  const dist = startV.distanceTo(endV);
  mid.normalize().multiplyScalar(1 + height * dist);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3();
    p.x = (1 - t) * (1 - t) * startV.x + 2 * (1 - t) * t * mid.x + t * t * endV.x;
    p.y = (1 - t) * (1 - t) * startV.y + 2 * (1 - t) * t * mid.y + t * t * endV.y;
    p.z = (1 - t) * (1 - t) * startV.z + 2 * (1 - t) * t * mid.z + t * t * endV.z;
    points.push(p);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.6,
  });
  return new THREE.Line(geometry, material);
}

function createGlowSprite(color, size = 0.04) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color + 'aa');
  gradient.addColorStop(1, color + '00');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  return sprite;
}

function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#0a1628');
  oceanGrad.addColorStop(0.3, '#0d1f3c');
  oceanGrad.addColorStop(0.5, '#0f2847');
  oceanGrad.addColorStop(0.7, '#0d1f3c');
  oceanGrad.addColorStop(1, '#0a1628');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Subtle grid lines (latitude/longitude)
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 36; i++) {
    ctx.beginPath();
    ctx.moveTo((i / 36) * 2048, 0);
    ctx.lineTo((i / 36) * 2048, 1024);
    ctx.stroke();
  }
  for (let i = 0; i <= 18; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i / 18) * 1024);
    ctx.lineTo(2048, (i / 18) * 1024);
    ctx.stroke();
  }

  // Simplified continent outlines (approximate bounding regions)
  const continents = [
    // North America
    [[140,180],[165,200],[200,260],[250,310],[310,360],[340,380],[310,400],[250,410],[180,380],[140,320],[120,260],[130,210]],
    // South America
    [[270,400],[310,400],[350,430],[370,480],[360,540],[340,600],[310,660],[280,700],[260,680],[240,600],[230,530],[240,470],[260,420]],
    // Europe
    [[930,160],[980,140],[1040,150],[1100,170],[1100,220],[1070,260],[1020,280],[960,290],[920,270],[900,230],[910,190]],
    // Africa
    [[920,290],[980,290],[1040,310],[1080,360],[1100,430],[1080,520],[1040,600],[980,640],[940,620],[900,560],[880,480],[870,400],[880,340],[900,300]],
    // Asia
    [[1100,100],[1200,80],[1350,90],[1500,120],[1600,150],[1650,200],[1600,280],[1500,320],[1400,340],[1350,380],[1280,360],[1200,320],[1150,280],[1100,240],[1080,180]],
    // India
    [[1280,310],[1320,300],[1360,330],[1350,400],[1320,440],[1280,420],[1260,370]],
    // Australia
    [[1500,530],[1580,510],[1650,530],[1680,570],[1660,620],[1600,650],[1530,640],[1500,600],[1490,560]],
    // Southeast Asia islands (approximate)
    [[1420,380],[1440,370],[1460,390],[1450,420],[1420,410]],
    [[1500,400],[1540,380],[1580,400],[1570,440],[1520,450],[1500,420]],
  ];

  continents.forEach((points) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev[0] + curr[0]) / 2;
      const cpy = (prev[1] + curr[1]) / 2;
      ctx.quadraticCurveTo(prev[0], prev[1], cpx, cpy);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(30, 58, 92, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 140, 220, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  return new THREE.CanvasTexture(canvas);
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Globe3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const arcGroupRef = useRef(null);
  const markerGroupRef = useRef(null);
  const liberationGroupRef = useRef(null);
  const frameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const autoRotateRef = useRef(true);
  const zoomRef = useRef(2.8);
  const hoveredRef = useRef(null);

  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showLiberationStruggles, setShowLiberationStruggles] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidePanel, setSidePanel] = useState(null);
  const [viewMode, setViewMode] = useState('conflicts');

  const activeConflicts = useMemo(() => {
    return CONFLICTS.filter(c => c.startYear <= selectedYear && c.endYear >= selectedYear);
  }, [selectedYear]);

  const countryToConflict = useMemo(() => {
    const map = {};
    activeConflicts.forEach(conflict => {
      conflict.sides.forEach(side => {
        side.countries.forEach(countryId => {
          if (!map[countryId]) map[countryId] = [];
          map[countryId].push({ conflict, side });
        });
      });
    });
    return map;
  }, [activeConflicts]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080c14');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = zoomRef.current;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x334466, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    const backLight = new THREE.DirectionalLight(0x4488cc, 0.5);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Globe
    const earthTexture = createEarthTexture();
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: new THREE.Color(0x222244),
      shininess: 15,
      transparent: false,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.015, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3388ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.FrontSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(1.06, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x1155aa,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    // Groups for dynamic content
    const arcGroup = new THREE.Group();
    scene.add(arcGroup);
    arcGroupRef.current = arcGroup;

    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    markerGroupRef.current = markerGroup;

    const liberationGroup = new THREE.Group();
    scene.add(liberationGroup);
    liberationGroupRef.current = liberationGroup;

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      starPositions[i] = (Math.random() - 0.5) * 50;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.y += 0.001;
      }

      globe.rotation.x = rotationRef.current.x;
      globe.rotation.y = rotationRef.current.y;
      atmosphere.rotation.x = rotationRef.current.x;
      atmosphere.rotation.y = rotationRef.current.y;
      arcGroup.rotation.x = rotationRef.current.x;
      arcGroup.rotation.y = rotationRef.current.y;
      markerGroup.rotation.x = rotationRef.current.x;
      markerGroup.rotation.y = rotationRef.current.y;
      liberationGroup.rotation.x = rotationRef.current.x;
      liberationGroup.rotation.y = rotationRef.current.y;

      // Pulse effect on markers
      const time = Date.now() * 0.003;
      markerGroup.children.forEach((child, i) => {
        if (child.isSprite) {
          const scale = 0.04 + Math.sin(time + i * 0.5) * 0.01;
          child.scale.set(scale, scale, 1);
        }
      });

      camera.position.z = zoomRef.current;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - previousMouseRef.current.x;
      const dy = e.clientY - previousMouseRef.current.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 3000);
    };
    const onWheel = (e) => {
      e.preventDefault();
      zoomRef.current += e.deltaY * 0.001;
      zoomRef.current = Math.max(1.5, Math.min(5, zoomRef.current));
    };

    // Touch support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        autoRotateRef.current = false;
        previousMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - previousMouseRef.current.x;
      const dy = e.touches[0].clientY - previousMouseRef.current.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      previousMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 3000);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update conflict arcs and markers
  useEffect(() => {
    const arcGroup = arcGroupRef.current;
    const markerGroup = markerGroupRef.current;
    const liberationGroup = liberationGroupRef.current;
    if (!arcGroup || !markerGroup || !liberationGroup) return;

    // Clear
    while (arcGroup.children.length) arcGroup.remove(arcGroup.children[0]);
    while (markerGroup.children.length) markerGroup.remove(markerGroup.children[0]);
    while (liberationGroup.children.length) liberationGroup.remove(liberationGroup.children[0]);

    if (showConflicts) {
      // Country markers for countries involved in conflicts
      const processedCountries = new Set();
      activeConflicts.forEach(conflict => {
        conflict.sides.forEach(side => {
          side.countries.forEach(countryId => {
            const country = COUNTRIES.find(c => c.id === countryId);
            if (!country || processedCountries.has(countryId)) return;
            processedCountries.add(countryId);

            const pos = latLngToVector3(country.lat, country.lng, 1.01);
            const sprite = createGlowSprite(side.color, 0.04);
            sprite.position.copy(pos);
            sprite.userData = { countryId, country, conflict, side };
            markerGroup.add(sprite);
          });

          // Draw arcs between countries on same side
          for (let i = 0; i < side.countries.length - 1; i++) {
            const c1 = COUNTRIES.find(c => c.id === side.countries[i]);
            const c2 = COUNTRIES.find(c => c.id === side.countries[i + 1]);
            if (c1 && c2) {
              const arc = createCurvedLine(c1, c2, side.color, 0.15);
              arcGroup.add(arc);
            }
          }
        });

        // Draw conflict arcs between opposing sides
        if (conflict.sides.length >= 2) {
          const side1 = conflict.sides[0];
          const side2 = conflict.sides[1];
          const c1 = COUNTRIES.find(c => c.id === side1.countries[0]);
          const c2 = COUNTRIES.find(c => c.id === side2.countries[0]);
          if (c1 && c2) {
            const arc = createCurvedLine(c1, c2, '#ff4444', 0.3);
            arc.material.opacity = 0.4;
            arcGroup.add(arc);
          }
        }
      });
    }

    // Liberation struggle markers
    if (showLiberationStruggles) {
      LIBERATION_STRUGGLES.forEach(struggle => {
        const pos = latLngToVector3(struggle.lat, struggle.lng, 1.02);
        const sprite = createGlowSprite(struggle.color, 0.06);
        sprite.position.copy(pos);
        sprite.userData = { liberation: struggle };
        liberationGroup.add(sprite);

        // Ring around liberation struggle
        const ringGeometry = new THREE.RingGeometry(0.03, 0.04, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(struggle.color),
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        liberationGroup.add(ring);
      });
    }
  }, [activeConflicts, showConflicts, showLiberationStruggles]);

  // Year playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedYear(y => {
        if (y >= 2026) { setIsPlaying(false); return 2026; }
        return y + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const conflictTypeLabel = (type) => {
    switch (type) {
      case 'interstate': return 'Interstate War';
      case 'civil': return 'Civil War';
      case 'occupation': return 'Occupation';
      default: return type;
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#080c14] overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Globe Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Title Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-white tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          Leftist Monitor
        </h1>
        <p className="text-sm text-blue-300 mt-1 opacity-80">Interactive 3D Globe - Wars, Conflicts & Liberation Struggles</p>
      </div>

      {/* Controls - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowConflicts(!showConflicts)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${showConflicts ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {showConflicts ? 'Hide' : 'Show'} Conflicts
        </button>
        <button
          onClick={() => setShowLiberationStruggles(!showLiberationStruggles)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${showLiberationStruggles ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {showLiberationStruggles ? 'Hide' : 'Show'} Liberation
        </button>
        <button
          onClick={() => { autoRotateRef.current = true; }}
          className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
        >
          Auto-Rotate
        </button>
      </div>

      {/* Time Slider */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-[600px] max-w-[90vw]">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              {isPlaying ? '||' : '\u25B6'}
            </button>
            <span className="text-2xl font-bold text-white tabular-nums">{selectedYear}</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">
              {activeConflicts.length} active conflict{activeConflicts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="range"
            min={1900}
            max={2026}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">1900</span>
            <span className="text-[10px] text-gray-500">1925</span>
            <span className="text-[10px] text-gray-500">1950</span>
            <span className="text-[10px] text-gray-500">1975</span>
            <span className="text-[10px] text-gray-500">2000</span>
            <span className="text-[10px] text-gray-500">2026</span>
          </div>
        </div>
      </div>

      {/* Active Conflicts List */}
      <div className="absolute bottom-36 left-4 z-10 max-h-[40vh] overflow-y-auto scrollbar-thin">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 w-72">
          <div className="px-3 py-2 border-b border-gray-700/50">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Active Conflicts ({selectedYear})
            </h3>
          </div>
          <div className="divide-y divide-gray-800/50">
            {activeConflicts.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500 text-xs">No major conflicts in this year</div>
            )}
            {activeConflicts.map(conflict => (
              <button
                key={conflict.id}
                onClick={() => setSidePanel(sidePanel?.id === conflict.id ? null : conflict)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-800/50 transition-colors ${sidePanel?.id === conflict.id ? 'bg-gray-800/80' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {conflict.sides.map((side, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: side.color }} />
                    ))}
                  </div>
                  <span className="text-sm text-white font-medium truncate">{conflict.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500">{conflictTypeLabel(conflict.type)}</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">{conflict.startYear}-{conflict.endYear === 2026 ? 'Present' : conflict.endYear}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liberation Struggles Panel */}
      {showLiberationStruggles && (
        <div className="absolute top-16 right-4 z-10">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 w-56">
            <div className="px-3 py-2 border-b border-gray-700/50">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Liberation Struggles</h3>
            </div>
            <div className="p-2 space-y-1">
              {LIBERATION_STRUGGLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSidePanel(sidePanel?.id === s.id ? null : { ...s, isLiberation: true })}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors flex items-center gap-2"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-gray-300">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Side Detail Panel */}
      {sidePanel && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-80">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-600/50 shadow-2xl">
            <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{sidePanel.name}</h3>
              <button onClick={() => setSidePanel(null)} className="text-gray-500 hover:text-white text-lg">&times;</button>
            </div>
            <div className="p-4 space-y-3">
              {sidePanel.isLiberation ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sidePanel.color }} />
                    <span className="text-sm text-gray-300">Ongoing liberation struggle</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{sidePanel.description}</p>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-gray-500">Type</div>
                      <div className="text-gray-200 font-medium">{conflictTypeLabel(sidePanel.type)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-gray-500">Casualties</div>
                      <div className="text-gray-200 font-medium">{sidePanel.casualties}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-gray-500">Period</div>
                      <div className="text-gray-200 font-medium">{sidePanel.startYear}-{sidePanel.endYear === 2026 ? 'Present' : sidePanel.endYear}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-gray-500">Duration</div>
                      <div className="text-gray-200 font-medium">{Math.min(selectedYear, sidePanel.endYear) - sidePanel.startYear} years</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{sidePanel.description}</p>
                  <div className="space-y-2">
                    {sidePanel.sides && sidePanel.sides.map((side, idx) => (
                      <div key={idx} className="bg-gray-800/30 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: side.color }} />
                          <span className="text-xs font-semibold text-gray-200">{side.name}</span>
                          <span className="text-[10px] text-gray-500 ml-auto">{side.countries.length} nations</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {side.countries.map(cid => {
                            const c = COUNTRIES.find(x => x.id === cid);
                            return c ? (
                              <span key={cid} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-700/60 text-gray-300">
                                {c.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <span>Drag to rotate</span>
          <span className="text-gray-700">|</span>
          <span>Scroll to zoom</span>
          <span className="text-gray-700">|</span>
          <span>Click conflicts for details</span>
        </div>
      </div>
    </div>
  );
}
