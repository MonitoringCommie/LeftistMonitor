import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContributionForm from './ContributionForm';

const NewContributionPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    // In production, this would call the API
    console.log('Submitting contribution:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response
    const mockId = 'new-' + Date.now();
    setSubmittedId(mockId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12" style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="shadow-lg p-8 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#2C1810' }}>
              Contribution Submitted!
            </h1>
            <p className="mb-6" style={{ color: '#5C3D2E' }}>
              Thank you for contributing to our collective history. Your submission will be
              reviewed by our community moderators.
            </p>

            <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
              <p className="text-sm" style={{ color: '#8B7355' }}>Contribution ID</p>
              <p className="font-mono text-sm" style={{ color: '#2C1810' }}>{submittedId}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedId(null);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Another Contribution
              </button>
              <button
                onClick={() => navigate('/contributions')}
                className="w-full px-4 py-2 rounded-lg hover:opacity-80"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                View My Contributions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2C1810' }}>
            Submit a Contribution
          </h1>
          <p className="mt-2" style={{ color: '#5C3D2E' }}>
            Help document liberation struggles, progressive movements, and people's history.
            All contributions require at least one verifiable source.
          </p>
        </div>

        {/* Guidelines */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(196, 30, 58, 0.06)', border: '1px solid rgba(196, 30, 58, 0.2)' }}>
          <h3 className="font-medium mb-2" style={{ color: '#C41E3A' }}>
            Contribution Guidelines
          </h3>
          <ul className="text-sm space-y-1" style={{ color: '#8B1A1A' }}>
            <li>• Provide accurate, verifiable information with reliable sources</li>
            <li>• Include dates, locations, and relevant context</li>
            <li>• Be respectful and factual in descriptions</li>
            <li>• Avoid unverified claims or speculation</li>
            <li>• Cite primary sources when possible</li>
          </ul>
        </div>

        {/* Form */}
        <div className="shadow-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <ContributionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default NewContributionPage;
