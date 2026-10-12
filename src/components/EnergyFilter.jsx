// Row of energy buttons: "All" + the 10 energies. The selected energy lives in App.
import { ENERGIES } from '../utils/energy.js'

export default function EnergyFilter({ selectedEnergy, onChange }) {
  return (
    <div className="energy-filter" role="group" aria-label="Filter by energy">
      <button
        type="button"
        className={selectedEnergy === null ? 'energy-button selected' : 'energy-button'}
        aria-pressed={selectedEnergy === null}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {ENERGIES.map((energy) => (
        <button
          key={energy.name}
          type="button"
          className={selectedEnergy === energy.name ? 'energy-button selected' : 'energy-button'}
          aria-pressed={selectedEnergy === energy.name}
          onClick={() => onChange(energy.name)}
        >
          {energy.name}
        </button>
      ))}
    </div>
  )
}
