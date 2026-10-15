// A Pokémon's attacks, one row each: cost symbols · name · damage. Display only — shared by the details page and the card.
import type { CSSProperties } from 'react'
import type { Attack } from '../utils/moves.ts'
import TypeSymbol from './TypeSymbol.tsx'

interface AttackListProps {
  attacks: Attack[]
}

export default function AttackList({ attacks }: AttackListProps) {
  // The cost column is as wide as the attack with the MOST symbols here (CSS reads --cost-slots),
  // so the names line up across rows without a big gap after 2 symbols
  const costSlots = Math.max(1, ...attacks.map((attack) => attack.cost.length))
  const costColumn = { '--cost-slots': costSlots } as CSSProperties

  return (
    <ul className="attack-list" style={costColumn}>
      {attacks.map((attack) => (
        // An attack name appears only once per Pokémon, so it works as the key
        <li key={attack.name} className="attack-row">
          {/* The symbols together are ONE image for screen readers: "Cost: Lightning, Colorless" */}
          <span className="attack-cost" role="img" aria-label={`Cost: ${attack.cost.join(', ')}`}>
            {attack.cost.map((type, index) => (
              // The same symbol can appear twice (Colorless, Colorless), so the position is part of the key
              <TypeSymbol key={`${index}-${type}`} type={type} decorative />
            ))}
          </span>
          <span className="attack-name">{attack.name}</span>
          {/* No damage (Ditto's Transform): the damage cell stays empty */}
          <span className="attack-damage">{attack.damage ?? ''}</span>
        </li>
      ))}
    </ul>
  )
}
