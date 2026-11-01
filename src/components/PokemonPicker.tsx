// The Create page's "Your favorite Pokémon" field: type part of a name and pick a Pokémon from the matches.
// Built on the WAI-ARIA "combobox" pattern (a text input that controls a list of options):
// - the input has role="combobox" and says whether the list is open (aria-expanded) and which option is active
//   (aria-activedescendant) — the focus itself stays in the input the whole time;
// - the list has role="listbox", each match role="option";
// - keyboard: ↓/↑ move through the matches, Enter picks, Escape closes the list; mouse or finger: tap a match.
// The names come from the shared, cached loader (usePokemonList); the search is in src/utils/pokemonSearch.ts.
import { useId, useState, type KeyboardEvent, type Ref } from 'react'
import { usePokemonList } from '../hooks/usePokemonList.ts'
import type { PokemonSummary } from '../types/pokemon.ts'
import { getSpriteUrl } from '../utils/api.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import { findExactPokemon, findPokemonMatches } from '../utils/pokemonSearch.ts'

interface PokemonPickerProps {
  label: string
  selected: PokemonSummary | null // the picked Pokémon (the page/form keeps it)
  onSelect: (pokemon: PokemonSummary | null) => void // null: the text was changed, so nothing is picked any more
  onTextChange?: (text: string) => void // the typed text (the form uses it to choose its error message)
  error: string | undefined // shown only when the form decides to show it
  // Called after leaving the field, with the Pokémon picked by then (an exact name counts) — the `selected` prop
  // still has the old value at that moment, so the form checks this one
  onBlur?: (picked: PokemonSummary | null) => void
  inputRef?: Ref<HTMLInputElement> // lets the form move focus here
}

// What the user typed — remembered together with the Pokémon it belongs to. When the picked Pokémon changes
// from outside (e.g. the page opens with Pikachu), the field shows that Pokémon's name instead.
interface TypedText {
  forId: number | null
  text: string
}

export default function PokemonPicker({
  label,
  selected,
  onSelect,
  onTextChange,
  error,
  onBlur,
  inputRef,
}: PokemonPickerProps) {
  const id = useId()
  const listId = `${id}-list`
  const statusId = `${id}-status`
  const errorId = `${id}-error`
  const { state: listState, retry } = usePokemonList()
  const [typed, setTyped] = useState<TypedText | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1) // the match ↓/↑ moved to (-1: none)

  const selectedId = selected === null ? null : selected.id
  const text =
    typed !== null && typed.forId === selectedId ? typed.text : selected === null ? '' : formatPokemonName(selected.name)
  const list = listState.status === 'ready' ? listState.list : []
  const matches = findPokemonMatches(list, text)
  const isListShown = isOpen && matches.length > 0
  const activeOption = isListShown && activeIndex >= 0 ? matches[activeIndex] : undefined

  function pick(pokemon: PokemonSummary) {
    setTyped({ forId: pokemon.id, text: formatPokemonName(pokemon.name) })
    setIsOpen(false)
    setActiveIndex(-1)
    onSelect(pokemon)
    onTextChange?.(formatPokemonName(pokemon.name))
  }

  function handleChange(nextText: string) {
    setTyped({ forId: null, text: nextText })
    setIsOpen(true)
    setActiveIndex(-1)
    if (selected !== null) onSelect(null) // the text no longer matches the pick
    onTextChange?.(nextText)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault() // the arrows move through the matches, not the text cursor
      if (matches.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setIsOpen(true)
      // From "none", ↓ goes to the first match and ↑ to the last; at the ends it wraps around
      setActiveIndex((current) => {
        if (!isListShown || current === -1) return step === 1 ? 0 : matches.length - 1
        return (current + step + matches.length) % matches.length
      })
    } else if (event.key === 'Enter' && activeOption !== undefined) {
      event.preventDefault() // picking, not sending the form
      pick(activeOption)
    } else if (event.key === 'Escape' && isListShown) {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // Leaving the field: close the list; an exact name ("pikachu") counts as picked
  function handleBlur() {
    setIsOpen(false)
    setActiveIndex(-1)
    let picked = selected
    if (selected === null) {
      picked = findExactPokemon(list, text)
      if (picked !== null) pick(picked)
    }
    onBlur?.(picked)
  }

  // What the live region says: loading, a load error, or how many matches there are (for screen readers)
  let status = ''
  if (listState.status === 'loading') status = 'Loading Pokémon names...'
  else if (listState.status === 'error') status = "Sorry, the Pokémon names couldn't be loaded."
  else if (isOpen && text.trim() !== '' && matches.length === 0) status = 'No Pokémon found'
  const matchCount = isListShown ? `${matches.length} Pokémon found` : '' // "Pokémon" is both singular and plural

  const describedBy = [statusId, error !== undefined ? errorId : null].filter((part) => part !== null).join(' ')

  return (
    <div className="form-field pokemon-picker">
      <label htmlFor={`${id}-input`}>{label}</label>
      <div className="picker-box">
        <input
          id={`${id}-input`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isListShown}
          aria-controls={listId}
          aria-activedescendant={activeOption === undefined ? undefined : `${id}-option-${activeOption.id}`}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          spellCheck={false}
          placeholder="Type a name, e.g. pika"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {/* Always in the page (so aria-controls points to it); hidden while there is nothing to show */}
        <ul id={listId} role="listbox" aria-label={`${label}: matches`} className="picker-list" hidden={!isListShown}>
          {isListShown &&
            matches.map((pokemon, index) => (
              <li
                key={pokemon.id}
                id={`${id}-option-${pokemon.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? 'picker-option active' : 'picker-option'}
                // Keep the focus in the input (no blur), then pick on click — also works with a finger
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(pokemon)}
              >
                {/* The name is in the text, so the sprite is decoration */}
                <img src={getSpriteUrl(pokemon.id)} alt="" width="40" height="40" loading="lazy" />
                {formatPokemonName(pokemon.name)}
              </li>
            ))}
        </ul>
      </div>
      <p id={statusId} role="status" className="picker-status">
        {status}
        <span className="visually-hidden">{matchCount}</span>
      </p>
      {listState.status === 'error' && (
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      )}
      {error !== undefined && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
