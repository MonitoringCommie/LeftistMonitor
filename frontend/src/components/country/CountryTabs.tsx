import { memo } from 'react'

interface Tab {
  id: string
  label: string
  count?: number
}

interface CountryTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const CountryTabs = memo(function CountryTabs({ tabs, activeTab, onTabChange }: CountryTabsProps) {
  return (
    <div style={{ borderBottom: '1px solid #E8C8C8' }}>
      <nav
        className="flex space-x-1 overflow-x-auto"
        aria-label="Country information tabs"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
            style={
              activeTab === tab.id
                ? { borderBottom: '2px solid #D4A017', color: '#C41E3A' }
                : { borderBottom: '2px solid transparent', color: '#8B7355' }
            }
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full"
                style={
                  activeTab === tab.id
                    ? { background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }
                    : { background: 'rgba(139, 115, 85, 0.1)', color: '#8B7355' }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
})

export default CountryTabs
