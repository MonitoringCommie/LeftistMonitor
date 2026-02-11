import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type ContributionStatus = 'pending' | 'under_review' | 'needs_revision' | 'approved' | 'rejected' | 'merged';
type ContributionType = 'event' | 'person' | 'location' | 'document' | 'correction' | 'translation';

interface Contribution {
  id: string;
  contribution_type: ContributionType;
  status: ContributionStatus;
  data: Record<string, any>;
  submitted_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  review_notes?: string;
  rejection_reason?: string;
}

interface ContributionStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  merged: number;
  by_type: Record<string, number>;
}

const ContributionsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'stats'>('my');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ContributionType | 'all'>('all');

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setContributions([
        {
          id: '1',
          contribution_type: 'event',
          status: 'pending',
          data: { title: 'Haymarket Affair Anniversary Commemoration', location_name: 'Chicago, USA' },
          submitted_at: '2026-01-15T10:30:00Z',
          updated_at: '2026-01-15T10:30:00Z',
          upvotes: 5,
          downvotes: 0
        },
        {
          id: '2',
          contribution_type: 'person',
          status: 'approved',
          data: { name: 'Lucy Parsons', occupation: ['Labor organizer', 'Anarchist'] },
          submitted_at: '2026-01-10T14:20:00Z',
          updated_at: '2026-01-12T09:15:00Z',
          upvotes: 12,
          downvotes: 1,
          review_notes: 'Excellent documentation with verified sources.'
        },
        {
          id: '3',
          contribution_type: 'correction',
          status: 'needs_revision',
          data: { entity_type: 'event', field_name: 'death_toll', proposed_value: '11' },
          submitted_at: '2026-01-08T16:45:00Z',
          updated_at: '2026-01-11T11:00:00Z',
          upvotes: 2,
          downvotes: 3,
          review_notes: 'Please provide additional primary sources for this claim.'
        },
        {
          id: '4',
          contribution_type: 'location',
          status: 'merged',
          data: { name: 'Wounded Knee Memorial', location_type: 'memorial' },
          submitted_at: '2026-01-05T08:00:00Z',
          updated_at: '2026-01-09T14:30:00Z',
          upvotes: 18,
          downvotes: 0
        },
        {
          id: '5',
          contribution_type: 'translation',
          status: 'rejected',
          data: { target_language: 'es', field_name: 'description' },
          submitted_at: '2026-01-03T12:00:00Z',
          updated_at: '2026-01-04T10:00:00Z',
          upvotes: 0,
          downvotes: 4,
          rejection_reason: 'Translation contains significant errors. Please review and resubmit.'
        }
      ]);

      setStats({
        total: 156,
        pending: 23,
        under_review: 12,
        approved: 45,
        rejected: 18,
        merged: 58,
        by_type: {
          event: 67,
          person: 42,
          location: 21,
          document: 15,
          correction: 8,
          translation: 3
        }
      });

      setLoading(false);
    }, 500);
  }, [activeTab]);

  const getStatusColor = (status: ContributionStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      needs_revision: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      merged: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getTypeIcon = (type: ContributionType) => {
    const icons = {
      event: '📅',
      person: '👤',
      location: '📍',
      document: '📄',
      correction: '✏️',
      translation: '🌐'
    };
    return icons[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredContributions = contributions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all' && c.contribution_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8" style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2C1810' }}>
              Community Contributions
            </h1>
            <p className="mt-1" style={{ color: '#5C3D2E' }}>
              Help document liberation struggles and progressive history
            </p>
          </div>
          <Link
            to="/contribute/new"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <span>+</span>
            <span>New Contribution</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex mb-6" style={{ borderBottom: '1px solid #E8C8C8' }}>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              activeTab === 'my'
                ? 'border-red-500 text-red-600'
                : 'border-transparent hover:opacity-80'
            }`}
            style={activeTab !== 'my' ? { color: '#8B7355' } : {}}
          >
            My Contributions
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              activeTab === 'all'
                ? 'border-red-500 text-red-600'
                : 'border-transparent hover:opacity-80'
            }`}
            style={activeTab !== 'all' ? { color: '#8B7355' } : {}}
          >
            All Contributions
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              activeTab === 'stats'
                ? 'border-red-500 text-red-600'
                : 'border-transparent hover:opacity-80'
            }`}
            style={activeTab !== 'stats' ? { color: '#8B7355' } : {}}
          >
            Statistics
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold" style={{ color: '#2C1810' }}>{stats.total}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Total</div>
              </div>
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Pending</div>
              </div>
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Under Review</div>
              </div>
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Approved</div>
              </div>
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Rejected</div>
              </div>
              <div className="p-4 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
                <div className="text-2xl font-bold text-purple-600">{stats.merged}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>Merged</div>
              </div>
            </div>

            {/* By Type */}
            <div className="p-6 shadow" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>Contributions by Type</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(type as ContributionType)}</span>
                    <span className="capitalize flex-1" style={{ color: '#2C1810' }}>{type}s</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(196, 30, 58, 0.1)' }}>
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-medium" style={{ color: '#2C1810' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contributions List */}
        {(activeTab === 'my' || activeTab === 'all') && (
          <>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="needs_revision">Needs Revision</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="merged">Merged</option>
              </select>

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

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4" style={{ color: '#8B7355' }}>Loading contributions...</p>
              </div>
            ) : filteredContributions.length === 0 ? (
              <div className="text-center py-12 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
                <p className="mb-4" style={{ color: '#8B7355' }}>No contributions found</p>
                <Link
                  to="/contribute/new"
                  className="hover:opacity-80"
                  style={{ color: '#C41E3A' }}
                >
                  Submit your first contribution
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContributions.map(contribution => (
                  <div
                    key={contribution.id}
                    className="shadow p-4 hover:shadow-md transition-shadow"
                    style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getTypeIcon(contribution.contribution_type)}</span>
                        <div>
                          <h3 className="font-semibold" style={{ color: '#2C1810' }}>
                            {contribution.data.title || contribution.data.name || `${contribution.contribution_type} contribution`}
                          </h3>
                          <p className="text-sm" style={{ color: '#8B7355' }}>
                            Submitted {formatDate(contribution.submitted_at)}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contribution.status)}`}>
                        {contribution.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Review notes or rejection reason */}
                    {(contribution.review_notes || contribution.rejection_reason) && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        contribution.rejection_reason
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        <strong>Reviewer notes:</strong> {contribution.rejection_reason || contribution.review_notes}
                      </div>
                    )}

                    {/* Votes and actions */}
                    <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #E8C8C8' }}>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-green-600" style={{ color: '#8B7355' }}>
                          <span>👍</span>
                          <span>{contribution.upvotes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-600" style={{ color: '#8B7355' }}>
                          <span>👎</span>
                          <span>{contribution.downvotes}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/contribute/${contribution.id}`}
                          className="text-sm hover:opacity-80"
                          style={{ color: '#C41E3A' }}
                        >
                          View Details
                        </Link>
                        {contribution.status === 'needs_revision' && (
                          <Link
                            to={`/contribute/${contribution.id}/edit`}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContributionsDashboard;
