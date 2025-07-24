// Utility to fetch and filter Arkham Horror cards
export async function fetchInvestigatorCards() {
  // Example API endpoint for Arkham Horror LCG cards
  // Replace with the actual endpoint if different
  const url = 'https://arkhamdb.com/api/public/cards/';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch cards');
  const cards = await response.json();
  // Filter for investigator cards only
  return cards.filter(card => card.type_code === 'investigator');
}
