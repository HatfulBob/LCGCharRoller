import React from 'react';

function ClassFilterPage({
  factions,
  FACTION_ICONS,
  factionFilter,
  handleFactionRadioChange,
  uniqueInvestigators,
  startQueue
}) {
  return (
    <div>
      <h1>Arkham Investigator Roller</h1>
      <div style={{ margin: '1em 0' }}>
        <h3>Class Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em', justifyContent: 'center' }}>
          {factions.map(f => (
            <div key={f} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '0.5em 1em', background: '#202020ff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 4 }}>
                {FACTION_ICONS[f] || null}
              </div>
              <label style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name={`faction-${f}`}
                  value="include"
                  checked={factionFilter[f] === 'include'}
                  onChange={() => handleFactionRadioChange(f, 'include')}
                />
                Include
              </label>
              <label>
                <input
                  type="radio"
                  name={`faction-${f}`}
                  value="exclude"
                  checked={factionFilter[f] === 'exclude'}
                  onChange={() => handleFactionRadioChange(f, 'exclude')}
                />
                Exclude
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>Investigators: {uniqueInvestigators.length}</h2>
        <ul style={{ maxHeight: 600, overflowY: 'auto', listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '2em', justifyContent: 'center' }}>
          {uniqueInvestigators.map(card => (
            <li key={card.code} style={{ margin: '0.5em 0', minWidth: 340, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {card.code ? (
                <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} style={{ width: 340, height: 220, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px #0002', background: '#222' }} />
              ) : (
                <div style={{ width: 340, height: 220, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 8 }}>No Image</div>
              )}
              <p style={{ fontWeight: 'bold', textAlign: 'center' }}>{card.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={startQueue} disabled={uniqueInvestigators.length === 0} style={{ marginTop: '1em', fontSize: '1.2em' }}>
        Start
      </button>
    </div>
  );
}

export default ClassFilterPage;
