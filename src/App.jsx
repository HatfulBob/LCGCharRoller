
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
import { fetchHeroCards, extractTraits } from './marvelApi';
import ClassFilterPage from './ClassFilterPage';
import TraitFilterPage from './TraitFilterPage';
import SelectorPage from './SelectorPage';
import Footer from './Footer';

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
  const [gameType, setGameType] = useState('arkham'); // 'arkham' or 'marvel'
  const [allInvestigators, setAllInvestigators] = useState([]);
  const [filteredInvestigators, setFilteredInvestigators] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedSource, setSelectedSource] = useState('official');
  const [queue, setQueue] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (gameType === 'arkham') {
      fetchInvestigatorCards(selectedSource)
        .then(cards => {
          setAllInvestigators(cards);
          setFilteredInvestigators(cards);
          setLoading(false);
        })
        .catch(e => {
          setError(e && (e.stack || e.toString()));
          setLoading(false);
        });
    } else {
      // Marvel Champions - ignore selectedSource
      fetchHeroCards()
        .then(cards => {
          setAllInvestigators(cards);
          setFilteredInvestigators(cards);
          setLoading(false);
        })
        .catch(e => {
          setError(e && (e.stack || e.toString()));
          setLoading(false);
        });
    }
  }, [selectedSource, gameType]);


  // Faction/class filtering with include/exclude logic
  const CLASS_ORDER = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];
  const allFactions = Array.from(new Set(allInvestigators.map(c => c.faction_code)));
  // Only show classes in CLASS_ORDER, in that order, and any others at the end
  const factions = [
    ...CLASS_ORDER.filter(f => allFactions.includes(f)),
    ...allFactions.filter(f => !CLASS_ORDER.includes(f))
  ];
  // Track which factions are included/excluded
  const [factionFilter, setFactionFilter] = useState(
    factions.reduce((acc, f) => ({ ...acc, [f]: 'include' }), {})
  );

  // Marvel Champions trait filtering
  const allTraits = gameType === 'marvel' ? extractTraits(allInvestigators) : [];
  const [traitFilter, setTraitFilter] = useState(
    allTraits.reduce((acc, t) => ({ ...acc, [t]: 'include' }), {})
  );

  useEffect(() => {
    // Update factionFilter if new factions are loaded
    setFactionFilter(factions.reduce((acc, f) => ({ ...acc, [f]: factionFilter[f] || 'include' }), {}));
    // eslint-disable-next-line
  }, [allInvestigators]);

  useEffect(() => {
    // Update traitFilter if new traits are loaded
    if (gameType === 'marvel') {
      setTraitFilter(allTraits.reduce((acc, t) => ({ ...acc, [t]: traitFilter[t] || 'include' }), {}));
    }
    // eslint-disable-next-line
  }, [allInvestigators, gameType]);

  function handleFactionRadioChange(faction, value) {
    const newFilter = { ...factionFilter, [faction]: value };
    setFactionFilter(newFilter);
    // Apply filter
    let filtered = allInvestigators.filter(card => {
      if (newFilter[card.faction_code] === 'exclude') return false;
      return true;
    });
    setFilteredInvestigators(filtered);
  }

  function handleTraitChange(trait, value) {
    const newFilter = { ...traitFilter, [trait]: value };
    setTraitFilter(newFilter);
    // Apply filter - hero must have at least one included trait
    let filtered = allInvestigators.filter(card => {
      if (!card.traits) return false;
      const heroTraits = card.traits
        .split('.')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // Check if any of the hero's traits are included
      const hasIncludedTrait = heroTraits.some(t => newFilter[t] === 'include');
      return hasIncludedTrait;
    });
    setFilteredInvestigators(filtered);
  }

  function startQueue() {
    setQueue(shuffle(filteredInvestigators));
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

  if (loading) return <div>Loading {gameType === 'arkham' ? 'Arkham Horror investigators' : 'Marvel Champions heroes'}...</div>;
  if (error) return <div>Error: {error}</div>;

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
    <>
      {!started ? (
        <>
          <div style={{ maxWidth: '100vw', padding: '0.5rem' }}>
            <div style={{ margin: '1em 0' }}>
              <h3>Game Selection</h3>
              <select 
                value={gameType} 
                onChange={(e) => {
                  setGameType(e.target.value);
                  setStarted(false);
                  setAccepted([]);
                  setQueue([]);
                }}
                style={{ 
                  padding: '0.5em',
                  marginBottom: '1em',
                  background: '#202020',
                  color: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '250px',
                  fontSize: '1em'
                }}
              >
                <option value="arkham">Arkham Horror LCG</option>
                <option value="marvel">Marvel Champions</option>
              </select>
            </div>
          </div>
          {gameType === 'arkham' ? (
            <ClassFilterPage
              factions={factions}
              FACTION_ICONS={FACTION_ICONS}
              factionFilter={factionFilter}
              handleFactionRadioChange={handleFactionRadioChange}
              uniqueInvestigators={uniqueInvestigators}
              startQueue={startQueue}
              selectedSource={selectedSource}
              onSourceChange={setSelectedSource}
            />
          ) : (
            <TraitFilterPage
              traits={allTraits}
              traitFilter={traitFilter}
              handleTraitChange={handleTraitChange}
              uniqueHeroes={uniqueInvestigators}
              startQueue={startQueue}
            />
          )}
        </>
      ) : (
        <SelectorPage
          queue={queue}
          accepted={accepted}
          handleAccept={handleAccept}
          handleDeny={handleDeny}
          setStarted={setStarted}
          FACTION_ICONS={FACTION_ICONS}
          gameType={gameType}
        />
      )}
      <Footer />
    </>
  );
}

export default App;
