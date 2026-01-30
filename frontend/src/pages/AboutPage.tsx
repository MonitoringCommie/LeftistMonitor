import { memo } from 'react'
import { Link } from 'react-router-dom'

const AboutPage = memo(function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Leftist Monitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            An interactive historical world map with a leftist/progressive perspective,
            documenting the struggles of oppressed peoples worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Leftist Monitor aims to document and visualize the historical and ongoing struggles
            of oppressed peoples around the world. We believe that understanding history from
            the perspective of those who have been colonized, occupied, and marginalized is
            essential for building solidarity and working toward justice.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            This project compiles data on occupations, checkpoints, settlements, massacres,
            resistance movements, political figures, and literature from a leftist perspective.
            We do not claim neutrality - we stand with the oppressed against their oppressors.
          </p>
        </section>

        {/* What We Document */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            What We Document
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Palestine (Israeli Occupation)
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>180+ checkpoints across the West Bank</li>
                <li>97 illegal settlements with population data</li>
                <li>141 Nakba villages destroyed in 1948</li>
                <li>712km separation wall</li>
                <li>Massacres and key historical events</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ireland (British Colonial History)
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Great Famine (1845-1852) data by county</li>
                <li>The Troubles events and state collusion</li>
                <li>Partition history</li>
                <li>Republican resistance movements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Western Sahara (Moroccan Occupation)
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>2,720km Sand Berm (world's longest wall)</li>
                <li>Moroccan military installations</li>
                <li>Sahrawi refugee camps</li>
                <li>Illegal resource extraction</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Kurdistan (Multi-State Oppression)
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>4,000+ destroyed Kurdish villages in Turkey</li>
                <li>Dam projects flooding historic sites</li>
                <li>Massacres (Dersim, Roboski, etc.)</li>
                <li>Political prisoners and cultural suppression</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Documentation */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We are actively working to document more struggles:
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
            <ul className="space-y-1 list-disc list-inside">
              <li>Kashmir (Indian Occupation)</li>
              <li>Tibet (Chinese Occupation)</li>
              <li>West Papua (Indonesian)</li>
            </ul>
            <ul className="space-y-1 list-disc list-inside">
              <li>Uyghur Region/Xinjiang</li>
              <li>Apartheid South Africa</li>
              <li>Algeria (French Colonial)</li>
            </ul>
            <ul className="space-y-1 list-disc list-inside">
              <li>Vietnam (US War)</li>
              <li>Congo (Belgian Colonial)</li>
              <li>India (British Colonial)</li>
            </ul>
          </div>
        </section>

        {/* Leftist Literature */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Leftist Literature
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our database includes 180+ books essential to leftist thought:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <ul className="space-y-1 list-disc list-inside">
              <li>Marxist classics (Marx, Engels, Lenin)</li>
              <li>Anti-colonial works (Fanon, Cabral, Said)</li>
              <li>Anarchist theory (Kropotkin, Goldman)</li>
              <li>Critical theory (Frankfurt School)</li>
            </ul>
            <ul className="space-y-1 list-disc list-inside">
              <li>Feminist Marxism (Davis, hooks, Federici)</li>
              <li>Black liberation (Malcolm X, Huey Newton)</li>
              <li>Latin American socialism</li>
              <li>Palestinian resistance literature</li>
            </ul>
          </div>
        </section>

        {/* Sources */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Data Sources
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We compile data from reputable human rights organizations, academic research,
            and primary sources:
          </p>
          <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
            <li>B'Tselem - The Israeli Information Center for Human Rights in the Occupied Territories</li>
            <li>Human Rights Watch reports</li>
            <li>UN OCHA (Office for the Coordination of Humanitarian Affairs)</li>
            <li>Zochrot - Nakba documentation</li>
            <li>Kurdish Human Rights Project (KHRP)</li>
            <li>Internal Displacement Monitoring Centre</li>
            <li>Academic historical research</li>
            <li>Marxists Internet Archive (marxists.org)</li>
          </ul>
        </section>

        {/* Tech Stack */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Technical Details
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Leftist Monitor is built with:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>React + TypeScript + Vite</li>
                <li>MapLibre GL JS for maps</li>
                <li>TailwindCSS for styling</li>
                <li>React Query for data fetching</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backend</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>FastAPI (Python)</li>
                <li>PostgreSQL with PostGIS</li>
                <li>SQLAlchemy + GeoAlchemy2</li>
                <li>Alembic for migrations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6 mb-6 border border-red-200 dark:border-red-800">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-500 mb-4">
            Contribute
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This is an open-source project. If you have data to contribute, corrections to suggest,
            or want to help with development, please reach out. We especially need:
          </p>
          <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
            <li>Primary source documentation for underrepresented struggles</li>
            <li>Translations of leftist texts</li>
            <li>Geographic data on occupation infrastructure</li>
            <li>Frontend and backend development help</li>
          </ul>
        </section>

        {/* Solidarity Statement */}
        <section className="bg-gray-900 dark:bg-black text-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Solidarity Forever
          </h2>
          <blockquote className="text-lg italic border-l-4 border-red-500 pl-4">
            "The history of all hitherto existing society is the history of class struggles."
            <footer className="text-gray-400 mt-2">- Karl Marx & Friedrich Engels, The Communist Manifesto</footer>
          </blockquote>
          <p className="mt-4 text-gray-300">
            From Palestine to Ireland, from Kurdistan to Western Sahara, the struggles of
            oppressed peoples are interconnected. An injury to one is an injury to all.
          </p>
        </section>

        {/* Back to Map */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Explore the Map
          </Link>
        </div>
      </div>
    </div>
  )
})

export default AboutPage
