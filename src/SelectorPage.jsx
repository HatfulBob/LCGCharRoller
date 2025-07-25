import React from 'react';
import './mobile.css';

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
    <div style={{ maxWidth: '100vw', overflowX: 'hidden', padding: '0.5rem' }}>
      <h1>Arkham Investigator Roller</h1>
      <div style={{ margin: '1em 0' }}>
        <button onClick={() => setStarted(false)} style={{ padding: '0.5em 1em' }}>Back to Filters</button>
      </div>
      <div className="cardContainer">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {current ? (
            <div className="mobileCard" style={{ border: '1px solid #aaa', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {current.isFanMade ? (
                <img src={current.imageUrl} alt={current.name} style={{ borderRadius: 10, boxShadow: '0 2px 16px #0003', marginBottom: 12, background: '#222' }} />
              ) : current.code ? (
                <img src={`https://assets.arkham.build/optimized/${current.code}.avif`} alt={current.name} style={{ borderRadius: 10, boxShadow: '0 2px 16px #0003', marginBottom: 12, background: '#222' }} />
              ) : (
                <div style={{ width: '100%', height: 260, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 10, marginBottom: 12 }}>No Image</div>
              )}
              <h2 style={{ margin: '0.5rem 0', textAlign: 'center' }}>{current.name}</h2>
              <h3 style={{ margin: '0.5rem 0', textAlign: 'center' }}>{current.subname}</h3>
              <i style={{ textAlign: 'center' }}>({current.pack_name || current.pack || 'Unknown Pack'})</i>
              <br/>
              <div style={{ fontWeight: 'bold', fontSize: 18, margin: '0.5rem 0' }}>{FACTION_ICONS[current.faction_code] || null}</div>
              <p style={{ margin: '0.5rem 0', textAlign: 'center' }}>Health: {current.health} | Sanity: {current.sanity}</p>
              <p style={{ margin: '0.5rem 0', textAlign: 'center' }}>Deckbuilding: {current.deck_options?.map(opt => opt.faction || '').join(', ')}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button onClick={handleAccept} style={{ padding: '0.5em 2em' }}>Accept</button>
                <button onClick={handleDeny} style={{ padding: '0.5em 2em' }}>Deny</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h2>No more investigators in queue.</h2>
            </div>
          )}
        </div>
        <div style={{ width: '100%', maxWidth: '100vw', background: '#232323', borderRadius: 10, padding: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px #0003' }}>
          <h3 style={{ fontSize: '1.3em', marginBottom: '0.5em', textAlign: 'center' }}>Accepted Investigators ({accepted.length}):</h3>
          <ul className="mobileGrid">
            {accepted.map(card => (
              <li key={card.code} className="cardPreviewWrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {card.isFanMade ? (
                  <>
                    <img src={card.imageUrl} alt={card.name} style={{ borderRadius: 6, background: '#222' }} />
                    <div className="previewCard">
                      <img src={card.imageUrl} alt={card.name} />
                      <p>{card.name}</p>
                    </div>
                  </>
                ) : card.code ? (
                  <>
                    <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} style={{ borderRadius: 6, background: '#222' }} />
                    <div className="previewCard">
                      <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} />
                      <p>{card.name}</p>
                    </div>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', minHeight: 96, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 6 }}>No Image</div>
                )}
                <div style={{ fontSize: 14, color: '#bbb', textAlign: 'center', marginTop: '0.25rem' }}>{card.name}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SelectorPage;
