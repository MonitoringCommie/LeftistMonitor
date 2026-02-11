import React, { useState } from 'react';

type ContributionType = 'event' | 'person' | 'location' | 'document' | 'correction' | 'translation';
type SourceType = 'academic' | 'news' | 'primary' | 'archive' | 'oral_history' | 'government' | 'ngo' | 'other';

interface Source {
  type: SourceType;
  title: string;
  url?: string;
  author?: string;
  publication_date?: string;
  notes?: string;
}

interface ContributionFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialType?: ContributionType;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit, initialType = 'event' }) => {
  const [contributionType, setContributionType] = useState<ContributionType>(initialType);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sources, setSources] = useState<Source[]>([{ type: 'academic', title: '' }]);
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contributionTypes: { value: ContributionType; label: string; description: string }[] = [
    { value: 'event', label: 'Historical Event', description: 'Protests, massacres, revolutions, strikes, etc.' },
    { value: 'person', label: 'Person', description: 'Activists, leaders, revolutionaries, organizers' },
    { value: 'location', label: 'Location/Site', description: 'Memorials, massacre sites, historical headquarters' },
    { value: 'document', label: 'Document', description: 'Manifestos, letters, pamphlets, treaties' },
    { value: 'correction', label: 'Correction', description: 'Fix errors in existing records' },
    { value: 'translation', label: 'Translation', description: 'Translate content to another language' },
  ];

  const sourceTypes: { value: SourceType; label: string }[] = [
    { value: 'academic', label: 'Academic/Research' },
    { value: 'news', label: 'News Article' },
    { value: 'primary', label: 'Primary Source' },
    { value: 'archive', label: 'Archive' },
    { value: 'oral_history', label: 'Oral History' },
    { value: 'government', label: 'Government Document' },
    { value: 'ngo', label: 'NGO Report' },
    { value: 'other', label: 'Other' },
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSourceChange = (index: number, field: string, value: any) => {
    setSources(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSource = () => {
    setSources(prev => [...prev, { type: 'academic', title: '' }]);
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        contribution_type: contributionType,
        data: formData,
        sources: sources.filter(s => s.title.trim()),
        notes: notes || undefined,
        language,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { border: '1px solid #E8C8C8', color: '#2C1810' };
  const labelStyle = { color: '#2C1810' };

  const renderEventFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Event Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            minLength={5}
            maxLength={500}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-32"
            style={inputStyle}
            required
            minLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Start Date *</label>
          <input
            type="date"
            value={formData.date_start || ''}
            onChange={(e) => handleFieldChange('date_start', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>End Date</label>
          <input
            type="date"
            value={formData.date_end || ''}
            onChange={(e) => handleFieldChange('date_end', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Location Name *</label>
          <input
            type="text"
            value={formData.location_name || ''}
            onChange={(e) => handleFieldChange('location_name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Country Code</label>
          <input
            type="text"
            value={formData.country_code || ''}
            onChange={(e) => handleFieldChange('country_code', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            maxLength={3}
            placeholder="e.g., USA, GBR, DEU"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Latitude</label>
          <input
            type="number"
            step="any"
            value={formData.latitude || ''}
            onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            min={-90}
            max={90}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Longitude</label>
          <input
            type="number"
            step="any"
            value={formData.longitude || ''}
            onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            min={-180}
            max={180}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Death Toll</label>
          <input
            type="number"
            value={formData.death_toll || ''}
            onChange={(e) => handleFieldChange('death_toll', parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Participants</label>
          <input
            type="number"
            value={formData.participants || ''}
            onChange={(e) => handleFieldChange('participants', parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            min={0}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Categories (comma-separated)</label>
          <input
            type="text"
            value={(formData.categories || []).join(', ')}
            onChange={(e) => handleFieldChange('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            placeholder="e.g., protest, labor, anti-colonial"
          />
        </div>
      </div>
    </>
  );

  const renderPersonFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Full Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Birth Date</label>
          <input
            type="date"
            value={formData.birth_date || ''}
            onChange={(e) => handleFieldChange('birth_date', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Death Date</label>
          <input
            type="date"
            value={formData.death_date || ''}
            onChange={(e) => handleFieldChange('death_date', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Birth Place</label>
          <input
            type="text"
            value={formData.birth_place || ''}
            onChange={(e) => handleFieldChange('birth_place', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Nationality</label>
          <input
            type="text"
            value={formData.nationality || ''}
            onChange={(e) => handleFieldChange('nationality', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Occupations (comma-separated)</label>
          <input
            type="text"
            value={(formData.occupation || []).join(', ')}
            onChange={(e) => handleFieldChange('occupation', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            placeholder="e.g., activist, writer, organizer"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Organizations (comma-separated)</label>
          <input
            type="text"
            value={(formData.organizations || []).join(', ')}
            onChange={(e) => handleFieldChange('organizations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Biography *</label>
          <textarea
            value={formData.biography || ''}
            onChange={(e) => handleFieldChange('biography', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-48"
            style={inputStyle}
            required
            minLength={50}
          />
        </div>
      </div>
    </>
  );

  const renderLocationFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Location Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-32"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Latitude *</label>
          <input
            type="number"
            step="any"
            value={formData.latitude || ''}
            onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            min={-90}
            max={90}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Longitude *</label>
          <input
            type="number"
            step="any"
            value={formData.longitude || ''}
            onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            min={-180}
            max={180}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Country Code *</label>
          <input
            type="text"
            value={formData.country_code || ''}
            onChange={(e) => handleFieldChange('country_code', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            maxLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Location Type *</label>
          <select
            value={formData.location_type || ''}
            onChange={(e) => handleFieldChange('location_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="">Select type...</option>
            <option value="memorial">Memorial</option>
            <option value="massacre_site">Massacre Site</option>
            <option value="prison">Prison/Detention Center</option>
            <option value="headquarters">Historical Headquarters</option>
            <option value="battlefield">Battlefield</option>
            <option value="burial_site">Burial Site</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderDocumentFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Document Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Document Type *</label>
          <select
            value={formData.document_type || ''}
            onChange={(e) => handleFieldChange('document_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="">Select type...</option>
            <option value="manifesto">Manifesto</option>
            <option value="letter">Letter</option>
            <option value="pamphlet">Pamphlet</option>
            <option value="treaty">Treaty</option>
            <option value="speech">Speech</option>
            <option value="declaration">Declaration</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Author</label>
          <input
            type="text"
            value={formData.author || ''}
            onChange={(e) => handleFieldChange('author', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Date Created</label>
          <input
            type="date"
            value={formData.date_created || ''}
            onChange={(e) => handleFieldChange('date_created', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Language</label>
          <input
            type="text"
            value={formData.language || 'en'}
            onChange={(e) => handleFieldChange('language', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            maxLength={5}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-24"
            style={inputStyle}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Full Text / Transcription</label>
          <textarea
            value={formData.full_text || ''}
            onChange={(e) => handleFieldChange('full_text', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-48 font-mono text-sm"
            style={inputStyle}
          />
        </div>
      </div>
    </>
  );

  const renderCorrectionFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Entity Type *</label>
          <select
            value={formData.entity_type || ''}
            onChange={(e) => handleFieldChange('entity_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="">Select type...</option>
            <option value="event">Event</option>
            <option value="person">Person</option>
            <option value="location">Location</option>
            <option value="document">Document</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Entity ID *</label>
          <input
            type="text"
            value={formData.entity_id || ''}
            onChange={(e) => handleFieldChange('entity_id', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            placeholder="UUID of the record to correct"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Field Name *</label>
          <input
            type="text"
            value={formData.field_name || ''}
            onChange={(e) => handleFieldChange('field_name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            placeholder="e.g., death_date, location_name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Current Value *</label>
          <input
            type="text"
            value={formData.current_value || ''}
            onChange={(e) => handleFieldChange('current_value', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Proposed Value *</label>
          <input
            type="text"
            value={formData.proposed_value || ''}
            onChange={(e) => handleFieldChange('proposed_value', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Reason for Correction *</label>
          <textarea
            value={formData.reason || ''}
            onChange={(e) => handleFieldChange('reason', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-24"
            style={inputStyle}
            required
            minLength={10}
          />
        </div>
      </div>
    </>
  );

  const renderTranslationFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Entity Type *</label>
          <select
            value={formData.entity_type || ''}
            onChange={(e) => handleFieldChange('entity_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="">Select type...</option>
            <option value="event">Event</option>
            <option value="person">Person</option>
            <option value="location">Location</option>
            <option value="document">Document</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Entity ID *</label>
          <input
            type="text"
            value={formData.entity_id || ''}
            onChange={(e) => handleFieldChange('entity_id', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Target Language *</label>
          <select
            value={formData.target_language || ''}
            onChange={(e) => handleFieldChange('target_language', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="">Select language...</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="pt">Portuguese</option>
            <option value="ar">Arabic</option>
            <option value="zh">Chinese</option>
            <option value="de">German</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Field Name *</label>
          <input
            type="text"
            value={formData.field_name || ''}
            onChange={(e) => handleFieldChange('field_name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={inputStyle}
            required
            placeholder="e.g., description, biography"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Translated Text *</label>
          <textarea
            value={formData.translated_text || ''}
            onChange={(e) => handleFieldChange('translated_text', e.target.value)}
            className="w-full px-3 py-2 rounded-lg h-48"
            style={inputStyle}
            required
          />
        </div>
      </div>
    </>
  );

  const renderFormFields = () => {
    switch (contributionType) {
      case 'event': return renderEventFields();
      case 'person': return renderPersonFields();
      case 'location': return renderLocationFields();
      case 'document': return renderDocumentFields();
      case 'correction': return renderCorrectionFields();
      case 'translation': return renderTranslationFields();
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Contribution Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Contribution Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contributionTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setContributionType(type.value);
                setFormData({});
              }}
              className={`p-3 rounded-lg text-left transition-colors ${
                contributionType === type.value
                  ? 'border-red-500'
                  : ''
              }`}
              style={contributionType === type.value
                ? { border: '2px solid #C41E3A', background: 'rgba(196, 30, 58, 0.06)' }
                : { border: '1px solid #E8C8C8', background: '#FFFFFF' }
              }
            >
              <div className="font-medium" style={{ color: '#2C1810' }}>{type.label}</div>
              <div className="text-xs mt-1" style={{ color: '#8B7355' }}>{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <div className="p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
        <h3 className="font-medium mb-4" style={{ color: '#2C1810' }}>{contributionTypes.find(t => t.value === contributionType)?.label} Details</h3>
        {renderFormFields()}
      </div>

      {/* Sources Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium" style={labelStyle}>Sources (at least one required)</label>
          <button
            type="button"
            onClick={addSource}
            className="text-sm hover:opacity-80"
            style={{ color: '#C41E3A' }}
          >
            + Add Source
          </button>
        </div>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: '#2C1810' }}>Source {index + 1}</span>
                {sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSource(index)}
                    className="text-sm hover:opacity-80"
                    style={{ color: '#C41E3A' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={labelStyle}>Source Type *</label>
                  <select
                    value={source.type}
                    onChange={(e) => handleSourceChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={inputStyle}
                  >
                    {sourceTypes.map(st => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={labelStyle}>Title *</label>
                  <input
                    type="text"
                    value={source.title}
                    onChange={(e) => handleSourceChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1" style={labelStyle}>URL</label>
                  <input
                    type="url"
                    value={source.url || ''}
                    onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1" style={labelStyle}>Author</label>
                  <input
                    type="text"
                    value={source.author || ''}
                    onChange={(e) => handleSourceChange(index, 'author', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-lg h-24"
          style={inputStyle}
          placeholder="Any additional context or notes for reviewers..."
        />
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Content Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg"
          style={inputStyle}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="pt">Portuguese</option>
          <option value="ar">Arabic</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A', border: '1px solid rgba(196, 30, 58, 0.2)' }}>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            setFormData({});
            setSources([{ type: 'academic', title: '' }]);
            setNotes('');
          }}
          className="px-4 py-2 rounded-lg hover:opacity-80"
          style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
        >
          Clear Form
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;
