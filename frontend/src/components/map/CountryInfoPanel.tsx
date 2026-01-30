import { useState } from 'react'
import { useCountry } from '../../api/geography'
import { useMapStore } from '../../stores/mapStore'
import CountryTabs from '../country/CountryTabs'
import OverviewTab from '../country/OverviewTab'
import ElectionsTab from '../country/ElectionsTab'
import PartiesTab from '../country/PartiesTab'
import PeopleTab from '../country/PeopleTab'
import EventsTab from '../country/EventsTab'
import ConflictsTab from '../country/ConflictsTab'
import BooksTab from '../country/BooksTab'
import PoliciesTab from '../country/PoliciesTab'

export default function CountryInfoPanel() {
  const { selectedCountryId, selectedYear, selectCountry } = useMapStore()
  const { data: country, isLoading } = useCountry(selectedCountryId || '')
  const [activeTab, setActiveTab] = useState('overview')

  if (!selectedCountryId) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-gray-500 mb-2">Select a country on the map</p>
          <p className="text-sm text-gray-400">Click on any country to see detailed information</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!country) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <p className="text-gray-500">Country not found</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'elections', label: 'Elections' },
    { id: 'parties', label: 'Parties' },
    { id: 'policies', label: 'Policies' },
    { id: 'people', label: 'People' },
    { id: 'events', label: 'Events' },
    { id: 'conflicts', label: 'Conflicts' },
    { id: 'books', label: 'Books' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{country.name_en}</h2>
            <p className="text-sm text-gray-500">Viewing: {selectedYear}</p>
          </div>
          <button
            onClick={() => selectCountry(null)}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <CountryTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {activeTab === 'overview' && <OverviewTab country={country} year={selectedYear} />}
        {activeTab === 'elections' && <ElectionsTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'parties' && <PartiesTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'people' && <PeopleTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'events' && <EventsTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'conflicts' && <ConflictsTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'policies' && <PoliciesTab countryId={country.id} year={selectedYear} />}
        {activeTab === 'books' && <BooksTab countryId={country.id} />}
      </div>
    </div>
  )
}
