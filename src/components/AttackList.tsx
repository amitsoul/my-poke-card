// A Pokémon's attacks, one per line. Display only — shared by the details page and the card.
import { formatAttack, type Attack } from '../utils/moves.ts'

interface AttackListProps {
  attacks: Attack[]
}

export default function AttackList({ attacks }: AttackListProps) {
  return (
    <ul className="attack-list">
      {attacks.map((attack) => (
        // An attack name appears only once per Pokémon, so it works as the key
        <li key={attack.name}>{formatAttack(attack)}</li>
      ))}
    </ul>
  )
}
