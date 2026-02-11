import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ExportFormat = "csv" | "pdf" | "json";
type DataType = "people" | "events" | "books" | "conflicts" | "search";

interface ExportFilters {
  ideology?: string;
  country?: string;
  category?: string;
  yearFrom?: number;
  yearTo?: number;
  searchQuery?: string;
  limit?: number;
}

interface DataExportProps {
  dataType: DataType;
  filters?: ExportFilters;
  buttonText?: string;
  buttonClassName?: string;
}

export default function DataExport({
  dataType,
  filters = {},
  buttonText = "Export",
  buttonClassName = "",
}: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [exportLimit, setExportLimit] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  const buildExportUrl = (format: ExportFormat): string => {
    const params = new URLSearchParams();
    
    if (filters.ideology) params.append("ideology", filters.ideology);
    if (filters.country) params.append("country", filters.country);
    if (filters.category) params.append("category", filters.category);
    if (filters.yearFrom) params.append("year_from", filters.yearFrom.toString());
    if (filters.yearTo) params.append("year_to", filters.yearTo.toString());
    if (filters.searchQuery) params.append("q", filters.searchQuery);
    params.append("limit", exportLimit.toString());

    const baseUrl = `${API_BASE}/export/${dataType}/${format}`;
    return `${baseUrl}?${params.toString()}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const url = buildExportUrl(selectedFormat);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `leftist_monitor_${dataType}_export.${selectedFormat}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const formats: { id: ExportFormat; label: string; description: string; icon: string }[] = [
    { 
      id: "csv", 
      label: "CSV", 
      description: "Spreadsheet format, compatible with Excel",
      icon: "📊"
    },
    { 
      id: "pdf", 
      label: "PDF", 
      description: "Formatted document for printing/sharing",
      icon: "📄"
    },
    { 
      id: "json", 
      label: "JSON", 
      description: "Raw data format for developers",
      icon: "{ }"
    },
  ];

  const dataTypeLabels: Record<DataType, string> = {
    people: "Political Figures",
    events: "Historical Events",
    books: "Books & Literature",
    conflicts: "Armed Conflicts",
    search: "Search Results",
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ${buttonClassName}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {buttonText}
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Export Data</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-4">
                Export {dataTypeLabels[dataType]} data
                {filters.country && ` from ${filters.country}`}
                {filters.ideology && ` (${filters.ideology})`}
              </p>

              {/* Format selection */}
              <div className="space-y-2 mb-6">
                <label className="text-sm text-gray-300 font-medium">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedFormat === format.id
                          ? "border-red-500 bg-red-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-2xl mb-1">{format.icon}</div>
                      <div className="text-sm font-medium text-white">{format.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formats.find(f => f.id === selectedFormat)?.description}
                </p>
              </div>

              {/* Limit selection */}
              <div className="mb-6">
                <label className="text-sm text-gray-300 font-medium block mb-2">
                  Maximum Records
                </label>
                <select
                  value={exportLimit}
                  onChange={(e) => setExportLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={100}>100 records</option>
                  <option value={500}>500 records</option>
                  <option value={1000}>1,000 records</option>
                  <option value={5000}>5,000 records</option>
                  <option value={10000}>10,000 records (max)</option>
                </select>
              </div>

              {/* Active filters display */}
              {Object.keys(filters).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.ideology && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        Ideology: {filters.ideology}
                      </span>
                    )}
                    {filters.country && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        Country: {filters.country}
                      </span>
                    )}
                    {filters.category && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        Category: {filters.category}
                      </span>
                    )}
                    {filters.yearFrom && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        From: {filters.yearFrom}
                      </span>
                    )}
                    {filters.yearTo && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        To: {filters.yearTo}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Quick export buttons for common use cases
export function QuickExportCSV({ dataType, filters }: { dataType: DataType; filters?: ExportFilters }) {
  return (
    <DataExport
      dataType={dataType}
      filters={filters}
      buttonText="CSV"
      buttonClassName="text-sm px-3 py-1"
    />
  );
}

export function QuickExportPDF({ dataType, filters }: { dataType: DataType; filters?: ExportFilters }) {
  return (
    <DataExport
      dataType={dataType}
      filters={{ ...filters }}
      buttonText="PDF"
      buttonClassName="text-sm px-3 py-1"
    />
  );
}
