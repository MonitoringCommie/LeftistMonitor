export interface ConflictSide {
  name: string
  color: number
  countries: string[]
}

export interface ConflictData {
  id: string
  name: string
  type: string
  startYear: number
  endYear: number
  casualties: number
  lat: number
  lng: number
  description: string
  sides: ConflictSide[]
}

export interface LiberationStruggle {
  id: string
  name: string
  color: number
  lat: number
  lng: number
  description: string
}

export interface CityData {
  name: string
  lat: number
  lng: number
}

export interface CountryCentroid {
  name: string
  lat: number
  lng: number
}

export const conflictData: ConflictData[] = [
  {
    id: 'ww1',
    name: 'World War I',
    type: 'Interstate War',
    startYear: 1914,
    endYear: 1918,
    casualties: 20000000,
    lat: 48,
    lng: 8,
    description: 'Global conflict involving European powers and their colonies',
    sides: [
      { name: 'Allies', color: 0x4499dd, countries: ['UK', 'France', 'Russia', 'US'] },
      { name: 'Central Powers', color: 0xdd4444, countries: ['Germany', 'Austria-Hungary', 'Ottoman Empire'] }
    ]
  },
  {
    id: 'ww2',
    name: 'World War II',
    type: 'Interstate War',
    startYear: 1939,
    endYear: 1945,
    casualties: 70000000,
    lat: 51,
    lng: 10,
    description: 'Global conflict with unprecedented scale and atrocities',
    sides: [
      { name: 'Allies', color: 0x4499dd, countries: ['UK', 'US', 'Soviet Union', 'China'] },
      { name: 'Axis', color: 0xdd4444, countries: ['Germany', 'Italy', 'Japan'] }
    ]
  },
  {
    id: 'korean',
    name: 'Korean War',
    type: 'Interstate War',
    startYear: 1950,
    endYear: 1953,
    casualties: 3000000,
    lat: 37,
    lng: 127,
    description: 'Conflict between North and South Korea with international involvement',
    sides: [
      { name: 'UN/South Korea', color: 0x4499dd, countries: ['South Korea', 'US', 'UN'] },
      { name: 'North Korea', color: 0xdd4444, countries: ['North Korea'] }
    ]
  },
  {
    id: 'vietnam',
    name: 'Vietnam War',
    type: 'Interstate War',
    startYear: 1955,
    endYear: 1975,
    casualties: 3000000,
    lat: 16,
    lng: 107,
    description: 'Prolonged conflict in Indochina with Cold War dimensions',
    sides: [
      { name: 'South Vietnam', color: 0x4499dd, countries: ['South Vietnam', 'US'] },
      { name: 'North Vietnam', color: 0xdd4444, countries: ['North Vietnam'] }
    ]
  },
  {
    id: 'soviet-afghan',
    name: 'Soviet-Afghan War',
    type: 'Interstate War',
    startYear: 1979,
    endYear: 1989,
    casualties: 2000000,
    lat: 34,
    lng: 69,
    description: 'Soviet intervention in Afghanistan supporting communist government',
    sides: [
      { name: 'Soviet Union', color: 0xdd4444, countries: ['Soviet Union'] },
      { name: 'Mujahideen', color: 0x4499dd, countries: ['Afghanistan'] }
    ]
  },
  {
    id: 'israeli-palestinian',
    name: 'Israeli-Palestinian Conflict',
    type: 'Protracted Conflict',
    startYear: 1948,
    endYear: 2026,
    casualties: 500000,
    lat: 31.95,
    lng: 35.23,
    description: 'Long-standing territorial and political conflict',
    sides: [
      { name: 'Israel', color: 0xdd4499, countries: ['Israel'] },
      { name: 'Palestine', color: 0x99dd44, countries: ['Palestine'] }
    ]
  },
  {
    id: 'iran-iraq',
    name: 'Iran-Iraq War',
    type: 'Interstate War',
    startYear: 1980,
    endYear: 1988,
    casualties: 1000000,
    lat: 33,
    lng: 44,
    description: 'Territorial dispute and ideological conflict in the Gulf',
    sides: [
      { name: 'Iraq', color: 0xdd4444, countries: ['Iraq'] },
      { name: 'Iran', color: 0x4499dd, countries: ['Iran'] }
    ]
  },
  {
    id: 'gulf-war',
    name: 'Gulf War',
    type: 'Interstate War',
    startYear: 1990,
    endYear: 1991,
    casualties: 300000,
    lat: 29,
    lng: 47,
    description: 'International coalition against Iraq following Kuwait invasion',
    sides: [
      { name: 'Coalition', color: 0x4499dd, countries: ['US', 'Coalition'] },
      { name: 'Iraq', color: 0xdd4444, countries: ['Iraq'] }
    ]
  },
  {
    id: 'bosnian',
    name: 'Bosnian War',
    type: 'Civil War',
    startYear: 1992,
    endYear: 1995,
    casualties: 100000,
    lat: 43.8,
    lng: 18,
    description: 'Conflict during Yugoslavia breakup with ethnic dimensions',
    sides: [
      { name: 'Bosniak/Croat Forces', color: 0x4499dd, countries: ['Bosnia'] },
      { name: 'Bosnian Serb Forces', color: 0xdd4444, countries: ['Serbia'] }
    ]
  },
  {
    id: 'rwandan',
    name: 'Rwandan Genocide',
    type: 'Genocide',
    startYear: 1994,
    endYear: 1994,
    casualties: 800000,
    lat: -1.9,
    lng: 29.8,
    description: 'Mass killings during Rwanda\'s ethnic conflict',
    sides: [
      { name: 'Hutu militias', color: 0xdd4444, countries: ['Rwanda'] },
      { name: 'Tutsi/Moderate forces', color: 0x4499dd, countries: ['Rwanda'] }
    ]
  },
  {
    id: 'afghanistan-2001',
    name: 'Afghanistan War',
    type: 'Interstate War',
    startYear: 2001,
    endYear: 2021,
    casualties: 700000,
    lat: 34,
    lng: 67,
    description: 'US-led invasion and occupation of Afghanistan',
    sides: [
      { name: 'NATO/US', color: 0x4499dd, countries: ['US', 'NATO'] },
      { name: 'Taliban', color: 0xdd4444, countries: ['Afghanistan'] }
    ]
  },
  {
    id: 'iraq-2003',
    name: 'Iraq War',
    type: 'Interstate War',
    startYear: 2003,
    endYear: 2011,
    casualties: 600000,
    lat: 33,
    lng: 44,
    description: 'US-led invasion and occupation of Iraq',
    sides: [
      { name: 'Coalition', color: 0x4499dd, countries: ['US', 'Coalition'] },
      { name: 'Iraqi forces', color: 0xdd4444, countries: ['Iraq'] }
    ]
  },
  {
    id: 'darfur',
    name: 'Darfur Conflict',
    type: 'Internal Conflict',
    startYear: 2003,
    endYear: 2026,
    casualties: 400000,
    lat: 13,
    lng: 24,
    description: 'Genocide and conflict in western Sudan',
    sides: [
      { name: 'Sudanese government', color: 0xdd4444, countries: ['Sudan'] },
      { name: 'Rebel groups', color: 0x4499dd, countries: ['Sudan'] }
    ]
  },
  {
    id: 'syrian',
    name: 'Syrian Civil War',
    type: 'Civil War',
    startYear: 2011,
    endYear: 2026,
    casualties: 500000,
    lat: 34.8,
    lng: 38.8,
    description: 'Prolonged conflict with international involvement',
    sides: [
      { name: 'Assad government', color: 0xdd4444, countries: ['Syria'] },
      { name: 'Opposition forces', color: 0x4499dd, countries: ['Syria'] }
    ]
  },
  {
    id: 'yemen',
    name: 'Yemeni Civil War',
    type: 'Civil War',
    startYear: 2014,
    endYear: 2026,
    casualties: 200000,
    lat: 15,
    lng: 48,
    description: 'Conflict between Houthis and Saudi-backed government',
    sides: [
      { name: 'Houthis', color: 0xdd4444, countries: ['Yemen'] },
      { name: 'Saudi-backed coalition', color: 0x4499dd, countries: ['Yemen', 'Saudi Arabia'] }
    ]
  },
  {
    id: 'libya',
    name: 'Libyan Civil War',
    type: 'Civil War',
    startYear: 2014,
    endYear: 2020,
    casualties: 50000,
    lat: 27,
    lng: 17,
    description: 'Conflict following NATO intervention and Gaddafi\'s fall',
    sides: [
      { name: 'Haftar forces', color: 0xdd4444, countries: ['Libya'] },
      { name: 'GNA forces', color: 0x4499dd, countries: ['Libya'] }
    ]
  },
  {
    id: 'somalia',
    name: 'Somali Civil War',
    type: 'Civil War',
    startYear: 1991,
    endYear: 2026,
    casualties: 400000,
    lat: 5,
    lng: 46,
    description: 'Ongoing conflict with fragmented political system',
    sides: [
      { name: 'Government', color: 0x4499dd, countries: ['Somalia'] },
      { name: 'Various factions', color: 0xdd4444, countries: ['Somalia'] }
    ]
  },
  {
    id: 'congo',
    name: 'Congo Wars',
    type: 'Interstate War',
    startYear: 1996,
    endYear: 2003,
    casualties: 3000000,
    lat: -4,
    lng: 23,
    description: 'Regional conflict involving multiple African nations',
    sides: [
      { name: 'Congolese government', color: 0x4499dd, countries: ['DRC'] },
      { name: 'Rebel groups/foreign forces', color: 0xdd4444, countries: ['Rwanda', 'Uganda', 'DRC'] }
    ]
  },
  {
    id: 'ukraine',
    name: 'Ukraine-Russia War',
    type: 'Interstate War',
    startYear: 2022,
    endYear: 2026,
    casualties: 200000,
    lat: 48,
    lng: 35,
    description: 'Russian invasion and Ukraine\'s resistance',
    sides: [
      { name: 'Ukraine', color: 0x4499dd, countries: ['Ukraine'] },
      { name: 'Russia', color: 0xdd4444, countries: ['Russia'] }
    ]
  },
  {
    id: 'tigray',
    name: 'Ethiopian Tigray Conflict',
    type: 'Civil War',
    startYear: 2020,
    endYear: 2022,
    casualties: 100000,
    lat: 13,
    lng: 39,
    description: 'Conflict between Ethiopian federal forces and TPLF',
    sides: [
      { name: 'Ethiopian government', color: 0xdd4444, countries: ['Ethiopia'] },
      { name: 'TPLF', color: 0x4499dd, countries: ['Ethiopia'] }
    ]
  },
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    type: 'Civil War',
    startYear: 2021,
    endYear: 2026,
    casualties: 50000,
    lat: 21,
    lng: 96,
    description: 'Conflict following military coup against democracy',
    sides: [
      { name: 'Military junta', color: 0xdd4444, countries: ['Myanmar'] },
      { name: 'Resistance forces', color: 0x4499dd, countries: ['Myanmar'] }
    ]
  },
  {
    id: 'sudan-2023',
    name: 'Sudan Civil War',
    type: 'Civil War',
    startYear: 2023,
    endYear: 2026,
    casualties: 50000,
    lat: 15.5,
    lng: 32.5,
    description: 'Conflict between SAF and RSF in Sudan',
    sides: [
      { name: 'SAF', color: 0xdd4444, countries: ['Sudan'] },
      { name: 'RSF', color: 0x4499dd, countries: ['Sudan'] }
    ]
  },
  {
    id: 'colombia',
    name: 'Colombian Conflict',
    type: 'Internal Conflict',
    startYear: 1964,
    endYear: 2016,
    casualties: 260000,
    lat: 4,
    lng: -74,
    description: 'Long-running conflict involving government, guerrillas, and paramilitaries',
    sides: [
      { name: 'Colombian government', color: 0x4499dd, countries: ['Colombia'] },
      { name: 'FARC/ELN', color: 0xdd4444, countries: ['Colombia'] }
    ]
  },
  {
    id: 'angola',
    name: 'Angolan Civil War',
    type: 'Civil War',
    startYear: 1975,
    endYear: 2002,
    casualties: 500000,
    lat: -11.2,
    lng: 17.9,
    description: 'Conflict following independence from Portugal',
    sides: [
      { name: 'MPLA government', color: 0x4499dd, countries: ['Angola'] },
      { name: 'UNITA', color: 0xdd4444, countries: ['Angola'] }
    ]
  },
  {
    id: 'cambodia',
    name: 'Cambodian Genocide',
    type: 'Genocide',
    startYear: 1975,
    endYear: 1979,
    casualties: 2000000,
    lat: 12.5,
    lng: 104.9,
    description: 'Mass killings by the Khmer Rouge regime',
    sides: [
      { name: 'Khmer Rouge', color: 0xdd4444, countries: ['Cambodia'] },
      { name: 'Resistance', color: 0x4499dd, countries: ['Cambodia'] }
    ]
  },
  {
    id: 'srilanka',
    name: 'Sri Lankan Civil War',
    type: 'Civil War',
    startYear: 1983,
    endYear: 2009,
    casualties: 100000,
    lat: 7,
    lng: 80.8,
    description: 'Conflict between government and LTTE Tamil separatists',
    sides: [
      { name: 'Sri Lankan government', color: 0x4499dd, countries: ['Sri Lanka'] },
      { name: 'LTTE', color: 0xdd4444, countries: ['Sri Lanka'] }
    ]
  },
  {
    id: 'chechnya',
    name: 'Chechen Wars',
    type: 'Internal Conflict',
    startYear: 1994,
    endYear: 2009,
    casualties: 200000,
    lat: 43.3,
    lng: 45.7,
    description: 'Conflicts in Chechnya against Russian federal authority',
    sides: [
      { name: 'Russia', color: 0xdd4444, countries: ['Russia'] },
      { name: 'Chechen forces', color: 0x4499dd, countries: ['Russia'] }
    ]
  }
]

export const liberationStruggles: LiberationStruggle[] = [
  {
    id: 'palestine',
    name: 'Palestine',
    color: 0x99dd44,
    lat: 31.95,
    lng: 35.23,
    description: 'Palestinian self-determination and statehood'
  },
  {
    id: 'kurdistan',
    name: 'Kurdistan',
    color: 0xddaa44,
    lat: 37,
    lng: 44,
    description: 'Kurdish national self-determination'
  },
  {
    id: 'kashmir',
    name: 'Kashmir',
    color: 0x44ddaa,
    lat: 34.5,
    lng: 76.5,
    description: 'Kashmir self-determination struggle'
  },
  {
    id: 'tibet',
    name: 'Tibet',
    color: 0xdd44aa,
    lat: 30,
    lng: 91,
    description: 'Tibetan autonomy and independence movement'
  },
  {
    id: 'westsahara',
    name: 'Western Sahara',
    color: 0xaadd44,
    lat: 24.5,
    lng: -13,
    description: 'Western Saharan self-determination'
  },
  {
    id: 'westpapua',
    name: 'West Papua',
    color: 0x44aadd,
    lat: -3,
    lng: 133,
    description: 'West Papuan independence movement'
  },
  {
    id: 'northernireland',
    name: 'Northern Ireland',
    color: 0xdddd44,
    lat: 54.6,
    lng: -6,
    description: 'Irish national self-determination'
  },
  {
    id: 'uyghur',
    name: 'Uyghur Region',
    color: 0xdd8844,
    lat: 42.5,
    lng: 87,
    description: 'Uyghur autonomy and self-determination'
  }
]

export const citiesData: CityData[] = [
  { name: 'Washington DC', lat: 38.9072, lng: -77.0369 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'New Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Johannesburg', lat: -26.2023, lng: 28.0436 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
  { name: 'Manila', lat: 14.5994, lng: 120.9842 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Toronto', lat: 43.6629, lng: -79.3957 },
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Boston', lat: 42.3601, lng: -71.0589 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
  { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
  { name: 'Prague', lat: 50.0755, lng: 14.4378 },
  { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
  { name: 'Athens', lat: 37.9838, lng: 23.7275 },
  { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
  { name: 'Beirut', lat: 33.8886, lng: 35.4955 },
  { name: 'Baghdad', lat: 33.3128, lng: 44.3615 },
  { name: 'Tehran', lat: 35.6892, lng: 51.3890 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
  { name: 'Doha', lat: 25.2854, lng: 51.5310 },
  { name: 'Abuja', lat: 9.0765, lng: 7.3986 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Nairobi', lat: -1.2869, lng: 36.8194 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 }
]

export const countryCentroids: Record<string, CountryCentroid> = {
  '840': { name: 'US', lat: 39, lng: -98 },
  '826': { name: 'UK', lat: 54, lng: -2 },
  '250': { name: 'France', lat: 46, lng: 2 },
  '276': { name: 'Germany', lat: 51, lng: 10 },
  '643': { name: 'Russia', lat: 55, lng: 37 },
  '156': { name: 'China', lat: 35, lng: 104 },
  '392': { name: 'Japan', lat: 36, lng: 138 },
  '356': { name: 'India', lat: 21, lng: 78 },
  '076': { name: 'Brazil', lat: -15, lng: -48 },
  '036': { name: 'Australia', lat: -25, lng: 134 },
  '710': { name: 'South Africa', lat: -29, lng: 24 },
  '818': { name: 'Egypt', lat: 26, lng: 30 },
  '566': { name: 'Nigeria', lat: 9, lng: 8 },
  '404': { name: 'Kenya', lat: -1, lng: 37 },
  '484': { name: 'Mexico', lat: 23, lng: -102 },
  '032': { name: 'Argentina', lat: -34, lng: -64 },
  '170': { name: 'Colombia', lat: 4, lng: -74 },
  '862': { name: 'Venezuela', lat: 7, lng: -66 },
  '792': { name: 'Turkey', lat: 39, lng: 35 },
  '364': { name: 'Iran', lat: 32, lng: 54 },
  '368': { name: 'Iraq', lat: 33, lng: 44 },
  '760': { name: 'Syria', lat: 35, lng: 38 },
  '682': { name: 'Saudi Arabia', lat: 24, lng: 45 },
  '376': { name: 'Israel', lat: 31, lng: 35 },
  '275': { name: 'Palestine', lat: 32, lng: 35 },
  '422': { name: 'Lebanon', lat: 34, lng: 36 },
  '004': { name: 'Afghanistan', lat: 34, lng: 68 },
  '586': { name: 'Pakistan', lat: 30, lng: 70 },
  '804': { name: 'Ukraine', lat: 49, lng: 32 },
  '616': { name: 'Poland', lat: 52, lng: 20 },
  '380': { name: 'Italy', lat: 42, lng: 13 },
  '724': { name: 'Spain', lat: 40, lng: -4 },
  '528': { name: 'Netherlands', lat: 52, lng: 5 },
  '124': { name: 'Canada', lat: 56, lng: -106 },
  '410': { name: 'South Korea', lat: 36, lng: 128 },
  '408': { name: 'North Korea', lat: 40, lng: 127 },
  '704': { name: 'Vietnam', lat: 14, lng: 108 },
  '764': { name: 'Thailand', lat: 15, lng: 101 },
  '104': { name: 'Myanmar', lat: 22, lng: 96 },
  '360': { name: 'Indonesia', lat: -1, lng: 114 },
  '608': { name: 'Philippines', lat: 13, lng: 122 },
  '231': { name: 'Ethiopia', lat: 9, lng: 40 },
  '180': { name: 'DR Congo', lat: -4, lng: 22 },
  '736': { name: 'Sudan', lat: 13, lng: 30 },
  '434': { name: 'Libya', lat: 27, lng: 17 },
  '012': { name: 'Algeria', lat: 28, lng: 2 },
  '504': { name: 'Morocco', lat: 32, lng: -7 },
  '887': { name: 'Yemen', lat: 15, lng: 48 },
  '706': { name: 'Somalia', lat: 5, lng: 46 },
  '646': { name: 'Rwanda', lat: -2, lng: 30 },
  '070': { name: 'Bosnia', lat: 44, lng: 18 },
  '191': { name: 'Croatia', lat: 45, lng: 16 },
  '688': { name: 'Serbia', lat: 44, lng: 21 },
  '152': { name: 'Chile', lat: -35, lng: -71 },
  '604': { name: 'Peru', lat: -10, lng: -75 },
  '218': { name: 'Ecuador', lat: -2, lng: -78 },
  '858': { name: 'Uruguay', lat: -33, lng: -56 },
  '068': { name: 'Bolivia', lat: -17, lng: -64 },
  '320': { name: 'Guatemala', lat: 15, lng: -90 },
  '340': { name: 'Honduras', lat: 15, lng: -86 },
  '222': { name: 'El Salvador', lat: 14, lng: -89 },
  '558': { name: 'Nicaragua', lat: 13, lng: -85 },
  '192': { name: 'Cuba', lat: 22, lng: -78 },
  '332': { name: 'Haiti', lat: 19, lng: -72 },
  '024': { name: 'Angola', lat: -12, lng: 18 },
  '508': { name: 'Mozambique', lat: -18, lng: 36 },
  '116': { name: 'Cambodia', lat: 13, lng: 105 }
}

export function getCountryCoords(countryName: string): { lat: number; lng: number } | null {
  const coordsMap: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 39, lng: -98 },
    'UK': { lat: 54, lng: -2 },
    'France': { lat: 46, lng: 2 },
    'Russia': { lat: 55, lng: 37 },
    'Soviet Union': { lat: 55, lng: 37 },
    'Germany': { lat: 51, lng: 10 },
    'China': { lat: 35, lng: 104 },
    'Japan': { lat: 36, lng: 138 },
    'India': { lat: 21, lng: 78 },
    'Pakistan': { lat: 30, lng: 70 },
    'Iran': { lat: 32, lng: 54 },
    'Iraq': { lat: 33, lng: 44 },
    'Syria': { lat: 35, lng: 38 },
    'Turkey': { lat: 39, lng: 35 },
    'Vietnam': { lat: 14, lng: 108 },
    'South Vietnam': { lat: 14, lng: 108 },
    'North Vietnam': { lat: 14, lng: 108 },
    'South Korea': { lat: 36, lng: 128 },
    'North Korea': { lat: 40, lng: 127 },
    'Canada': { lat: 56, lng: -106 },
    'Australia': { lat: -25, lng: 134 },
    'Egypt': { lat: 26, lng: 30 },
    'Saudi Arabia': { lat: 24, lng: 45 },
    'Yemen': { lat: 15, lng: 48 },
    'Sudan': { lat: 13, lng: 30 },
    'Afghanistan': { lat: 34, lng: 68 },
    'Angola': { lat: -12, lng: 18 },
    'Rwanda': { lat: -2, lng: 30 },
    'DRC': { lat: -4, lng: 22 },
    'Congo': { lat: -4, lng: 22 },
    'Colombia': { lat: 4, lng: -74 },
    'Ukraine': { lat: 49, lng: 32 },
    'Cuba': { lat: 22, lng: -78 },
    'South Africa': { lat: -29, lng: 24 },
    'Austria-Hungary': { lat: 47, lng: 15 },
    'Ottoman Empire': { lat: 39, lng: 35 },
    'Italy': { lat: 42, lng: 13 },
    'Brazil': { lat: -15, lng: -48 },
    'Israel': { lat: 31, lng: 35 },
    'Palestine': { lat: 32, lng: 35 },
    'Coalition': { lat: 39, lng: -98 },
    'NATO': { lat: 50, lng: 10 },
    'UN': { lat: 40.7128, lng: -74.0060 }
  }

  return coordsMap[countryName] || null
}
