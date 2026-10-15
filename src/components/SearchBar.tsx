// Search box. Controlled: the text lives in the URL (?q=), read by PokemonListPage and passed in via props.

interface SearchBarProps {
  value: string
  onChange: (text: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="search"
      className="search-bar"
      placeholder="Search Pokémon by name..."
      aria-label="Search Pokémon by name"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
