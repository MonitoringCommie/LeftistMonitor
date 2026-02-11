import { useState } from "react";
import AnimatedTimeline from "../components/visualizations/AnimatedTimeline";

type TimelinePeriod = "all" | "19th" | "20th-early" | "20th-late" | "21st";

const TIMELINE_EVENTS = [
  // 19th Century
  { id: "1", year: 1789, month: 7, day: 14, title: "French Revolution Begins", category: "revolution", location: "Paris, France", description: "Storming of the Bastille marks the beginning of the French Revolution." },
  { id: "2", year: 1804, title: "Haitian Independence", category: "revolution", location: "Haiti", description: "First successful slave revolution creates independent Haiti." },
  { id: "3", year: 1848, title: "Communist Manifesto Published", category: "founding", location: "London, UK", description: "Marx and Engels publish the Communist Manifesto." },
  { id: "4", year: 1848, month: 2, title: "Revolutions of 1848", category: "revolution", location: "Europe", description: "Wave of revolutions across Europe demanding democratic reforms." },
  { id: "5", year: 1871, month: 3, title: "Paris Commune", category: "revolution", location: "Paris, France", description: "Revolutionary socialist government rules Paris for two months." },
  { id: "6", year: 1886, month: 5, day: 4, title: "Haymarket Affair", category: "protest", location: "Chicago, USA", description: "Labor protest leads to Haymarket tragedy, origin of May Day." },

  // Early 20th Century
  { id: "7", year: 1905, title: "Russian Revolution of 1905", category: "revolution", location: "Russia", description: "Failed revolution leads to limited reforms and sets stage for 1917." },
  { id: "8", year: 1910, title: "Mexican Revolution Begins", category: "revolution", location: "Mexico", description: "Decade-long revolution transforms Mexican society." },
  { id: "9", year: 1917, month: 2, title: "February Revolution", category: "revolution", location: "Petrograd, Russia", description: "Tsar Nicholas II abdicates, ending 300 years of Romanov rule." },
  { id: "10", year: 1917, month: 10, title: "October Revolution", category: "revolution", location: "Petrograd, Russia", description: "Bolsheviks seize power, establishing Soviet government." },
  { id: "11", year: 1919, title: "Spartacist Uprising", category: "revolution", location: "Berlin, Germany", description: "Failed communist revolution in Germany." },
  { id: "12", year: 1919, title: "Hungarian Soviet Republic", category: "revolution", location: "Hungary", description: "Short-lived socialist state established in Hungary." },
  { id: "13", year: 1921, title: "Chinese Communist Party Founded", category: "founding", location: "Shanghai, China", description: "CCP founded with 50 members." },
  { id: "14", year: 1926, title: "General Strike in Britain", category: "protest", location: "UK", description: "Largest strike in British history." },
  { id: "15", year: 1936, title: "Spanish Civil War Begins", category: "war", location: "Spain", description: "Republicans vs. Nationalists in prelude to WWII." },

  // Mid 20th Century
  { id: "16", year: 1945, title: "August Revolution", category: "revolution", location: "Vietnam", description: "Viet Minh seize power as Japan surrenders." },
  { id: "17", year: 1948, title: "Nakba", category: "war", location: "Palestine", description: "700,000 Palestinians displaced during creation of Israel." },
  { id: "18", year: 1949, title: "Chinese Revolution", category: "revolution", location: "China", description: "Communist victory, Mao proclaims People's Republic." },
  { id: "19", year: 1952, title: "Egyptian Revolution", category: "revolution", location: "Egypt", description: "Free Officers overthrow monarchy, Nasser rises." },
  { id: "20", year: 1954, title: "Algerian War Begins", category: "war", location: "Algeria", description: "FLN launches independence struggle against France." },
  { id: "21", year: 1956, title: "Hungarian Uprising", category: "revolution", location: "Hungary", description: "Anti-Soviet revolt crushed by Red Army." },
  { id: "22", year: 1959, month: 1, title: "Cuban Revolution", category: "revolution", location: "Cuba", description: "Castro and guerrillas overthrow Batista." },
  { id: "23", year: 1960, title: "Year of Africa", category: "founding", location: "Africa", description: "17 African nations gain independence." },
  { id: "24", year: 1962, title: "Algerian Independence", category: "treaty", location: "Algeria", description: "Algeria wins independence after brutal war." },
  { id: "25", year: 1963, title: "March on Washington", category: "protest", location: "Washington DC, USA", description: "250,000 march for civil rights; 'I Have a Dream' speech." },
  { id: "26", year: 1966, title: "Black Panther Party Founded", category: "founding", location: "Oakland, USA", description: "Revolutionary Black nationalist organization formed." },
  { id: "27", year: 1967, month: 10, day: 9, title: "Che Guevara Killed", category: "assassination", location: "Bolivia", description: "Revolutionary icon executed by Bolivian army." },
  { id: "28", year: 1968, month: 5, title: "May 68", category: "protest", location: "Paris, France", description: "Student-worker uprising nearly topples de Gaulle." },
  { id: "29", year: 1968, month: 10, day: 2, title: "Tlatelolco Massacre", category: "protest", location: "Mexico City", description: "Army kills hundreds of student protesters." },
  { id: "30", year: 1969, month: 6, title: "Stonewall Uprising", category: "protest", location: "New York, USA", description: "LGBTQ+ resistance sparks modern pride movement." },

  // Late 20th Century
  { id: "31", year: 1970, title: "Allende Elected in Chile", category: "election", location: "Chile", description: "First democratically elected Marxist president." },
  { id: "32", year: 1973, month: 9, day: 11, title: "Chilean Coup", category: "assassination", location: "Santiago, Chile", description: "Pinochet overthrows Allende; 17 years of dictatorship begin." },
  { id: "33", year: 1974, title: "Carnation Revolution", category: "revolution", location: "Portugal", description: "Military coup ends dictatorship, leads to democracy." },
  { id: "34", year: 1975, title: "Fall of Saigon", category: "war", location: "Vietnam", description: "Vietnam War ends with communist victory." },
  { id: "35", year: 1979, month: 2, title: "Iranian Revolution", category: "revolution", location: "Iran", description: "Shah overthrown, Islamic Republic established." },
  { id: "36", year: 1979, month: 7, title: "Sandinista Revolution", category: "revolution", location: "Nicaragua", description: "FSLN overthrows Somoza dictatorship." },
  { id: "37", year: 1980, title: "Solidarity Founded", category: "founding", location: "Poland", description: "First independent trade union in Soviet bloc." },
  { id: "38", year: 1989, month: 6, day: 4, title: "Tiananmen Square Massacre", category: "protest", location: "Beijing, China", description: "Army crushes pro-democracy protests." },
  { id: "39", year: 1989, month: 11, day: 9, title: "Berlin Wall Falls", category: "revolution", location: "Berlin, Germany", description: "Symbol of Cold War division collapses." },
  { id: "40", year: 1990, month: 2, day: 11, title: "Mandela Released", category: "treaty", location: "South Africa", description: "After 27 years, Mandela walks free." },
  { id: "41", year: 1991, title: "Soviet Union Dissolves", category: "revolution", location: "USSR", description: "End of Soviet state after 74 years." },
  { id: "42", year: 1994, month: 1, day: 1, title: "Zapatista Uprising", category: "revolution", location: "Chiapas, Mexico", description: "EZLN declares war on Mexican state on NAFTA day." },

  // 21st Century
  { id: "43", year: 2001, title: "Argentinazo", category: "protest", location: "Argentina", description: "Mass protests force president to flee." },
  { id: "44", year: 2006, title: "Oaxaca Commune", category: "protest", location: "Oaxaca, Mexico", description: "Teachers' strike becomes popular assembly." },
  { id: "45", year: 2011, month: 1, title: "Arab Spring Begins", category: "revolution", location: "Tunisia", description: "Tunisian revolution sparks regional upheaval." },
  { id: "46", year: 2011, month: 2, title: "Egyptian Revolution", category: "revolution", location: "Cairo, Egypt", description: "18 days of protest topple Mubarak." },
  { id: "47", year: 2011, month: 9, title: "Occupy Wall Street", category: "protest", location: "New York, USA", description: "'We are the 99%' movement against inequality." },
  { id: "48", year: 2014, title: "Maidan Revolution", category: "revolution", location: "Kyiv, Ukraine", description: "Protests overthrow pro-Russian government." },
  { id: "49", year: 2019, title: "Chilean Uprising", category: "protest", location: "Chile", description: "Mass protests against inequality; constitutional process begins." },
  { id: "50", year: 2020, month: 5, title: "George Floyd Protests", category: "protest", location: "USA/Global", description: "Largest protest movement in US history against police brutality." },
];

export default function RevolutionaryTimelinePage() {
  const [period, setPeriod] = useState<TimelinePeriod>("all");
  const [playSpeed, setPlaySpeed] = useState(400);

  const filteredEvents = TIMELINE_EVENTS.filter(event => {
    switch (period) {
      case "19th": return event.year >= 1789 && event.year < 1900;
      case "20th-early": return event.year >= 1900 && event.year < 1950;
      case "20th-late": return event.year >= 1950 && event.year < 2000;
      case "21st": return event.year >= 2000;
      default: return true;
    }
  });

  const periods: { id: TimelinePeriod; label: string }[] = [
    { id: "all", label: "All Time (1789-2020)" },
    { id: "19th", label: "19th Century" },
    { id: "20th-early", label: "Early 20th (1900-1950)" },
    { id: "20th-late", label: "Late 20th (1950-2000)" },
    { id: "21st", label: "21st Century" },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FFF5F6', color: '#2C1810' }}>
      {/* Header */}
      <div className="py-16" style={{ background: 'linear-gradient(to right, #C41E3A, #8B1A1A)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Revolutionary Timeline
          </h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'Georgia, serif' }}>
            An animated journey through centuries of revolutions, uprisings,
            and movements that shaped the world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Period selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                period === p.id
                  ? { background: '#C41E3A', color: '#FFFFFF' }
                  : { background: '#FFFFFF', color: '#5C3D2E', border: '1px solid #E8C8C8' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm" style={{ color: '#8B7355' }}>Animation Speed:</span>
          <input
            type="range"
            min={100}
            max={1000}
            step={100}
            value={playSpeed}
            onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm" style={{ color: '#8B7355' }}>{playSpeed}ms/year</span>
        </div>

        {/* Timeline */}
        <AnimatedTimeline
          events={filteredEvents}
          playSpeed={playSpeed}
          onEventSelect={(event) => console.log("Selected:", event)}
        />

        {/* Event list */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>All Events ({filteredEvents.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 transition-colors"
                style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold" style={{ color: '#C41E3A' }}>{event.year}</span>
                  {event.category && (
                    <span
                      className="text-xs px-2 py-1 rounded capitalize"
                      style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                    >
                      {event.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>{event.title}</h3>
                {event.location && (
                  <p className="text-sm" style={{ color: '#8B7355' }}>{event.location}</p>
                )}
                {event.description && (
                  <p className="text-sm mt-2" style={{ color: '#5C3D2E' }}>{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
