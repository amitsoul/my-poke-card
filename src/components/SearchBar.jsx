// Search box. Controlled: the text lives in App and comes in via props.

export default function SearchBar({ value, onChange }) {
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
