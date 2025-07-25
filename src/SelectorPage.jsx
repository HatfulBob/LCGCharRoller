import React from 'react';

function SelectorPage({
  queue,
  accepted,
  handleAccept,
  handleDeny,
  setStarted,
  FACTION_ICONS
}) {
  const current = queue[0];
  return (
    <div>
      <h1>Arkham Investigator Selector</h1>
      <div style={{ margin: '1em 0' }}>
        <button onClick={() => setStarted(false)}>Back to Filters</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', gap: '2em', minHeight: 400 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {current ? (
            <div className="card" style={{ maxWidth: 420, border: '1px solid #aaa', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {current.code ? (
                <img src={`https://assets.arkham.build/optimized/${current.code}.avif`} alt={current.name} style={{ width: 400, height: 260, objectFit: 'contain', borderRadius: 10, boxShadow: '0 2px 16px #0003', marginBottom: 12, background: '#222' }} />
              ) : (
                <div style={{ width: 400, height: 260, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 10, marginBottom: 12 }}>No Image</div>
              )}
              <h2>{current.name}</h2>
              <h3>{current.subname}</h3>
              <i>({current.pack_name || current.pack || 'Unknown Pack'})</i>
              <br/>
              <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{FACTION_ICONS[current.faction_code] || null}</div>
              <p>Health: {current.health} | Sanity: {current.sanity}</p>
              <p>Deckbuilding: {current.deck_options?.map(opt => opt.faction || '').join(', ')}</p>
              <div style={{ marginTop: 24 }}>
                <button onClick={handleAccept} style={{ marginRight: 16 }}>Accept</button>
                <button onClick={handleDeny}>Deny</button>
              </div>
            </div>
          ) : (
            <div>
              <h2>No more investigators in queue.</h2>
            </div>
          )}
        </div>
        <div style={{ minWidth: 540, maxWidth: 700, background: '#232323', borderRadius: 10, padding: '1em 0.5em', marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px #0003' }}>
          <h3 style={{ fontSize: '1.3em', marginBottom: '0.5em' }}>Accepted Investigators ({accepted.length}):</h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1em',
            justifyItems: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            {accepted.map(card => (
              <li key={card.code}>
                {card.code ? (
                  <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} style={{ width: 160, height: 102, objectFit: 'contain', borderRadius: 6, background: '#222' }} />
                ) : (
                  <div style={{ width: 160, height: 102, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 6 }}>No Image</div>
                )}
                <div style={{ fontSize: 14, color: '#bbb', textAlign: 'center' }}>{card.name}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SelectorPage;
