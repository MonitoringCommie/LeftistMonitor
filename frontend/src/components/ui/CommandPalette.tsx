import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useCommandPalette } from './CommandPaletteProvider'
import { globalSearch, type SearchResult } from '../../api/search'

// ── Types ──────────────────────────────────────────────────────────────
interface TreeNode {
  id: string
  label: string
  count?: string
  children?: TreeNode[]
  action?: () => void
}

// ── Constants ──────────────────────────────────────────────────────────
const DEBOUNCE_MS = 250

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)
const modKey = isMac ? '\u2318' : 'Ctrl'

// ── Static Category Tree ───────────────────────────────────────────────
function buildCategoryTree(navigate: (path: string) => void): TreeNode[] {
  return [
    {
      id: 'countries',
      label: 'Countries',
      count: '710',
      action: () => navigate('/map'),
    },
    {
      id: 'conflicts',
      label: 'Conflicts & Wars',
      count: '21K',
      children: [
        { id: 'conflicts-civil', label: 'Civil Wars', action: () => navigate('/conflicts?type=civil_war') },
        { id: 'conflicts-interstate', label: 'Interstate', action: () => navigate('/conflicts?type=interstate') },
        { id: 'conflicts-colonial', label: 'Colonial / Anti-Colonial', action: () => navigate('/conflicts?type=colonial') },
        { id: 'conflicts-revolutionary', label: 'Revolutionary', action: () => navigate('/conflicts?type=revolutionary') },
      ],
    },
    {
      id: 'people',
      label: 'People & Figures',
      count: '104K',
      children: [
        { id: 'people-politician', label: 'Politicians', action: () => navigate('/people?type=politician') },
        { id: 'people-activist', label: 'Activists', action: () => navigate('/people?type=activist') },
        { id: 'people-writer', label: 'Writers & Authors', action: () => navigate('/people?type=writer') },
      ],
    },
    {
      id: 'books',
      label: 'Books & Literature',
      count: '33K',
      children: [
        { id: 'books-theory', label: 'Political Theory', action: () => navigate('/books?type=political_theory') },
        { id: 'books-manifesto', label: 'Manifestos', action: () => navigate('/books?type=manifesto') },
        { id: 'books-history', label: 'History', action: () => navigate('/books?type=history') },
        { id: 'books-economics', label: 'Economics', action: () => navigate('/books?type=economics') },
      ],
    },
    {
      id: 'elections',
      label: 'Elections',
      count: '30K',
      action: () => navigate('/elections'),
    },
    {
      id: 'parties',
      label: 'Political Parties',
      count: '12.8K',
      children: [
        { id: 'parties-communist', label: 'Communist / Socialist', action: () => navigate('/elections?family=communist') },
        { id: 'parties-socdem', label: 'Social Democracy', action: () => navigate('/elections?family=social_democracy') },
        { id: 'parties-green', label: 'Green / Ecologist', action: () => navigate('/elections?family=green') },
      ],
    },
  ]
}

// ── Result navigation helper ───────────────────────────────────────────
function getResultPath(result: SearchResult): string {
  switch (result.type) {
    case 'country': return `/country/${result.id}`
    case 'person': return `/person/${result.id}`
    case 'book': return `/book/${result.id}`
    case 'conflict': return `/conflict/${result.id}`
    case 'event': return `/event/${result.id}`
    default: return '/'
  }
}

const TYPE_ICONS: Record<string, string> = {
  country: '\uD83C\uDF0D',
  person: '\uD83D\uDC64',
  book: '\uD83D\uDCDA',
  conflict: '\u26A1',
  event: '\uD83D\uDCC5',
}

// ── Component ──────────────────────────────────────────────────────────
export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const categoryTree = useMemo(() => buildCategoryTree((path) => {
    navigate(path)
    close()
  }), [navigate, close])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setExpandedNodes(new Set())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await globalSearch(q, undefined, 20)
      setResults(res.results)
      setSelectedIndex(0)
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), DEBOUNCE_MS)
  }, [doSearch])

  // ── Flatten visible items for keyboard nav ───────────────────────────
  const flatItems = useMemo(() => {
    if (query.length >= 2) {
      // Grouped search results
      return results.map(r => ({
        type: 'result' as const,
        result: r,
      }))
    }
    // Tree mode
    const items: Array<{ type: 'node'; node: TreeNode; depth: number }> = []
    const walk = (nodes: TreeNode[], depth: number) => {
      for (const node of nodes) {
        items.push({ type: 'node', node, depth })
        if (node.children && expandedNodes.has(node.id)) {
          walk(node.children, depth + 1)
        }
      }
    }
    walk(categoryTree, 0)
    return items
  }, [query, results, categoryTree, expandedNodes])

  // ── Toggle tree node ─────────────────────────────────────────────────
  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Keyboard handler ─────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const count = flatItems.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % Math.max(count, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + Math.max(count, 1)) % Math.max(count, 1))
        break
      case 'ArrowRight': {
        e.preventDefault()
        const item = flatItems[selectedIndex]
        if (item?.type === 'node' && item.node.children && !expandedNodes.has(item.node.id)) {
          toggleNode(item.node.id)
        }
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        const item = flatItems[selectedIndex]
        if (item?.type === 'node' && expandedNodes.has(item.node.id)) {
          toggleNode(item.node.id)
        }
        break
      }
      case 'Enter': {
        e.preventDefault()
        const item = flatItems[selectedIndex]
        if (!item) break
        if (item.type === 'result') {
          navigate(getResultPath(item.result))
          close()
        } else if (item.type === 'node') {
          if (item.node.children) {
            toggleNode(item.node.id)
          } else if (item.node.action) {
            item.node.action()
          }
        }
        break
      }
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }, [flatItems, selectedIndex, expandedNodes, toggleNode, navigate, close])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!isOpen) return null

  // ── Group results by type for display ────────────────────────────────
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    }
    return groups
  }, [results])

  const isSearchMode = query.length >= 2

  // ── Build result index map for selectedIndex ────────────────────────
  let globalIdx = -1

  return createPortal(
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          backgroundColor: 'rgba(139, 26, 26, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={close}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '42rem', zIndex: 9999,
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(139, 26, 26, 0.25)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '70vh',
          overflow: 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #C41E3A' }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#8B7355' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Search or browse..."
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#2C1810',
                background: 'transparent',
                fontFamily: 'Georgia, serif',
              }}
            />
            {isSearching && (
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid #E8C8C8', borderTopColor: '#C41E3A',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '8px 0',
          }}
        >
          {isSearchMode ? (
            /* ── Grouped Search Results ── */
            results.length === 0 && !isSearching ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8B7355' }}>
                No results for "{query}"
              </div>
            ) : (
              Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <div style={{
                    padding: '8px 20px 4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8B1A1A',
                    fontFamily: 'Georgia, serif',
                  }}>
                    {type === 'country' ? 'Countries' :
                     type === 'person' ? 'People' :
                     type === 'book' ? 'Books' :
                     type === 'conflict' ? 'Conflicts' :
                     type === 'event' ? 'Events' : type}
                  </div>
                  {items.map((r) => {
                    globalIdx++
                    const idx = globalIdx
                    const isSelected = idx === selectedIndex
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        data-selected={isSelected}
                        onClick={() => {
                          navigate(getResultPath(r))
                          close()
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '10px 20px',
                          border: 'none',
                          background: isSelected ? 'rgba(196, 30, 58, 0.08)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #C41E3A' : '3px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.1s',
                        }}
                      >
                        <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>
                          {TYPE_ICONS[r.type] || ''}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 500,
                            color: '#2C1810',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                          }}>
                            {r.title}
                          </div>
                          {r.subtitle && (
                            <div style={{
                              fontSize: '12px',
                              color: '#8B7355',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {r.subtitle}
                            </div>
                          )}
                        </div>
                        {r.year && (
                          <span style={{ fontSize: '12px', color: '#8B7355', flexShrink: 0 }}>
                            {r.year}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )
          ) : (
            /* ── Category Tree ── */
            flatItems.map((item, i) => {
              if (item.type !== 'node') return null
              const { node, depth } = item
              const isSelected = i === selectedIndex
              const hasChildren = !!node.children
              const isExpanded = expandedNodes.has(node.id)

              return (
                <button
                  key={node.id}
                  data-selected={isSelected}
                  onClick={() => {
                    if (hasChildren) {
                      toggleNode(node.id)
                    } else if (node.action) {
                      node.action()
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: `8px 20px 8px ${20 + depth * 24}px`,
                    border: 'none',
                    background: isSelected ? 'rgba(196, 30, 58, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #C41E3A' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                    fontSize: depth === 0 ? '14px' : '13px',
                  }}
                >
                  {/* Chevron */}
                  {hasChildren ? (
                    <span style={{
                      color: '#D4A017',
                      fontSize: '12px',
                      width: '16px',
                      textAlign: 'center',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>
                      &#9654;
                    </span>
                  ) : (
                    <span style={{ width: '16px' }} />
                  )}

                  {/* Label */}
                  <span style={{
                    flex: 1,
                    color: depth === 0 ? '#8B1A1A' : '#5C3D2E',
                    fontWeight: depth === 0 ? 600 : 400,
                    fontFamily: depth === 0 ? 'Georgia, serif' : 'inherit',
                  }}>
                    {node.label}
                  </span>

                  {/* Count */}
                  {node.count && (
                    <span style={{
                      fontSize: '12px',
                      color: '#8B7355',
                      background: 'rgba(196, 30, 58, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      flexShrink: 0,
                    }}>
                      {node.count}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #E8C8C8',
          background: '#FFF5F6',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          color: '#8B7355',
          flexWrap: 'wrap',
        }}>
          <span>
            <Kbd>\u2191\u2193</Kbd> navigate
          </span>
          <span>
            <Kbd>\u21B5</Kbd> select
          </span>
          <span>
            <Kbd>\u2190\u2192</Kbd> expand/collapse
          </span>
          <span>
            <Kbd>esc</Kbd> close
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <Kbd>{modKey}+K</Kbd> toggle
          </span>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }`}</style>
    </>,
    document.body,
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      display: 'inline-block',
      padding: '1px 6px',
      fontSize: '11px',
      fontFamily: 'system-ui, sans-serif',
      color: '#5C3D2E',
      background: '#FFFFFF',
      border: '1px solid #E8C8C8',
      borderRadius: '4px',
      boxShadow: '0 1px 0 #E8C8C8',
    }}>
      {children}
    </kbd>
  )
}
