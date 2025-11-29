// Utility to fetch and filter Marvel Champions cards

export async function fetchHeroCards() {
  const cardsUrl = 'https://marvelcdb.com/api/public/cards/';
  const response = await fetch(cardsUrl);
  if (!response.ok) throw new Error('Failed to fetch Marvel Champions cards');
  const cards = await response.json();

  // Filter for hero cards only (type_code === 'hero')
  let heroes = cards.filter(card => card.type_code === 'hero');

  // Deduplicate heroes by code (keep unique heroes only)
  const seen = new Set();
  heroes = heroes.filter(card => {
    if (seen.has(card.code)) return false;
    seen.add(card.code);
    return true;
  });

  return heroes;
}

// Extract all unique traits from heroes
export function extractTraits(heroes) {
  const traitsSet = new Set();
  
  heroes.forEach(hero => {
    if (hero.traits) {
      // Traits are in format like "Avenger. Spy."
      const traits = hero.traits
        .split('.')
        .map(t => t.trim())
        .filter(t => t.length > 1) // Filter out single-letter traits
        .filter(t => !t.startsWith('Version')); // Filter out traits starting with 'Version'
      
      traits.forEach(trait => traitsSet.add(trait));
    }
  });

  return Array.from(traitsSet).sort();
}
