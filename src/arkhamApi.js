// Utility to fetch and filter Arkham Horror cards
export async function fetchInvestigatorCards() {
  // Example API endpoint for Arkham Horror LCG cards
  // Replace with the actual endpoint if different
  const url = 'https://arkhamdb.com/api/public/cards/';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch cards');
  const cards = await response.json();
    // Filter for investigator cards only, with exclusions and deduplication
  let investigators = cards.filter(card => card.type_code === 'investigator');

  // Exclude Lost Homonculus by name (case-insensitive)
  investigators = investigators.filter(card => (card.real_name || card.name || '').toLowerCase() !== 'lost homunculus');

  // Exclude investigators with no deckbuilding (no deck_options or deck_requirements)
  investigators = investigators.filter(card => card.deck_options || card.deck_requirements);

  // Exclude Bonded investigators (if traits contain 'Bonded')
  investigators = investigators.filter(card => {
    const traits = (card.real_traits || card.traits || '').toLowerCase();
    return !traits.includes('bonded');
  });

  // Deduplicate only if name, subname, text, deckbuilding, AND class are identical
  const seen = new Set();
  investigators = investigators.filter(card => {
    const deckOptionsStr = JSON.stringify(card.deck_options || {});
    const key =
      (card.real_name || card.name || '') + '|' +
      (card.real_subname || card.subname || '') + '|' +
      (card.real_text || card.text || '') + '|' +
      deckOptionsStr + '|' +
      (card.faction_code || '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return investigators;
}
