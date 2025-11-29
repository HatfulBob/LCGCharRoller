import React from 'react';
import './mobile.css';

function TraitFilterPage({
  traits,
  traitFilter,
  handleTraitChange,
  uniqueHeroes,
  startQueue
}) {
  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden', padding: '0.5rem' }}>
      <h1>Marvel Champions Hero Roller</h1>
      <div style={{ margin: '1em 0' }}>
        <h3>Trait Filters</h3>
        <div className="filterGrid">
          {traits.map(trait => (
            <div key={trait} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '0.5em 1em', background: '#202020ff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ userSelect: 'none', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={traitFilter[trait] === 'include'}
                  onChange={() => handleTraitChange(trait, traitFilter[trait] === 'include' ? 'exclude' : 'include')}
                  style={{ marginRight: '0.5em' }}
                />
                {trait}
              </label>
            </div>
          ))}
        </div>
      <button onClick={startQueue} disabled={uniqueHeroes.length === 0} style={{ marginTop: '1em', fontSize: '1.2em', padding: '0.5em 2em' }}>
        Start
      </button>
      </div>
      <div>
        <h2>Heroes: {uniqueHeroes.length}</h2>
        <ul className="cardGrid" style={{ maxHeight: '70vh', overflowY: 'auto', listStyle: 'none', margin: 0 }}>
          {uniqueHeroes.map(card => (
            <li key={card.code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {card.code ? (
                <img src={`https://marvelcdb.com${card.imagesrc}`} alt={card.name} style={{ width: '100%', maxWidth: 340, height: 'auto', minHeight: 220, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px #0002', background: '#222' }} />
              ) : (
                <div style={{ width: '100%', maxWidth: 340, minHeight: 220, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 8 }}>No Image</div>
              )}
              <p style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>{card.name}</p>
              <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', margin: '0.25rem 0' }}>{card.pack_name}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TraitFilterPage;
