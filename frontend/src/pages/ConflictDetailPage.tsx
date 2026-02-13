import { useParams, Link } from 'react-router-dom'
import { useConflict } from '../api/events'
import type { ConflictParticipant } from '../types'

const TYPE_LABELS: Record<string, string> = {
  interstate: 'Interstate',
  civil_war: 'Civil War',
  colonial: 'Colonial',
  ethnic: 'Ethnic',
  revolutionary: 'Revolutionary',
  proxy: 'Proxy War',
  battle: 'Battle',
  military_operation: 'Military Operation',
  one_sided: 'One-Sided Violence',
  intrastate: 'Intrastate',
  coup: 'Coup',
}

const TYPE_COLORS: Record<string, string> = {
  interstate: '#4A0E0E',
  civil_war: '#8B0000',
  colonial: '#5C3D2E',
  ethnic: '#B8860B',
  revolutionary: '#C41E3A',
  proxy: '#8B1A1A',
  battle: '#C41E3A',
  military_operation: '#8B1A1A',
  one_sided: '#D4A017',
  intrastate: '#B8860B',
  coup: '#5C3D2E',
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function computeDuration(start?: string, end?: string): string {
  if (!start) return 'Unknown'
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const diffMs = e.getTime() - s.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''}`
  const months = Math.floor(days / 30.44)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years} yr${years !== 1 ? 's' : ''}, ${rem} mo`
}

function formatCasualties(low?: number, high?: number): string {
  if (!low && !high) return 'Unknown'
  if (low && high && low !== high) return `${low.toLocaleString()} - ${high.toLocaleString()}`
  return (low || high || 0).toLocaleString()
}

function groupParticipants(participants: ConflictParticipant[]) {
  const sideA: ConflictParticipant[] = []
  const sideB: ConflictParticipant[] = []
  const neutral: ConflictParticipant[] = []
  for (const p of participants) {
    if (p.side === 'side_a') sideA.push(p)
    else if (p.side === 'side_b') sideB.push(p)
    else neutral.push(p)
  }
  return { sideA, sideB, neutral }
}

export default function ConflictDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: conflict, isLoading, error } = useConflict(id || '')

  if (isLoading) {
    return (
      <div style={{ background: '#FFF5F6', minHeight: '100vh' }} className="pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded w-1/3" style={{ background: 'rgba(196, 30, 58, 0.08)' }} />
            <div className="h-4 rounded w-2/3" style={{ background: 'rgba(196, 30, 58, 0.08)' }} />
            <div className="h-4 rounded w-1/2" style={{ background: 'rgba(196, 30, 58, 0.08)' }} />
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 rounded" style={{ background: 'rgba(196, 30, 58, 0.05)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !conflict) {
    return (
      <div style={{ background: '#FFF5F6', minHeight: '100vh' }} className="pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
            Conflict Not Found
          </h1>
          <Link to="/conflicts" className="hover:underline" style={{ color: '#C41E3A' }}>
            Back to Conflicts
          </Link>
        </div>
      </div>
    )
  }

  const { sideA, sideB, neutral } = groupParticipants(conflict.participants || [])
  const typeColor = TYPE_COLORS[conflict.conflict_type] || '#C41E3A'
  const isOngoing = conflict.start_date && !conflict.end_date

  return (
    <div style={{ background: '#FFF5F6', minHeight: '100vh' }} className="pb-12">
      {/* Header Section */}
      <div
        className="py-8 border-b"
        style={{
          background: 'linear-gradient(to right, rgba(196, 30, 58, 0.08), #FFF5F6)',
          borderColor: '#E8C8C8',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm">
            <Link to="/conflicts" className="hover:underline" style={{ color: '#8B7355' }}>Conflicts</Link>
            <span className="mx-2" style={{ color: '#E8C8C8' }}>/</span>
            <span style={{ color: '#2C1810' }}>{conflict.name}</span>
          </nav>

          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#8B1A1A', fontFamily: 'Georgia, serif' }}>
            {conflict.name}
          </h1>

          <div className="flex flex-wrap gap-2 items-center">
            {conflict.conflict_type && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: `${typeColor}15`,
                  color: typeColor,
                  border: `1px solid ${typeColor}40`,
                }}
              >
                {TYPE_LABELS[conflict.conflict_type] || conflict.conflict_type}
              </span>
            )}
            {conflict.intensity && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: '#FFF5F6', color: '#8B7355', border: '1px solid #E8C8C8' }}
              >
                {conflict.intensity}
              </span>
            )}
            {isOngoing && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A', border: '1px solid rgba(196, 30, 58, 0.3)' }}
              >
                Ongoing
              </span>
            )}
            <span className="text-sm" style={{ color: '#5C3D2E' }}>
              {conflict.start_date ? new Date(conflict.start_date).getFullYear() : '?'}
              {conflict.end_date ? ` - ${new Date(conflict.end_date).getFullYear()}` : conflict.start_date ? ' - present' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A' }}>
            <div className="text-xs uppercase font-medium mb-1" style={{ color: '#8B7355' }}>Est. Casualties</div>
            <div className="text-xl font-bold" style={{ color: '#2C1810' }}>
              {formatCasualties(conflict.casualties_low, conflict.casualties_high)}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #D4A017' }}>
            <div className="text-xs uppercase font-medium mb-1" style={{ color: '#8B7355' }}>Duration</div>
            <div className="text-xl font-bold" style={{ color: '#2C1810' }}>
              {computeDuration(conflict.start_date, conflict.end_date)}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #8B1A1A' }}>
            <div className="text-xs uppercase font-medium mb-1" style={{ color: '#8B7355' }}>Participants</div>
            <div className="text-xl font-bold" style={{ color: '#2C1810' }}>
              {conflict.participants?.length || 0}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #5C3D2E' }}>
            <div className="text-xs uppercase font-medium mb-1" style={{ color: '#8B7355' }}>External IDs</div>
            <div className="text-sm font-medium" style={{ color: '#2C1810' }}>
              {[
                conflict.ucdp_id && `UCDP: ${conflict.ucdp_id}`,
                conflict.cow_id && `COW: ${conflict.cow_id}`,
              ].filter(Boolean).join(' / ') || 'None'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants */}
            {(sideA.length > 0 || sideB.length > 0 || neutral.length > 0) && (
              <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  Participants
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Side A */}
                  {sideA.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#C41E3A' }}>
                        Side A
                      </h3>
                      <div className="space-y-2">
                        {sideA.map(p => (
                          <ParticipantCard key={p.id} participant={p} sideColor="#C41E3A" />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Side B */}
                  {sideB.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#D4A017' }}>
                        Side B
                      </h3>
                      <div className="space-y-2">
                        {sideB.map(p => (
                          <ParticipantCard key={p.id} participant={p} sideColor="#D4A017" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Neutral / Mediators */}
                {neutral.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8C8C8' }}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8B7355' }}>
                      Neutral / Mediators
                    </h3>
                    <div className="space-y-2">
                      {neutral.map(p => (
                        <ParticipantCard key={p.id} participant={p} sideColor="#8B7355" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {conflict.description && (
              <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  Description
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  {conflict.description}
                </p>
              </div>
            )}

            {/* Progressive Analysis */}
            {conflict.progressive_analysis && (
              <div className="p-6 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', fontFamily: 'Georgia, serif' }}>
                  Progressive Analysis
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#5C3D2E', fontFamily: 'Georgia, serif' }}>
                  {conflict.progressive_analysis}
                </p>
              </div>
            )}

            {/* Outcome */}
            {conflict.outcome && (
              <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #D4A017' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  Outcome
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  {conflict.outcome}
                </p>
              </div>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Quick Facts</h3>
              <dl className="space-y-3 text-sm">
                {conflict.conflict_type && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>Type</dt>
                    <dd style={{ color: '#2C1810' }}>{TYPE_LABELS[conflict.conflict_type] || conflict.conflict_type}</dd>
                  </div>
                )}
                {conflict.intensity && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>Intensity</dt>
                    <dd className="capitalize" style={{ color: '#2C1810' }}>{conflict.intensity}</dd>
                  </div>
                )}
                <div>
                  <dt style={{ color: '#8B7355' }}>Start Date</dt>
                  <dd style={{ color: '#2C1810' }}>{formatDate(conflict.start_date)}</dd>
                </div>
                {conflict.end_date && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>End Date</dt>
                    <dd style={{ color: '#2C1810' }}>{formatDate(conflict.end_date)}</dd>
                  </div>
                )}
                <div>
                  <dt style={{ color: '#8B7355' }}>Duration</dt>
                  <dd style={{ color: '#2C1810' }}>{computeDuration(conflict.start_date, conflict.end_date)}</dd>
                </div>
                {(conflict.casualties_low || conflict.casualties_high) && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>Estimated Casualties</dt>
                    <dd style={{ color: '#2C1810' }}>{formatCasualties(conflict.casualties_low, conflict.casualties_high)}</dd>
                  </div>
                )}
                {conflict.ucdp_id && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>UCDP ID</dt>
                    <dd style={{ color: '#2C1810' }}>{conflict.ucdp_id}</dd>
                  </div>
                )}
                {conflict.cow_id && (
                  <div>
                    <dt style={{ color: '#8B7355' }}>COW ID</dt>
                    <dd style={{ color: '#2C1810' }}>{conflict.cow_id}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Related Countries */}
            {conflict.participants && conflict.participants.length > 0 && (
              <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Related Countries</h3>
                <div className="space-y-2">
                  {conflict.participants
                    .filter(p => p.country_id && p.country_name)
                    .map(p => (
                      <Link
                        key={p.id}
                        to={`/country/${p.country_id}`}
                        className="flex items-center gap-2 p-2 rounded-lg transition-colors text-sm"
                        style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: p.side === 'side_a' ? '#C41E3A' : p.side === 'side_b' ? '#D4A017' : '#8B7355' }}
                        />
                        <span style={{ color: '#2C1810' }}>{p.country_name}</span>
                        {p.role && (
                          <span className="text-xs ml-auto" style={{ color: '#8B7355' }}>{p.role}</span>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {(conflict.wikidata_id || conflict.ucdp_id) && (
              <div className="p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>External Links</h3>
                <div className="space-y-2 text-sm">
                  {conflict.wikidata_id && (
                    <a
                      href={`https://www.wikidata.org/wiki/${conflict.wikidata_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline"
                      style={{ color: '#C41E3A' }}
                    >
                      View on Wikidata
                    </a>
                  )}
                  {conflict.ucdp_id && (
                    <a
                      href={`https://ucdp.uu.se/conflict/${conflict.ucdp_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline"
                      style={{ color: '#C41E3A' }}
                    >
                      UCDP Database Entry
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ParticipantCard({ participant, sideColor }: { participant: ConflictParticipant; sideColor: string }) {
  const name = participant.country_name || participant.actor_name || 'Unknown'
  const inner = (
    <div
      className="p-3 rounded-lg transition-colors"
      style={{
        background: `${sideColor}08`,
        border: `1px solid ${sideColor}20`,
        borderLeft: `3px solid ${sideColor}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm" style={{ color: '#2C1810' }}>{name}</span>
        {participant.role && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ background: `${sideColor}10`, color: sideColor }}
          >
            {participant.role}
          </span>
        )}
      </div>
      {participant.actor_name && participant.country_name && (
        <div className="text-xs mt-1" style={{ color: '#8B7355' }}>
          {participant.actor_name}
        </div>
      )}
      {participant.casualties != null && participant.casualties > 0 && (
        <div className="text-xs mt-1" style={{ color: '#8B7355' }}>
          Casualties: {participant.casualties.toLocaleString()}
        </div>
      )}
    </div>
  )

  if (participant.country_id) {
    return <Link to={`/country/${participant.country_id}`} className="block">{inner}</Link>
  }
  return inner
}
