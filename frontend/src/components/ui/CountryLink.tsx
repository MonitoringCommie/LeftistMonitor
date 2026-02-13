import { Link } from 'react-router-dom'

interface CountryLinkProps {
  countryId?: string
  countryName: string
  className?: string
}

export default function CountryLink({ countryId, countryName, className }: CountryLinkProps) {
  if (!countryId) {
    return <span className={className}>{countryName}</span>
  }

  return (
    <Link
      to={`/country/${countryId}`}
      className={className}
      style={{ color: '#C41E3A', textDecoration: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
    >
      {countryName}
    </Link>
  )
}
