import React, { useState } from 'react';

interface OralHistory {
  id: string;
  title: string;
  narrator: string;
  narratorBio: string;
  interviewer?: string;
  recordingDate: string;
  duration: string;
  language: string;
  location: string;
  topics: string[];
  summary: string;
  transcriptExcerpt: string;
  hasAudio: boolean;
  hasVideo: boolean;
  hasTranscript: boolean;
  collection: string;
  movement: string;
}

const OralHistoryPage: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filterMovement, setFilterMovement] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const movements = [
    'Labor Movement', 'Civil Rights', 'Anti-Apartheid', 'Anti-Colonial',
    'Feminist', 'Indigenous Rights', 'LGBTQ+', 'Refugee Experience'
  ];

  const languages = ['English', 'Spanish', 'French', 'Arabic', 'Portuguese', 'Hindi', 'Swahili'];

  const oralHistories: OralHistory[] = [
    {
      id: '1',
      title: 'Memories of the Montgomery Bus Boycott',
      narrator: 'Georgia Gilmore',
      narratorBio: 'Civil rights activist and cook who secretly raised funds for the Montgomery Bus Boycott through her "Club from Nowhere."',
      recordingDate: '1986-03-15',
      duration: '1h 45min',
      language: 'English',
      location: 'Montgomery, Alabama',
      topics: ['Montgomery Bus Boycott', 'Fundraising', 'Women in Civil Rights', 'Martin Luther King Jr.'],
      summary: 'Georgia Gilmore recounts her experience organizing secret fundraising efforts during the Montgomery Bus Boycott, including selling food to raise money for carpools.',
      transcriptExcerpt: '"We called ourselves the Club from Nowhere because when people asked where the money came from, we\'d say \'from nowhere.\' We sold pies, cakes, anything we could cook. Dr. King would come to my house for meetings. We raised money one plate at a time, one pie at a time..."',
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
      collection: 'Civil Rights Movement Veterans',
      movement: 'Civil Rights'
    },
    {
      id: '2',
      title: 'Life as a Bracero',
      narrator: 'Roberto Martinez',
      narratorBio: 'Former bracero worker who came to the United States as part of the guest worker program in the 1950s.',
      recordingDate: '2004-07-22',
      duration: '2h 10min',
      language: 'Spanish',
      location: 'Salinas, California',
      topics: ['Bracero Program', 'Agricultural Labor', 'Immigration', 'Worker Exploitation'],
      summary: 'Roberto Martinez describes the harsh conditions faced by Mexican workers in the Bracero program, including wage theft, poor housing, and discrimination.',
      transcriptExcerpt: '"They sprayed us with DDT like we were insects. We slept in barns, sometimes twenty men in a room made for five. They took money from our wages and said it was for savings, but many of us never saw that money again..."',
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
      collection: 'Bracero History Archive',
      movement: 'Labor Movement'
    },
    {
      id: '3',
      title: 'Surviving Robben Island',
      narrator: 'Ahmed Kathrada',
      narratorBio: 'Anti-apartheid activist who was imprisoned alongside Nelson Mandela on Robben Island for 26 years.',
      recordingDate: '2005-11-18',
      duration: '3h 20min',
      language: 'English',
      location: 'Johannesburg, South Africa',
      topics: ['Robben Island', 'Political Prisoners', 'ANC', 'Apartheid'],
      summary: 'Ahmed Kathrada reflects on his decades of imprisonment, the solidarity among political prisoners, and the educational programs they secretly organized.',
      transcriptExcerpt: '"We turned the prison into a university. Despite everything they did to break us, we studied, we debated, we planned. Mandela would say, \'Education is the most powerful weapon which you can use to change the world.\' We lived those words..."',
      hasAudio: true,
      hasVideo: true,
      hasTranscript: true,
      collection: 'South African Memory Project',
      movement: 'Anti-Apartheid'
    },
    {
      id: '4',
      title: 'The Nakba: A Village Remembers',
      narrator: 'Umm Jabr Wishah',
      narratorBio: 'Palestinian refugee who was displaced from her village of Deir Yassin during the 1948 Nakba.',
      recordingDate: '1998-04-09',
      duration: '1h 30min',
      language: 'Arabic',
      location: 'Dheisheh Refugee Camp, West Bank',
      topics: ['Nakba', 'Deir Yassin', 'Palestinian Refugees', 'Displacement'],
      summary: 'Umm Jabr recounts the events of April 1948, when she fled her village as a young girl, and the decades of exile that followed.',
      transcriptExcerpt: '"I was seven years old. My mother grabbed my hand and we ran. We heard the shooting behind us. I never saw my home again. Seventy years later, I still remember the smell of the orange trees in our garden..."',
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
      collection: 'Palestinian Oral History Archive',
      movement: 'Anti-Colonial'
    },
    {
      id: '5',
      title: 'Stonewall and Beyond',
      narrator: 'Sylvia Rivera',
      narratorBio: 'Transgender activist who participated in the Stonewall uprising and co-founded STAR (Street Transvestite Action Revolutionaries).',
      recordingDate: '1989-06-25',
      duration: '2h 05min',
      language: 'English',
      location: 'New York City',
      topics: ['Stonewall', 'LGBTQ Rights', 'Trans Rights', 'Homelessness'],
      summary: 'Sylvia Rivera describes her experiences at the Stonewall uprising and her subsequent activism for transgender rights and homeless LGBTQ youth.',
      transcriptExcerpt: '"People forget that it was the street queens who fought back first. We had nothing to lose. The cops would beat us anyway, so we fought back. We threw the first bottles, the first bricks. We were the ones who had enough..."',
      hasAudio: true,
      hasVideo: true,
      hasTranscript: true,
      collection: 'LGBTQ Oral History Project',
      movement: 'LGBTQ+'
    },
    {
      id: '6',
      title: 'A Miner\'s Daughter',
      narrator: 'Florence Reece',
      narratorBio: 'Labor activist and songwriter who wrote "Which Side Are You On?" during the Harlan County War.',
      recordingDate: '1972-08-14',
      duration: '1h 55min',
      language: 'English',
      location: 'Harlan County, Kentucky',
      topics: ['Coal Mining', 'Harlan County', 'Union Organizing', 'Folk Music'],
      summary: 'Florence Reece tells the story of how she wrote her famous song during the violent labor struggles in Harlan County and her lifelong commitment to the labor movement.',
      transcriptExcerpt: '"The thugs came to our house looking for my husband. They tore up everything we had. That night, with my children crying, I wrote that song on the back of a calendar. \'Which side are you on?\' That\'s still the question..."',
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
      collection: 'Appalachian Sound Archives',
      movement: 'Labor Movement'
    },
    {
      id: '7',
      title: 'The Long Walk Home',
      narrator: 'Wounded Knee Veterans',
      narratorBio: 'Group interview with survivors of the 1973 Wounded Knee occupation.',
      interviewer: 'Dennis Banks',
      recordingDate: '2003-02-27',
      duration: '4h 30min',
      language: 'English',
      location: 'Pine Ridge Reservation, South Dakota',
      topics: ['Wounded Knee', 'AIM', 'Native American Rights', 'FBI'],
      summary: 'Multiple participants in the 1973 Wounded Knee occupation share their memories of the 71-day standoff and its impact on the Indigenous rights movement.',
      transcriptExcerpt: '"We knew they could kill us all. They had us surrounded. But we stayed because our ancestors were buried there. They died fighting for our land. How could we do less?"',
      hasAudio: true,
      hasVideo: true,
      hasTranscript: true,
      collection: 'American Indian Movement Archives',
      movement: 'Indigenous Rights'
    },
    {
      id: '8',
      title: 'Witness to the Partition',
      narrator: 'Bhisham Sahni',
      narratorBio: 'Hindi writer and activist who documented the violence of the 1947 Partition of India.',
      recordingDate: '1997-08-15',
      duration: '2h 40min',
      language: 'Hindi',
      location: 'New Delhi, India',
      topics: ['Partition', 'Communal Violence', 'Refugees', 'Independence'],
      summary: 'Writer Bhisham Sahni reflects on witnessing the communal violence during Partition and how it shaped his literary work and political commitment.',
      transcriptExcerpt: '"I saw neighbors become murderers overnight. Families who had lived together for generations suddenly turned on each other. The politics of division destroyed what centuries of living together had built..."',
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
      collection: 'Partition Archive',
      movement: 'Anti-Colonial'
    }
  ];

  const filteredHistories = oralHistories.filter(history => {
    if (filterMovement !== 'all' && history.movement !== filterMovement) return false;
    if (filterLanguage !== 'all' && history.language !== filterLanguage) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        history.title.toLowerCase().includes(query) ||
        history.narrator.toLowerCase().includes(query) ||
        history.topics.some(t => t.toLowerCase().includes(query)) ||
        history.summary.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }} className="min-h-screen">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }} className="text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Oral History Archive</h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Firsthand accounts from those who lived through liberation struggles,
            labor movements, and moments of historical transformation. Their voices
            preserve history that might otherwise be forgotten.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search oral histories..."
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Movement</label>
              <select
                value={filterMovement}
                onChange={(e) => setFilterMovement(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Movements</option>
                {movements.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Language</label>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="mb-4" style={{ color: '#5C3D2E' }}>
          {filteredHistories.length} oral histories found
        </p>

        {/* History Cards */}
        <div className="space-y-6">
          {filteredHistories.map(history => (
            <div
              key={history.id}
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
              className="shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Narrator Photo Placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(196, 30, 58, 0.1)' }}>
                      <span className="text-4xl">🎙️</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold" style={{ color: '#2C1810' }}>
                          {history.title}
                        </h3>
                        <p className="font-medium" style={{ color: '#C41E3A' }}>
                          {history.narrator}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {history.hasAudio && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Audio
                          </span>
                        )}
                        {history.hasVideo && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Video
                          </span>
                        )}
                        {history.hasTranscript && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Transcript
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm mt-1" style={{ color: '#8B7355' }}>
                      {history.narratorBio}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ color: '#8B7355' }}>
                      <span>📅 {history.recordingDate}</span>
                      <span>⏱️ {history.duration}</span>
                      <span>📍 {history.location}</span>
                      <span>🌐 {history.language}</span>
                    </div>

                    <p className="mt-4" style={{ color: '#5C3D2E' }}>
                      {history.summary}
                    </p>

                    {/* Excerpt */}
                    <blockquote className="mt-4 pl-4 italic" style={{ borderLeft: '4px solid #C41E3A', color: '#5C3D2E' }}>
                      {history.transcriptExcerpt}
                    </blockquote>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {history.topics.map(topic => (
                        <span
                          key={topic}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-4 flex flex-wrap gap-4" style={{ background: 'rgba(196, 30, 58, 0.04)' }}>
                {history.hasAudio && (
                  <button
                    onClick={() => setPlayingId(playingId === history.id ? null : history.id)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
                    style={{ background: '#C41E3A' }}
                  >
                    <span>{playingId === history.id ? '⏸️' : '▶️'}</span>
                    <span>{playingId === history.id ? 'Pause' : 'Listen'}</span>
                  </button>
                )}

                {history.hasTranscript && (
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}>
                    <span>📄</span>
                    <span>Read Transcript</span>
                  </button>
                )}

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}>
                  <span>📤</span>
                  <span>Share</span>
                </button>

                <span className="text-sm ml-auto" style={{ color: '#8B7355' }}>
                  Collection: {history.collection}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredHistories.length === 0 && (
          <div className="text-center py-12" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
            <p style={{ color: '#8B7355' }}>No oral histories match your search</p>
          </div>
        )}

        {/* Contribute Section */}
        <div className="mt-12 rounded-lg p-8" style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }}>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Share Your Story</h2>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Do you have memories of participation in liberation movements, labor struggles,
              or other historical events? Your testimony can help preserve history for future
              generations. We welcome oral histories in any language.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 rounded-lg font-medium" style={{ background: '#FFFFFF', color: '#8B1A1A' }}>
                Submit Your Story
              </button>
              <button className="px-6 py-3 rounded-lg text-white" style={{ border: '1px solid white' }}>
                Learn About Our Process
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OralHistoryPage;
