// Utility to fetch and filter Arkham Horror cards
export const CardSource = {
  OFFICIAL: 'official',
  FANMADE: 'fanmade',
  ALL: 'all'
};

async function fetchFanMadeInvestigators() {
  const projectsUrl = 'https://api.arkham.build/v1/public/fan_made_projects/';
  //console.log('Fetching from:', projectsUrl);
  const response = await fetch(projectsUrl);
  if (!response.ok) throw new Error('Failed to fetch fan made projects');
  const apiResponse = await response.json();
  //console.log('API Response:', apiResponse);
  
  // Extract the array of projects and their URLs
  const projects = apiResponse.data || [];
  //console.log('Projects:', projects);
  
  const investigatorPacks = projects.filter(pack => {
    //console.log('Checking pack:', pack);
    return Array.isArray(pack.meta?.types) && pack.meta?.types.includes('investigators');
  });
 // console.log('Investigator packs:', investigatorPacks);
  
  // Fetch cards from each pack using the URL from meta.url
  const allFanCards = await Promise.all(
    investigatorPacks.map(async pack => {
      const packUrl = pack.meta?.url;
      if (!packUrl) {
       // console.log(`No URL found for pack:`, pack);
        return [];
      }
      
      //console.log(`Fetching pack: ${pack.meta?.name} (${packUrl})`);
      const packResponse = await fetch(packUrl);
      if (!packResponse.ok) {
       // console.log(`Failed to fetch pack: ${pack.meta?.name}`);
        return [];
      }
      const packData = await packResponse.json();
     // console.log(`Pack data for ${pack.meta?.name}:`, packData);
      // Navigate through data.cards to get the actual cards array and transform the data
      const cards = packData.data?.cards || [];
      return cards.map(card => ({
        ...card,
        // Add isFanMade flag to distinguish source
        isFanMade: true,
        // Override image URL format for fan-made cards
        imageUrl: card.image_url,
        // Set the pack name to the project name
        pack_name: pack.meta?.name
      }));
    })
  );

  // Flatten all cards into a single array
  return allFanCards.flat();
}

export async function fetchInvestigatorCards(source = CardSource.OFFICIAL) {
  // Fetch official cards
  const officialUrl = 'https://arkhamdb.com/api/public/cards/';
  const officialResponse = await fetch(officialUrl);
  if (!officialResponse.ok) throw new Error('Failed to fetch official cards');
  const officialCards = await officialResponse.json();

  // Fetch fan-made cards if needed
  let fanCards = [];
  if (source === CardSource.FANMADE || source === CardSource.ALL) {
    fanCards = await fetchFanMadeInvestigators();
  }

  // Combine cards based on source
  const cards = source === CardSource.FANMADE ? fanCards :
               source === CardSource.ALL ? [...officialCards, ...fanCards] :
               officialCards;

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
