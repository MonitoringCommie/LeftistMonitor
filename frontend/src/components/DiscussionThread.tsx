import React, { useState } from 'react';

interface Author {
  id: string;
  username: string;
  avatar_url?: string;
  reputation: number;
  role: string;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  depth: number;
  upvotes: number;
  downvotes: number;
  user_vote?: number;
  is_edited: boolean;
  replies: Comment[];
}

interface DiscussionThreadProps {
  entityType: string;
  entityId: string;
  entityTitle: string;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  entityTitle
}) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'This is a fascinating piece of history. I had no idea about the scale of resistance during this period.',
      author: { id: 'u1', username: 'historybuff', reputation: 350, role: 'member' },
      created_at: '2026-01-30T14:30:00Z',
      updated_at: '2026-01-30T14:30:00Z',
      depth: 0,
      upvotes: 12,
      downvotes: 1,
      is_edited: false,
      replies: [
        {
          id: '2',
          content: 'Agreed! The primary sources linked in the references section are particularly valuable.',
          author: { id: 'u2', username: 'archivist_anna', reputation: 720, role: 'contributor' },
          created_at: '2026-01-30T15:45:00Z',
          updated_at: '2026-01-30T15:45:00Z',
          parent_id: '1',
          depth: 1,
          upvotes: 5,
          downvotes: 0,
          is_edited: false,
          replies: []
        }
      ]
    },
    {
      id: '3',
      content: 'Does anyone have additional sources about the international solidarity movements that emerged in response?',
      author: { id: 'u3', username: 'researcher_k', reputation: 180, role: 'member' },
      created_at: '2026-01-30T18:00:00Z',
      updated_at: '2026-01-30T18:00:00Z',
      depth: 0,
      upvotes: 8,
      downvotes: 0,
      is_edited: false,
      replies: []
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleVote = (commentId: string, vote: number) => {
    setComments(prev => {
      const updateVotes = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === commentId) {
            const prevVote = c.user_vote || 0;
            const newVote = prevVote === vote ? 0 : vote;
            return {
              ...c,
              upvotes: c.upvotes - (prevVote === 1 ? 1 : 0) + (newVote === 1 ? 1 : 0),
              downvotes: c.downvotes - (prevVote === -1 ? 1 : 0) + (newVote === -1 ? 1 : 0),
              user_vote: newVote
            };
          }
          return { ...c, replies: updateVotes(c.replies) };
        });
      };
      return updateVotes(prev);
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: { id: 'current', username: 'you', reputation: 100, role: 'member' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      depth: 0,
      upvotes: 0,
      downvotes: 0,
      is_edited: false,
      replies: []
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const reply: Comment = {
      id: Date.now().toString(),
      content: replyContent,
      author: { id: 'current', username: 'you', reputation: 100, role: 'member' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: parentId,
      depth: 1,
      upvotes: 0,
      downvotes: 0,
      is_edited: false,
      replies: []
    };
    
    setComments(prev => {
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: [...c.replies, reply] };
          }
          return { ...c, replies: addReply(c.replies) };
        });
      };
      return addReply(prev);
    });
    
    setReplyContent('');
    setReplyingTo(null);
    setIsSubmitting(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      admin: { label: 'Admin', className: 'bg-red-100 text-red-800' },
      moderator: { label: 'Mod', className: 'bg-purple-100 text-purple-800' },
      contributor: { label: 'Contributor', className: 'bg-blue-100 text-blue-800' }
    };
    return badges[role];
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className={`${comment.depth > 0 ? 'ml-8 border-l-2 pl-4' : ''}`} style={comment.depth > 0 ? { borderColor: '#E8C8C8' } : undefined}>
      <div className="rounded-lg p-4 mb-3" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8' }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#5C3D2E' }}>
            {comment.author.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: '#2C1810' }}>
                {comment.author.username}
              </span>
              {getRoleBadge(comment.author.role) && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${getRoleBadge(comment.author.role)?.className}`}>
                  {getRoleBadge(comment.author.role)?.label}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {comment.author.reputation} rep
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
              {comment.is_edited && ' (edited)'}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="mb-3 whitespace-pre-wrap" style={{ color: '#5C3D2E' }}>
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(comment.id, 1)}
              className={`p-1 rounded hover:bg-gray-100 ${
                comment.user_vote === 1 ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              ▲
            </button>
            <span className={`font-medium ${
              (comment.upvotes - comment.downvotes) > 0 ? 'text-green-600' :
              (comment.upvotes - comment.downvotes) < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {comment.upvotes - comment.downvotes}
            </span>
            <button
              onClick={() => handleVote(comment.id, -1)}
              className={`p-1 rounded hover:bg-gray-100 ${
                comment.user_vote === -1 ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              ▼
            </button>
          </div>
          
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-gray-500 hover:text-gray-700 hover:text-gray-700"
          >
            Reply
          </button>
          
          <button className="text-gray-500 hover:text-gray-700 hover:text-gray-700">
            Share
          </button>
          
          <button className="text-gray-500 hover:text-red-600">
            Flag
          </button>
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8C8C8' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: '#E8C8C8' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#2C1810' }}>
          Discussion
        </h3>
        <p className="text-sm text-gray-500">
          {comments.length} comments on {entityTitle}
        </p>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="p-4 rounded-lg" style={{ background: '#FFF5F6', border: '1px solid #E8C8C8' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts, questions, or additional information..."
          className="w-full px-3 py-2 rounded-lg h-24"
          style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">
            Be respectful and cite sources when possible
          </p>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default DiscussionThread;
