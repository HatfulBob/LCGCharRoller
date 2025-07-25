import React from 'react';
import './mobile.css';

function ClassFilterPage({
  factions,
  FACTION_ICONS,
  factionFilter,
  handleFactionRadioChange,
  uniqueInvestigators,
  startQueue
}) {
  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden', padding: '0.5rem' }}>
      <h1>Arkham Investigator Roller</h1>
      <div style={{ margin: '1em 0' }}>
        <h3>Class Filters</h3>
        <div className="filterGrid">
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
        <ul className="cardGrid" style={{ maxHeight: '70vh', overflowY: 'auto', listStyle: 'none', margin: 0 }}>
          {uniqueInvestigators.map(card => (
            <li key={card.code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {card.code ? (
                <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} style={{ width: '100%', maxWidth: 340, height: 'auto', minHeight: 220, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px #0002', background: '#222' }} />
              ) : (
                <div style={{ width: '100%', maxWidth: 340, minHeight: 220, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 8 }}>No Image</div>
              )}
              <p style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>{card.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={startQueue} disabled={uniqueInvestigators.length === 0} style={{ marginTop: '1em', fontSize: '1.2em', padding: '0.5em 2em' }}>
        Start
      </button>
    </div>
  );
}

export default ClassFilterPage;
