import { memo } from 'react'
import { Link } from 'react-router-dom'

const AboutPage = memo(function AboutPage() {
  return (
    <div style={{ backgroundColor: '#FFF5F6' }} className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#8B1A1A' }}>
            About Leftist Monitor
          </h1>
          <p className="text-xl" style={{ color: '#5C3D2E' }}>
            An interactive historical world map with a leftist/progressive perspective,
            documenting the struggles of oppressed peoples worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Our Mission
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            Leftist Monitor aims to document and visualize the historical and ongoing struggles
            of oppressed peoples around the world. We believe that understanding history from
            the perspective of those who have been colonized, occupied, and marginalized is
            essential for building solidarity and working toward justice.
          </p>
          <p style={{ color: '#5C3D2E' }}>
            This project compiles data on occupations, checkpoints, settlements, massacres,
            resistance movements, political figures, and literature from a leftist perspective.
            We do not claim neutrality - we stand with the oppressed against their oppressors.
          </p>
        </section>

        {/* What We Document */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            What We Document
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810' }}>
                Palestine (Israeli Occupation)
              </h3>
              <ul style={{ color: '#5C3D2E' }} className="space-y-1 list-disc list-inside">
                <li>180+ checkpoints across the West Bank</li>
                <li>97 illegal settlements with population data</li>
                <li>141 Nakba villages destroyed in 1948</li>
                <li>712km separation wall</li>
                <li>Massacres and key historical events</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810' }}>
                Ireland (British Colonial History)
              </h3>
              <ul style={{ color: '#5C3D2E' }} className="space-y-1 list-disc list-inside">
                <li>Great Famine (1845-1852) data by county</li>
                <li>The Troubles events and state collusion</li>
                <li>Partition history</li>
                <li>Republican resistance movements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810' }}>
                Western Sahara (Moroccan Occupation)
              </h3>
              <ul style={{ color: '#5C3D2E' }} className="space-y-1 list-disc list-inside">
                <li>2,720km Sand Berm (world's longest wall)</li>
                <li>Moroccan military installations</li>
                <li>Sahrawi refugee camps</li>
                <li>Illegal resource extraction</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810' }}>
                Kurdistan (Multi-State Oppression)
              </h3>
              <ul style={{ color: '#5C3D2E' }} className="space-y-1 list-disc list-inside">
                <li>4,000+ destroyed Kurdish villages in Turkey</li>
                <li>Dam projects flooding historic sites</li>
                <li>Massacres (Dersim, Roboski, etc.)</li>
                <li>Political prisoners and cultural suppression</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Documentation */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Coming Soon
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            We are actively working to document more struggles:
          </p>
          <div className="grid md:grid-cols-3 gap-4" style={{ color: '#5C3D2E' }}>
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
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Leftist Literature
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            Our database includes 180+ books essential to leftist thought:
          </p>
          <div className="grid md:grid-cols-2 gap-4" style={{ color: '#5C3D2E' }}>
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
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Data Sources
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            We compile data from reputable human rights organizations, academic research,
            and primary sources:
          </p>
          <ul style={{ color: '#5C3D2E' }} className="space-y-2 list-disc list-inside">
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
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Technical Details
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            Leftist Monitor is built with:
          </p>
          <div className="grid md:grid-cols-2 gap-4" style={{ color: '#5C3D2E' }}>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Frontend</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>React + TypeScript + Vite</li>
                <li>MapLibre GL JS for maps</li>
                <li>TailwindCSS for styling</li>
                <li>React Query for data fetching</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Backend</h4>
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
        <section style={{
          background: 'rgba(196, 30, 58, 0.08)',
          border: '1px solid rgba(196, 30, 58, 0.3)',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-2xl font-bold mb-4 uppercase tracking-wider text-sm">
            Contribute
          </h2>
          <p style={{ color: '#5C3D2E' }} className="mb-4">
            This is an open-source project. If you have data to contribute, corrections to suggest,
            or want to help with development, please reach out. We especially need:
          </p>
          <ul style={{ color: '#5C3D2E' }} className="space-y-2 list-disc list-inside">
            <li>Primary source documentation for underrepresented struggles</li>
            <li>Translations of leftist texts</li>
            <li>Geographic data on occupation infrastructure</li>
            <li>Frontend and backend development help</li>
          </ul>
        </section>

        {/* Solidarity Statement */}
        <section style={{
          background: '#FFFFFF',
          border: '2px solid rgba(196, 30, 58, 0.4)',
          borderRadius: '10px'
        }} className="p-6 mb-6">
          <h2 style={{ color: '#C41E3A' }} className="text-2xl font-bold mb-4">
            About This Project
          </h2>
          <p className="mt-4" style={{ color: '#5C3D2E' }}>
            LeftistMonitor tracks left-wing political movements, parties, elections, conflicts,
            and key figures across the world. The data covers historical and contemporary events
            from dozens of countries.
          </p>
        </section>

        {/* Back to Map */}
        <div className="text-center">
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

export default AboutPage
