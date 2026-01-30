import { useState, useMemo } from "react"
import { usePolicies, usePolicyTopics } from "../../api/policies"

interface PoliciesTabProps {
  countryId: string
  year: number
}

const POLICY_TYPES = [
  { value: "", label: "All Types" },
  { value: "law", label: "Laws" },
  { value: "regulation", label: "Regulations" },
  { value: "treaty", label: "Treaties" },
  { value: "constitutional_amendment", label: "Constitutional" },
  { value: "executive_order", label: "Executive Orders" },
]

const STATUS_COLORS: Record<string, string> = {
  enacted: "bg-green-100 text-green-800",
  passed: "bg-blue-100 text-blue-800",
  proposed: "bg-yellow-100 text-yellow-800",
  repealed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
}

function getProgressiveColor(score: number | undefined): string {
  if (score === undefined) return "bg-gray-200"
  if (score >= 50) return "bg-green-500"
  if (score >= 20) return "bg-green-300"
  if (score >= -20) return "bg-yellow-300"
  if (score >= -50) return "bg-orange-400"
  return "bg-red-500"
}

export default function PoliciesTab({ countryId, year }: PoliciesTabProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [filterYear, setFilterYear] = useState<boolean>(false)

  const { data: topics } = usePolicyTopics()
  const { data: policiesData, isLoading } = usePolicies(countryId, {
    topicId: selectedTopicId || undefined,
    policyType: selectedType || undefined,
    year: filterYear ? year : undefined,
  })

  const policies = policiesData?.items || []

  // Group topics by parent
  const topicTree = useMemo(() => {
    if (!topics) return []
    const parents = topics.filter((t) => !t.parent_id)
    return parents.map((parent) => ({
      ...parent,
      children: topics.filter((t) => t.parent_id === parent.id),
    }))
  }, [topics])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          {/* Topic filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Topics</option>
              {topicTree.map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (all)</option>
                  {parent.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POLICY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filterYear}
                onChange={(e) => setFilterYear(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{year} only</span>
            </label>
          </div>
        </div>

        {/* Topic chips for quick filtering */}
        {topicTree.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {topicTree.map((topic) => (
              <button
                key={topic.id}
                onClick={() =>
                  setSelectedTopicId(selectedTopicId === topic.id ? "" : topic.id)
                }
                className={"px-3 py-1 text-xs rounded-full transition-colors " +
                  (selectedTopicId === topic.id
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")}
                style={
                  selectedTopicId === topic.id && topic.color
                    ? { backgroundColor: topic.color }
                    : undefined
                }
              >
                {topic.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Policies list */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading policies...</div>
      ) : policies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No policies found. Policies can be added manually or imported from external sources.
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{policy.title}</h3>
                  {policy.summary && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {policy.summary}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {policy.topics.map((topic) => (
                      <span
                        key={topic.id}
                        className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                        style={topic.color ? { backgroundColor: topic.color + "20", color: topic.color } : undefined}
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span
                    className={"px-2 py-0.5 text-xs rounded-full " + STATUS_COLORS[policy.status]}
                  >
                    {policy.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(policy.date_enacted)}
                  </span>
                  {policy.progressive_score !== undefined && (
                    <div className="flex items-center gap-1">
                      <div
                        className={"w-3 h-3 rounded-full " + getProgressiveColor(policy.progressive_score)}
                      />
                      <span className="text-xs text-gray-500">
                        {policy.progressive_score > 0 ? "+" : ""}{policy.progressive_score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
