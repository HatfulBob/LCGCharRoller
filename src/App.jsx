
// Faction/class icon SVGs (inline for simplicity, can be replaced with imports)
const FACTION_ICONS = {
  guardian: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#2b5dab" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">G</text></svg>
  ),
  seeker: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e0b13d" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">S</text></svg>
  ),
  rogue: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1e8c6b" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">R</text></svg>
  ),
  mystic: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#7b3fb3" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">M</text></svg>
  ),
  survivor: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#b13d3d" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">S</text></svg>
  ),
  neutral: (
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#888" stroke="#fff" strokeWidth="2"/><text x="16" y="22" textAnchor="middle" fontSize="18" fill="#fff">N</text></svg>
  ),
};

import { useEffect, useState } from 'react';
import './App.css';
import './arkham.css';
import { fetchInvestigatorCards } from './arkhamApi';
import { fetchLotrHeroCards } from './lotrApi';

function shuffle(array) {
  // Fisher-Yates shuffle
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


function App() {
  const [tab, setTab] = useState('arkham'); // 'arkham' or 'lotr'
  // Arkham state
  const [allInvestigators, setAllInvestigators] = useState([]);
  const [filteredInvestigators, setFilteredInvestigators] = useState([]);
  // LotR state
  const [allHeroes, setAllHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  // Shared state
  const [filters, setFilters] = useState({});
  const [queue, setQueue] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Arkham load
  useEffect(() => {
    if (tab === 'arkham') {
      setLoading(true);
      fetchInvestigatorCards()
        .then(cards => {
          setAllInvestigators(cards);
          setFilteredInvestigators(cards);
          setLoading(false);
        })
        .catch(e => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [tab]);

  // LotR load
  useEffect(() => {
    if (tab === 'lotr') {
      setLoading(true);
      fetchLotrHeroCards()
        .then(cards => {
          setAllHeroes(cards);
          setFilteredHeroes(cards);
          setLoading(false);
        })
        .catch(e => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [tab]);



  // Arkham: Faction/class filtering
  const CLASS_ORDER = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];
  const allFactions = Array.from(new Set(allInvestigators.map(c => c.faction_code)));
  const factions = [
    ...CLASS_ORDER.filter(f => allFactions.includes(f)),
    ...allFactions.filter(f => !CLASS_ORDER.includes(f))
  ];
  const [factionFilter, setFactionFilter] = useState(
    factions.reduce((acc, f) => ({ ...acc, [f]: 'include' }), {})
  );
  useEffect(() => {
    setFactionFilter(factions.reduce((acc, f) => ({ ...acc, [f]: factionFilter[f] || 'include' }), {}));
    // eslint-disable-next-line
  }, [allInvestigators]);

  // LotR: Sphere filtering and trait filtering
  const LOTR_SPHERES = ['leadership', 'tactics', 'spirit', 'lore', 'neutral'];
  const allLotrSpheres = Array.from(new Set(allHeroes.map(c => c.sphere_code)));
  const lotrFactions = [
    ...LOTR_SPHERES.filter(f => allLotrSpheres.includes(f)),
    ...allLotrSpheres.filter(f => !LOTR_SPHERES.includes(f))
  ];
  const [lotrFactionFilter, setLotrFactionFilter] = useState(
    lotrFactions.reduce((acc, f) => ({ ...acc, [f]: 'include' }), {})
  );
  useEffect(() => {
    setLotrFactionFilter(lotrFactions.reduce((acc, f) => ({ ...acc, [f]: lotrFactionFilter[f] || 'include' }), {}));
    // eslint-disable-next-line
  }, [allHeroes]);

  // Dynamic trait filtering for LotR
  const allTraits = Array.from(new Set(allHeroes.flatMap(card => (card.traits ? card.traits.split('.').map(t => t.trim()).filter(Boolean) : []))));
  const [excludedTraits, setExcludedTraits] = useState([]);

  function filterLotrHeroes(newFilter = lotrFactionFilter, newExcludedTraits = excludedTraits) {
    let filtered = allHeroes.filter(card => {
      if (newFilter[card.sphere_code] === 'exclude') return false;
      if (newExcludedTraits.length > 0 && card.traits) {
        const traits = card.traits.split('.').map(t => t.trim());
        if (traits.some(t => newExcludedTraits.includes(t))) return false;
      }
      return true;
    });
    setFilteredHeroes(filtered);
  }

  function handleLotrTraitToggle(trait) {
    setExcludedTraits(traits => {
      const updated = traits.includes(trait) ? traits.filter(t => t !== trait) : [...traits, trait];
      return updated;
    });
  }

  useEffect(() => {
    if (tab === 'lotr') {
      filterLotrHeroes(lotrFactionFilter, excludedTraits);
    }
    // eslint-disable-next-line
  }, [excludedTraits, allHeroes, lotrFactionFilter, tab]);


  function handleFactionRadioChange(faction, value) {
    const newFilter = { ...factionFilter, [faction]: value };
    setFactionFilter(newFilter);
    let filtered = allInvestigators.filter(card => {
      if (newFilter[card.faction_code] === 'exclude') return false;
      return true;
    });
    setFilteredInvestigators(filtered);
  }
  function handleLotrFactionRadioChange(faction, value) {
    const newFilter = { ...lotrFactionFilter, [faction]: value };
    setLotrFactionFilter(newFilter);
    filterLotrHeroes(newFilter, excludedTraits);
  }

  function startQueue() {
    if (tab === 'arkham') {
      setQueue(shuffle(filteredInvestigators));
    } else if (tab === 'lotr') {
      setQueue(shuffle(filteredHeroes));
    }
    setStarted(true);
    setAccepted([]);
  }

  function handleAccept() {
    if (queue.length === 0) return;
    setAccepted([...accepted, queue[0]]);
    setQueue(queue.slice(1));
  }

  function handleDeny() {
    if (queue.length === 0) return;
    setQueue(queue.slice(1));
  }


  // Tab UI
  const tabStyle = tabName => ({
    padding: '0.5em 1.5em',
    margin: '0 0.5em',
    borderRadius: 6,
    border: tab === tabName ? '2px solid #61dafb' : '1px solid #444',
    background: tab === tabName ? '#222' : '#181818',
    color: tab === tabName ? '#61dafb' : '#ccc',
    cursor: 'pointer',
    fontWeight: tab === tabName ? 'bold' : 'normal',
    fontSize: '1.1em',
  });

  if (loading) return <div>Loading cards...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!started) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={tabStyle('arkham')} onClick={() => setTab('arkham')}>Arkham Horror</button>
          <button style={tabStyle('lotr')} onClick={() => setTab('lotr')}>Lord of the Rings</button>
        </div>
        {tab === 'arkham' ? <ArkhamFilter
          allInvestigators={allInvestigators}
          filteredInvestigators={filteredInvestigators}
          factions={factions}
          factionFilter={factionFilter}
          setFactionFilter={setFactionFilter}
          handleFactionRadioChange={handleFactionRadioChange}
          startQueue={startQueue}
        /> : <LotrFilter
          allHeroes={allHeroes}
          filteredHeroes={filteredHeroes}
          lotrFactions={lotrFactions}
          lotrFactionFilter={lotrFactionFilter}
          setLotrFactionFilter={setLotrFactionFilter}
          handleLotrFactionRadioChange={handleLotrFactionRadioChange}
          allTraits={allTraits}
          excludedTraits={excludedTraits}
          handleLotrTraitToggle={handleLotrTraitToggle}
          setFilteredHeroes={setFilteredHeroes}
          startQueue={startQueue}
        />}
      </div>
    );
  }

  // ...existing code for queue UI...
// Arkham filter component
function ArkhamFilter({ allInvestigators, filteredInvestigators, factions, factionFilter, setFactionFilter, handleFactionRadioChange, startQueue }) {
  // Remove duplicate investigators by name+textbox
  const uniqueInvestigatorMap = {};
  for (const card of filteredInvestigators) {
    const key = card.name + '|' + (card.text || '');
    if (!uniqueInvestigatorMap[key]) {
      uniqueInvestigatorMap[key] = card;
    }
  }
  const uniqueInvestigators = Object.values(uniqueInvestigatorMap);
  return (
    <div>
      <h1>Arkham Investigator Filter</h1>
      <div style={{ margin: '1em 0' }}>
        <h3>Class Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em', justifyContent: 'center' }}>
          {factions.map(f => (
            <div key={f} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '0.5em 1em', background: '#202020ff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 4 }}>{FACTION_ICONS[f] || null}</div>
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

// Lord of the Rings filter component
function LotrFilter({ allHeroes, filteredHeroes, lotrFactions, lotrFactionFilter, setLotrFactionFilter, handleLotrFactionRadioChange, allTraits, excludedTraits, handleLotrTraitToggle, setFilteredHeroes, startQueue }) {
  // Remove duplicate heroes by name+textbox
  const uniqueHeroMap = {};
  for (const card of filteredHeroes) {
    const key = card.name + '|' + (card.text || '');
    if (!uniqueHeroMap[key]) {
      uniqueHeroMap[key] = card;
    }
  }
  const uniqueHeroes = Object.values(uniqueHeroMap);
  return (
    <div>
      <h1>LOTR Hero Filter</h1>
      <div style={{ margin: '1em 0' }}>
        <h3>Sphere Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em', justifyContent: 'center' }}>
          {lotrFactions.map(f => (
            <div key={f} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '0.5em 1em', background: '#202020ff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 4 }}>{f}</div>
              <label style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name={`faction-${f}`}
                  value="include"
                  checked={lotrFactionFilter[f] === 'include'}
                  onChange={() => handleLotrFactionRadioChange(f, 'include')}
                />
                Include
              </label>
              <label>
                <input
                  type="radio"
                  name={`faction-${f}`}
                  value="exclude"
                  checked={lotrFactionFilter[f] === 'exclude'}
                  onChange={() => handleLotrFactionRadioChange(f, 'exclude')}
                />
                Exclude
              </label>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '1em 0' }}>
        <h3>Trait Filters (Exclude any):</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', justifyContent: 'center' }}>
          {allTraits.map(trait => (
            <label key={trait} style={{ background: excludedTraits.includes(trait) ? '#b13d3d' : '#333', color: '#fff', borderRadius: 4, padding: '0.2em 0.7em', cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={excludedTraits.includes(trait)}
                onChange={() => handleLotrTraitToggle(trait)}
                style={{ marginRight: 4 }}
              />
              {trait}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2>Heroes: {uniqueHeroes.length}</h2>
        <ul style={{ maxHeight: 600, overflowY: 'auto', listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '2em', justifyContent: 'center' }}>
          {uniqueHeroes.map(card => (
            <li key={card.code} style={{ margin: '0.5em 0', minWidth: 340, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {card.code ? (
                <img src={`https://ringsdb.com/bundles/cards/${card.code}.png`} alt={card.name} style={{ width: 340, height: 220, objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 12px #0002', background: '#222' }} />
              ) : (
                <div style={{ width: 340, height: 220, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 8 }}>No Image</div>
              )}
              <p style={{ fontWeight: 'bold', textAlign: 'center' }}>{card.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={startQueue} disabled={uniqueHeroes.length === 0} style={{ marginTop: '1em', fontSize: '1.2em' }}>
        Start
      </button>
    </div>
  );
}

  // Card queue UI
  const current = queue[0];
  return (
    <div>
      <h1>{tab === 'arkham' ? 'Arkham Investigator Selector' : 'LOTR Hero Selector'}</h1>
      <div style={{ margin: '1em 0' }}>
        <button onClick={() => setStarted(false)}>Back to Filters</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', gap: '2em', minHeight: 400 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {current ? (
            <div className="card" style={{ maxWidth: 420, border: '1px solid #aaa', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {tab === 'arkham' ? (
                current.code ? (
                  <img src={`https://assets.arkham.build/optimized/${current.code}.avif`} alt={current.name} style={{ width: 400, height: 260, objectFit: 'contain', borderRadius: 10, boxShadow: '0 2px 16px #0003', marginBottom: 12, background: '#222' }} />
                ) : (
                  <div style={{ width: 400, height: 260, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 10, marginBottom: 12 }}>No Image</div>
                )
              ) : (
                current.code ? (
                  <img src={`https://ringsdb.com/bundles/cards/${current.code}.png`} alt={current.name} style={{ width: 400, height: 260, objectFit: 'contain', borderRadius: 10, boxShadow: '0 2px 16px #0003', marginBottom: 12, background: '#222' }} />
                ) : (
                  <div style={{ width: 400, height: 260, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 10, marginBottom: 12 }}>No Image</div>
                )
              )}
              <h2>{current.name}</h2>
              {tab === 'arkham' && <h3>{current.subname}</h3>}
              <i>({current.pack_name || current.pack || 'Unknown Pack'})</i>
              <br/>
              {tab === 'arkham' ? (
                <>
                  <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{FACTION_ICONS[current.faction_code] || null}</div>
                  <p>Health: {current.health} | Sanity: {current.sanity}</p>
                  <p>Deckbuilding: {current.deck_options?.map(opt => opt.faction || '').join(', ')}</p>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{current.sphere_code}</div>
                  <p>Threat: {current.threat}</p>
                  <p>Willpower: {current.willpower} | Attack: {current.attack} | Defense: {current.defense} | HP: {current.hit_points}</p>
                  <p>Traits: {current.traits}</p>
                </>
              )}
              <div style={{ marginTop: 24 }}>
                <button onClick={handleAccept} style={{ marginRight: 16 }}>Accept</button>
                <button onClick={handleDeny}>Deny</button>
              </div>
            </div>
          ) : (
            <div>
              <h2>No more {tab === 'arkham' ? 'investigators' : 'heroes'} in queue.</h2>
            </div>
          )}
        </div>
        <div style={{ minWidth: 540, maxWidth: 700, background: '#232323', borderRadius: 10, padding: '1em 0.5em', marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px #0003' }}>
          <h3 style={{ fontSize: '1.3em', marginBottom: '0.5em' }}>Accepted {tab === 'arkham' ? 'Investigators' : 'Heroes'} ({accepted.length}):</h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1em',
            justifyItems: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            {accepted.map(card => (
              <li key={card.code}>
                {tab === 'arkham' ? (
                  card.code ? (
                    <img src={`https://assets.arkham.build/optimized/${card.code}.avif`} alt={card.name} style={{ width: 160, height: 102, objectFit: 'contain', borderRadius: 6, background: '#222' }} />
                  ) : (
                    <div style={{ width: 160, height: 102, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 6 }}>No Image</div>
                  )
                ) : (
                  card.code ? (
                    <img src={`https://ringsdb.com/bundles/cards/${card.code}.png`} alt={card.name} style={{ width: 160, height: 102, objectFit: 'contain', borderRadius: 6, background: '#222' }} />
                  ) : (
                    <div style={{ width: 160, height: 102, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 6 }}>No Image</div>
                  )
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

export default App;
