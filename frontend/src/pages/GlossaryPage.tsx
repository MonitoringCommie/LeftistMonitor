import { memo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

interface GlossaryTerm {
  term: string
  definition: string
  category: string
  relatedTerms?: string[]
  examples?: string[]
}

const glossaryTerms: GlossaryTerm[] = [
  // Colonialism & Occupation
  {
    term: "Settler Colonialism",
    definition: "A form of colonialism where the colonizing power seeks to replace the indigenous population with settlers, rather than merely extracting resources. Unlike extractive colonialism, settler colonialism aims for permanent settlement and the elimination or marginalization of native peoples.",
    category: "Colonialism & Occupation",
    relatedTerms: ["Colonialism", "Indigenous Rights", "Ethnic Cleansing"],
    examples: ["Israeli settlements in Palestine", "European colonization of Americas", "British colonization of Australia"]
  },
  {
    term: "Apartheid",
    definition: "A system of institutionalized racial segregation and discrimination. The term originated in South Africa (1948-1994) but is now applied to any system that maintains racial domination through laws, policies, and practices that separate and oppress one group.",
    category: "Colonialism & Occupation",
    relatedTerms: ["Segregation", "Bantustans", "Pass Laws"],
    examples: ["South Africa (1948-1994)", "Israeli occupation of Palestine (as characterized by HRW, Amnesty, B'Tselem)"]
  },
  {
    term: "Occupation",
    definition: "Military control of a territory by a foreign power. Under international law (Fourth Geneva Convention), occupying powers have obligations to the civilian population and cannot transfer their own population into occupied territory.",
    category: "Colonialism & Occupation",
    relatedTerms: ["Geneva Conventions", "International Law", "Military Rule"],
    examples: ["Israeli occupation of Palestine", "Moroccan occupation of Western Sahara", "Chinese occupation of Tibet"]
  },
  {
    term: "Ethnic Cleansing",
    definition: "The systematic forced removal of ethnic, racial, or religious groups from a given area, often with violence or intimidation. It aims to create ethnically homogeneous regions.",
    category: "Colonialism & Occupation",
    relatedTerms: ["Genocide", "Forced Displacement", "Population Transfer"],
    examples: ["1948 Nakba", "Bosnian War", "Rohingya in Myanmar"]
  },

  // Palestine-specific
  {
    term: "Nakba",
    definition: "Arabic for 'catastrophe.' Refers to the 1948 mass displacement of approximately 750,000 Palestinians during the creation of Israel. Over 400 villages were depopulated and destroyed. Palestinians commemorate Nakba Day on May 15th.",
    category: "Palestine",
    relatedTerms: ["Right of Return", "Palestinian Refugees", "1948 War"],
    examples: ["Destruction of Deir Yassin", "Depopulation of Lydda and Ramle", "Tantura massacre"]
  },
  {
    term: "Right of Return",
    definition: "The principle that Palestinian refugees and their descendants have the right to return to their homes and lands from which they were expelled. Enshrined in UN Resolution 194 (1948) but never implemented.",
    category: "Palestine",
    relatedTerms: ["Nakba", "UNRWA", "Palestinian Refugees"]
  },
  {
    term: "BDS",
    definition: "Boycott, Divestment, Sanctions - a Palestinian-led movement calling for economic and political pressure on Israel until it complies with international law. Modeled on the anti-apartheid movement against South Africa.",
    category: "Palestine",
    relatedTerms: ["Apartheid", "Anti-Apartheid Movement", "Economic Resistance"],
    examples: ["Academic boycotts", "Corporate divestment campaigns", "Cultural boycotts"]
  },
  {
    term: "Checkpoint",
    definition: "Military barriers controlling Palestinian movement within the occupied territories. Palestinians must pass through checkpoints to travel between cities, often facing hours of delays, searches, and arbitrary denial of passage.",
    category: "Palestine",
    relatedTerms: ["Freedom of Movement", "Occupation", "West Bank"],
    examples: ["Qalandia checkpoint", "Huwwara checkpoint", "Container checkpoint"]
  },
  {
    term: "Settlement",
    definition: "Israeli civilian communities built on occupied Palestinian territory. All settlements are illegal under international law (Fourth Geneva Convention, Article 49). Over 700,000 settlers now live in the West Bank and East Jerusalem.",
    category: "Palestine",
    relatedTerms: ["Settler Colonialism", "Occupation", "Land Theft"],
    examples: ["Ma'ale Adumim", "Ariel", "Kiryat Arba"]
  },
  {
    term: "Intifada",
    definition: "Arabic for 'shaking off.' Refers to Palestinian uprisings against Israeli occupation. The First Intifada (1987-1993) was largely nonviolent; the Second Intifada (2000-2005) included armed resistance.",
    category: "Palestine",
    relatedTerms: ["Resistance", "Occupation", "Oslo Accords"]
  },

  // Leftist Theory
  {
    term: "Imperialism",
    definition: "The policy of extending a nation's authority through territorial acquisition or economic and political dominance. Lenin analyzed it as the highest stage of capitalism, where capital export and monopolies divide the world.",
    category: "Leftist Theory",
    relatedTerms: ["Colonialism", "Neo-colonialism", "Capitalism"],
    examples: ["British Empire", "US interventions in Latin America", "French colonialism in Africa"]
  },
  {
    term: "Solidarity",
    definition: "Unity and mutual support among oppressed peoples and workers. International solidarity connects struggles across borders, recognizing that liberation movements are interconnected.",
    category: "Leftist Theory",
    relatedTerms: ["Internationalism", "Working Class Unity", "Mutual Aid"]
  },
  {
    term: "Praxis",
    definition: "The process of putting theory into practice. In Marxist thought, praxis refers to the unity of theory and revolutionary action - understanding the world in order to change it.",
    category: "Leftist Theory",
    relatedTerms: ["Theory", "Revolutionary Practice", "Consciousness"]
  },
  {
    term: "Self-Determination",
    definition: "The right of peoples to determine their own political status and pursue their economic, social, and cultural development. A fundamental principle of international law and anti-colonial movements.",
    category: "Leftist Theory",
    relatedTerms: ["Sovereignty", "Independence", "Decolonization"],
    examples: ["Palestinian self-determination", "Kurdish self-determination", "Sahrawi self-determination"]
  },
  {
    term: "Class Struggle",
    definition: "The conflict between social classes with opposing economic interests. In Marxist theory, the fundamental driver of historical change, particularly the struggle between workers and capitalists.",
    category: "Leftist Theory",
    relatedTerms: ["Working Class", "Bourgeoisie", "Revolution"]
  },
  {
    term: "Dialectical Materialism",
    definition: "The Marxist philosophical framework viewing history as driven by material conditions and class conflict, with change occurring through the resolution of contradictions. The basis of historical materialism.",
    category: "Leftist Theory",
    relatedTerms: ["Historical Materialism", "Marxism", "Hegelian Dialectics"]
  },

  // Resistance & Liberation
  {
    term: "Liberation Movement",
    definition: "An organized effort to free a people from oppression, colonialism, or foreign domination. Often combines political, military, and cultural resistance.",
    category: "Resistance & Liberation",
    relatedTerms: ["National Liberation", "Armed Struggle", "Resistance"],
    examples: ["PLO", "ANC", "FLN", "Viet Cong", "FMLN"]
  },
  {
    term: "Armed Resistance",
    definition: "The use of armed force by an oppressed people against their oppressors. International law recognizes the right of peoples under colonial and foreign domination to use all means, including armed struggle, to achieve self-determination.",
    category: "Resistance & Liberation",
    relatedTerms: ["Guerrilla Warfare", "Liberation Movement", "Right to Resist"]
  },
  {
    term: "Sumud",
    definition: "Arabic for 'steadfastness.' A Palestinian philosophy of resistance through remaining on the land and maintaining daily life despite occupation. A form of nonviolent resistance through existence.",
    category: "Resistance & Liberation",
    relatedTerms: ["Resistance", "Resilience", "Palestinian Identity"]
  },

  // International Law
  {
    term: "Geneva Conventions",
    definition: "International treaties establishing standards for humanitarian treatment in war. The Fourth Geneva Convention (1949) specifically protects civilians in occupied territories and prohibits population transfer.",
    category: "International Law",
    relatedTerms: ["International Humanitarian Law", "War Crimes", "Occupation"]
  },
  {
    term: "ICC (International Criminal Court)",
    definition: "An international tribunal that prosecutes individuals for genocide, crimes against humanity, war crimes, and aggression. Palestine has been a member since 2015; the ICC has opened an investigation into crimes in the Occupied Territories.",
    category: "International Law",
    relatedTerms: ["War Crimes", "Crimes Against Humanity", "International Justice"]
  },
  {
    term: "ICJ (International Court of Justice)",
    definition: "The principal judicial organ of the United Nations, settling legal disputes between states. In 2004, the ICJ ruled Israel's separation wall illegal; in 2024 it ruled on the genocide case against Israel.",
    category: "International Law",
    relatedTerms: ["UN", "International Law", "Legal Rulings"]
  },

  // Human Rights
  {
    term: "Collective Punishment",
    definition: "Punishment imposed on a group for actions of individuals. Prohibited under international law (Fourth Geneva Convention, Article 33). Israel regularly employs collective punishment against Palestinians.",
    category: "Human Rights",
    relatedTerms: ["Geneva Conventions", "War Crimes", "Home Demolitions"],
    examples: ["Gaza blockade", "Home demolitions", "Curfews on entire populations"]
  },
  {
    term: "Administrative Detention",
    definition: "Imprisonment without charge or trial. Israel holds hundreds of Palestinians in administrative detention, renewable indefinitely. Detainees cannot see evidence against them.",
    category: "Human Rights",
    relatedTerms: ["Political Prisoners", "Due Process", "Indefinite Detention"]
  },
  {
    term: "Enforced Disappearance",
    definition: "When a person is arrested or detained by the state, which then denies holding them or refuses to disclose their fate. Documented extensively in Kashmir, Latin America, and elsewhere.",
    category: "Human Rights",
    relatedTerms: ["Political Prisoners", "Human Rights Violations", "State Terror"]
  }
]

const categories = [...new Set(glossaryTerms.map(t => t.category))]

const GlossaryPage = memo(function GlossaryPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = searchQuery === '' ||
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || term.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ backgroundColor: '#FFF5F6' }} className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#8B1A1A' }}>
            Glossary
          </h1>
          <p className="text-xl" style={{ color: '#5C3D2E' }}>
            Key terms for understanding colonialism, occupation, resistance, and leftist theory.
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#FFF5F6',
                  borderColor: 'rgba(196, 30, 58, 0.3)',
                  color: '#2C1810'
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C41E3A'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: !selectedCategory ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                  color: !selectedCategory ? '#fff' : '#C41E3A',
                  border: !selectedCategory ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                  borderRadius: '9999px'
                }}
                className="px-3 py-1 text-sm transition-colors"
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                    color: selectedCategory === cat ? '#fff' : '#C41E3A',
                    border: selectedCategory === cat ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                    borderRadius: '9999px'
                  }}
                  className="px-3 py-1 text-sm transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms Count */}
        <p style={{ color: '#8B7355' }} className="mb-4">
          Showing {filteredTerms.length} of {glossaryTerms.length} terms
        </p>

        {/* Terms List */}
        <div className="space-y-4">
          {filteredTerms.map((term) => (
            <div
              key={term.term}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(196, 30, 58, 0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <h3 className="text-xl font-bold" style={{ color: '#2C1810' }}>
                    {term.term}
                  </h3>
                  <span style={{ color: '#C41E3A' }} className="text-sm uppercase tracking-wide">
                    {term.category}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    expandedTerm === term.term ? 'rotate-180' : ''
                  }`}
                  style={{ color: '#8B7355' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedTerm === term.term && (
                <div style={{
                  borderTopColor: '#E8C8C8'
                }} className="px-6 pb-4 border-t">
                  <p style={{ color: '#5C3D2E' }} className="mt-4 text-lg leading-relaxed">
                    {term.definition}
                  </p>

                  {term.examples && term.examples.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 uppercase text-sm" style={{ color: '#C41E3A' }}>Examples:</h4>
                      <ul className="list-disc list-inside space-y-1" style={{ color: '#5C3D2E' }}>
                        {term.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 uppercase text-sm" style={{ color: '#C41E3A' }}>Related Terms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {term.relatedTerms.map((related, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSearchQuery(related)
                              setExpandedTerm(null)
                            }}
                            style={{
                              background: 'rgba(196, 30, 58, 0.1)',
                              color: '#C41E3A',
                              border: '1px solid rgba(196, 30, 58, 0.3)',
                              borderRadius: '9999px'
                            }}
                            className="px-3 py-1 text-sm transition-colors"
                          >
                            {related}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: '#8B7355' }} className="text-lg">
              No terms found matching your search.
            </p>
          </div>
        )}

        {/* Back to Map */}
        <div className="text-center mt-8">
          <Link
            to="/"
            style={{
              background: '#C41E3A',
              color: '#fff'
            }}
            className="inline-block font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-80"
          >
            Explore the Map
          </Link>
        </div>
      </div>
    </div>
  )
})

export default GlossaryPage
