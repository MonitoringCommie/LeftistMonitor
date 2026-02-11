import React, { useState, useEffect } from 'react';

type ContributionStatus = 'pending' | 'under_review' | 'needs_revision' | 'approved' | 'rejected' | 'merged';
type ContributionType = 'event' | 'person' | 'location' | 'document' | 'correction' | 'translation';

interface Source {
  type: string;
  title: string;
  url?: string;
  author?: string;
}

interface Contribution {
  id: string;
  contribution_type: ContributionType;
  status: ContributionStatus;
  data: Record<string, any>;
  sources: Source[];
  notes?: string;
  language: string;
  submitted_by: { id: string; username: string; reputation: number };
  submitted_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
}

interface ReviewModalProps {
  contribution: Contribution;
  onClose: () => void;
  onAction: (action: ContributionStatus, notes?: string, rejectionReason?: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ contribution, onClose, onAction }) => {
  const [action, setAction] = useState<ContributionStatus>('under_review');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    onAction(action, notes, action === 'rejected' ? rejectionReason : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
        <div className="p-6" style={{ borderBottom: '1px solid #E8C8C8' }}>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Review Contribution</h2>
            <button
              onClick={onClose}
              className="hover:opacity-70"
              style={{ color: '#8B7355' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Contribution Details */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
            <h3 className="font-medium mb-2" style={{ color: '#2C1810' }}>
              {contribution.data.title || contribution.data.name}
            </h3>
            <p className="text-sm mb-2" style={{ color: '#5C3D2E' }}>
              Type: {contribution.contribution_type} | Language: {contribution.language}
            </p>
            <p className="text-sm" style={{ color: '#2C1810' }}>
              {contribution.data.description || contribution.data.biography || JSON.stringify(contribution.data, null, 2)}
            </p>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#2C1810' }}>Sources ({contribution.sources.length})</h4>
            <div className="space-y-2">
              {contribution.sources.map((source, i) => (
                <div key={i} className="p-3 rounded text-sm" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
                  <div className="font-medium" style={{ color: '#2C1810' }}>{source.title}</div>
                  <div style={{ color: '#8B7355' }}>{source.type} {source.author && `by ${source.author}`}</div>
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                       className="hover:underline break-all" style={{ color: '#C41E3A' }}>
                      {source.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submitter Info */}
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: '#8B7355' }}>Submitted by:</span>
            <span className="font-medium" style={{ color: '#2C1810' }}>{contribution.submitted_by.username}</span>
            <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
              Rep: {contribution.submitted_by.reputation}
            </span>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#2C1810' }}>Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as ContributionStatus)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
            >
              <option value="under_review">Mark as Under Review</option>
              <option value="needs_revision">Request Revision</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#2C1810' }}>Review Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg h-24"
              style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              placeholder="Notes for the contributor (visible to them)..."
            />
          </div>

          {/* Rejection Reason (if rejecting) */}
          {action === 'rejected' && (
            <div>
              <label className="block font-medium mb-2 text-red-600">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg h-24"
                style={{ color: '#2C1810' }}
                placeholder="Explain why this contribution is being rejected..."
                required
              />
            </div>
          )}
        </div>

        <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid #E8C8C8' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:opacity-80"
            style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={action === 'rejected' && !rejectionReason}
            className={`px-4 py-2 rounded-lg text-white ${
              action === 'rejected'
                ? 'bg-red-600 hover:bg-red-700'
                : action === 'approved'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

const ModerationDashboard: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [filter, setFilter] = useState<'pending' | 'under_review' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<ContributionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'date' | 'reputation'>('votes');

  useEffect(() => {
    setLoading(true);
    // Mock data - in production would fetch from API
    setTimeout(() => {
      setContributions([
        {
          id: '1',
          contribution_type: 'event',
          status: 'pending',
          data: {
            title: 'Battle of Blair Mountain',
            description: 'One of the largest labor uprisings in US history. Approximately 10,000 armed coal miners confronted 3,000 lawmen and strikebreakers in Logan County, West Virginia.',
            date_start: '1921-08-25',
            date_end: '1921-09-02',
            location_name: 'Logan County, West Virginia',
            latitude: 37.8485,
            longitude: -81.9932,
            country_code: 'USA',
            death_toll: 100,
            participants: 10000
          },
          sources: [
            { type: 'academic', title: 'The Battle of Blair Mountain', author: 'Robert Shogan', url: 'https://example.com/book1' },
            { type: 'primary', title: 'New York Times Archives - Sept 1921' }
          ],
          notes: 'Important event in US labor history that should be included.',
          language: 'en',
          submitted_by: { id: 'u1', username: 'laborhistorian', reputation: 450 },
          submitted_at: '2026-01-28T14:30:00Z',
          updated_at: '2026-01-28T14:30:00Z',
          upvotes: 15,
          downvotes: 0
        },
        {
          id: '2',
          contribution_type: 'person',
          status: 'pending',
          data: {
            name: 'Mother Jones (Mary Harris Jones)',
            birth_date: '1837-08-01',
            death_date: '1930-11-30',
            birth_place: 'Cork, Ireland',
            nationality: 'Irish-American',
            occupation: ['Labor organizer', 'Union activist'],
            organizations: ['United Mine Workers', 'Industrial Workers of the World'],
            biography: 'Mary Harris Jones, known as Mother Jones, was an Irish-born American schoolteacher and dressmaker who became a prominent labor and community organizer.'
          },
          sources: [
            { type: 'academic', title: 'Mother Jones: The Most Dangerous Woman in America', author: 'Elliott J. Gorn' }
          ],
          language: 'en',
          submitted_by: { id: 'u2', username: 'historybuff22', reputation: 280 },
          submitted_at: '2026-01-27T09:15:00Z',
          updated_at: '2026-01-27T09:15:00Z',
          upvotes: 8,
          downvotes: 1
        },
        {
          id: '3',
          contribution_type: 'correction',
          status: 'under_review',
          data: {
            entity_type: 'event',
            entity_id: 'evt-123',
            field_name: 'death_toll',
            current_value: '4',
            proposed_value: '7',
            reason: 'Recent historical research has uncovered additional victims of the Ludlow Massacre. The corrected death toll includes three additional miners who died from injuries in the following days.'
          },
          sources: [
            { type: 'academic', title: 'Revisiting Ludlow: New Evidence', url: 'https://example.com/paper' }
          ],
          language: 'en',
          submitted_by: { id: 'u3', username: 'mininghistory', reputation: 720 },
          submitted_at: '2026-01-25T11:00:00Z',
          updated_at: '2026-01-26T08:30:00Z',
          upvotes: 22,
          downvotes: 3
        },
        {
          id: '4',
          contribution_type: 'location',
          status: 'pending',
          data: {
            name: 'Pullman Strike Memorial',
            description: 'Memorial commemorating the 1894 Pullman Strike, a nationwide railroad strike that was a turning point in American labor history.',
            latitude: 41.6928,
            longitude: -87.6089,
            country_code: 'USA',
            location_type: 'memorial',
            date_established: '1998-01-01'
          },
          sources: [
            { type: 'government', title: 'National Park Service - Pullman National Historical Park' }
          ],
          language: 'en',
          submitted_by: { id: 'u4', username: 'chicagolocal', reputation: 150 },
          submitted_at: '2026-01-29T16:45:00Z',
          updated_at: '2026-01-29T16:45:00Z',
          upvotes: 4,
          downvotes: 0
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleReviewAction = (
    contributionId: string,
    newStatus: ContributionStatus,
    notes?: string,
    rejectionReason?: string
  ) => {
    setContributions(prev => prev.map(c => {
      if (c.id === contributionId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
    setSelectedContribution(null);
    // In production, would call API to update status
    console.log('Review submitted:', { contributionId, newStatus, notes, rejectionReason });
  };

  const filteredContributions = contributions
    .filter(c => {
      if (filter === 'all') return true;
      return c.status === filter;
    })
    .filter(c => {
      if (typeFilter === 'all') return true;
      return c.contribution_type === typeFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (sortBy === 'reputation') {
        return b.submitted_by.reputation - a.submitted_by.reputation;
      }
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });

  const getTypeIcon = (type: ContributionType) => {
    const icons = {
      event: '📅', person: '👤', location: '📍',
      document: '📄', correction: '✏️', translation: '🌐'
    };
    return icons[type];
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      needs_revision: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      merged: 'bg-purple-100 text-purple-800'
    };
    return styles[status];
  };

  const pendingCount = contributions.filter(c => c.status === 'pending').length;
  const reviewingCount = contributions.filter(c => c.status === 'under_review').length;

  return (
    <div className="min-h-screen py-8" style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2C1810' }}>
            Moderation Dashboard
          </h1>
          <p className="mt-1" style={{ color: '#5C3D2E' }}>
            Review and approve community contributions
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Pending Review</div>
          </div>
          <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="text-2xl font-bold text-blue-600">{reviewingCount}</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Under Review</div>
          </div>
          <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="text-2xl font-bold text-green-600">
              {contributions.filter(c => c.status === 'approved').length}
            </div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Approved Today</div>
          </div>
          <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="text-2xl font-bold" style={{ color: '#5C3D2E' }}>
              {contributions.length}
            </div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Total Queue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 shadow mb-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="all">All</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Types</option>
                <option value="event">Events</option>
                <option value="person">People</option>
                <option value="location">Locations</option>
                <option value="document">Documents</option>
                <option value="correction">Corrections</option>
                <option value="translation">Translations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="votes">Community Votes</option>
                <option value="date">Submission Date</option>
                <option value="reputation">Submitter Reputation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contributions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4" style={{ color: '#8B7355' }}>Loading contributions...</p>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
            <p style={{ color: '#8B7355' }}>No contributions to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContributions.map(contribution => (
              <div
                key={contribution.id}
                className="shadow hover:shadow-md transition-shadow"
                style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(contribution.contribution_type)}</span>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#2C1810' }}>
                          {contribution.data.title || contribution.data.name || `${contribution.contribution_type} contribution`}
                        </h3>
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#8B7355' }}>
                          {contribution.data.description || contribution.data.biography || contribution.data.reason}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contribution.status)}`}>
                      {contribution.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 mt-4 text-sm" style={{ color: '#8B7355' }}>
                    <span>
                      By <strong style={{ color: '#2C1810' }}>{contribution.submitted_by.username}</strong>
                      <span className="ml-1 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
                        {contribution.submitted_by.reputation} rep
                      </span>
                    </span>
                    <span>•</span>
                    <span>{contribution.sources.length} source(s)</span>
                    <span>•</span>
                    <span>
                      👍 {contribution.upvotes} / 👎 {contribution.downvotes}
                    </span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-3 rounded-b-lg flex justify-between items-center" style={{ background: 'rgba(196, 30, 58, 0.04)', borderTop: '1px solid #E8C8C8' }}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedContribution(contribution)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleReviewAction(contribution.id, 'approved')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Quick Approve
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewAction(contribution.id, 'needs_revision', 'Please provide additional sources.')}
                      className="px-3 py-1.5 border border-orange-500 text-orange-600 rounded text-sm hover:bg-orange-50"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleReviewAction(contribution.id, 'rejected', undefined, 'Does not meet contribution guidelines.')}
                      className="px-3 py-1.5 border border-red-500 text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedContribution && (
          <ReviewModal
            contribution={selectedContribution}
            onClose={() => setSelectedContribution(null)}
            onAction={(action, notes, rejectionReason) =>
              handleReviewAction(selectedContribution.id, action, notes, rejectionReason)
            }
          />
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard;
