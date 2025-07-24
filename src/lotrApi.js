// Utility to fetch and filter Lord of the Rings LCG hero cards from RingsDB
export async function fetchLotrHeroCards() {
  // Example API endpoint for LOTR LCG cards (heroes only)
  // See https://ringsdb.com/api/
  const url = 'https://ringsdb.com/api/public/cards/';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch cards');
  const cards = await response.json();
  // Filter for hero cards only
  return cards.filter(card => card.type_code === 'hero');
}
