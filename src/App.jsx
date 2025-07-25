
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
import ClassFilterPage from './ClassFilterPage';
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
  const [allInvestigators, setAllInvestigators] = useState([]);
  const [filteredInvestigators, setFilteredInvestigators] = useState([]);
  const [filters, setFilters] = useState({});
  const [queue, setQueue] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvestigatorCards()
      .then(cards => {
        setAllInvestigators(cards);
        setFilteredInvestigators(cards);
        setLoading(false);
      })
      .catch(e => {
        setError(e && (e.stack || e.toString()));
        setLoading(false);
      });
  }, []);


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

  useEffect(() => {
    // Update factionFilter if new factions are loaded
    setFactionFilter(factions.reduce((acc, f) => ({ ...acc, [f]: factionFilter[f] || 'include' }), {}));
    // eslint-disable-next-line
  }, [allInvestigators]);

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

  if (loading) return <div>Loading Arkham Horror investigators...</div>;
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
        <ClassFilterPage
          factions={factions}
          FACTION_ICONS={FACTION_ICONS}
          factionFilter={factionFilter}
          handleFactionRadioChange={handleFactionRadioChange}
          uniqueInvestigators={uniqueInvestigators}
          startQueue={startQueue}
        />
      ) : (
        <SelectorPage
          queue={queue}
          accepted={accepted}
          handleAccept={handleAccept}
          handleDeny={handleDeny}
          setStarted={setStarted}
          FACTION_ICONS={FACTION_ICONS}
        />
      )}
      <Footer />
    </>
  );
}

export default App;
