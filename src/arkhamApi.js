// Utility to fetch and filter Arkham Horror cards
export const CardSource = {
  OFFICIAL: 'official',
  FANMADE: 'fanmade',
  ALL: 'all'
};

const FAN_MADE_CACHE_KEY = 'arkham-fan-made-investigators-v1';
let fanMadeInvestigatorsPromise;

async function fetchFanMadeInvestigators() {
  const cachedInvestigators = sessionStorage.getItem(FAN_MADE_CACHE_KEY);
  if (cachedInvestigators) {
    try {
      const investigators = JSON.parse(cachedInvestigators);
      if (Array.isArray(investigators)) return investigators;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
    console.warn('Ignoring invalid fan-made investigator session cache.');
    sessionStorage.removeItem(FAN_MADE_CACHE_KEY);
  }

  if (!fanMadeInvestigatorsPromise) {
    fanMadeInvestigatorsPromise = (async () => {
      const projectsResponse = await fetch('https://api.arkham.build/v2/public/fan-made-project-info');
      if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch fan-made projects: ${projectsResponse.status} ${projectsResponse.statusText}`);
      }
      const projectsData = await projectsResponse.json();
      if (!Array.isArray(projectsData.data)) {
        throw new Error('Fan-made projects response did not contain a data array');
      }

      const investigatorProjects = projectsData.data.filter(project =>
        project.meta?.types?.includes('investigators')
      );
      const projectCards = await Promise.all(investigatorProjects.map(async project => {
        const packUrl = project.meta?.url;
        if (!packUrl) {
          throw new Error(`Fan-made investigator project "${project.meta?.name}" has no data URL`);
        }

        const packResponse = await fetch(packUrl);
        if (!packResponse.ok) {
          throw new Error(`Failed to fetch fan-made project "${project.meta?.name}": ${packResponse.status} ${packResponse.statusText}`);
        }

        const packData = await packResponse.json();
        if (!Array.isArray(packData.data?.cards)) {
          throw new Error(`Fan-made project "${project.meta?.name}" did not contain a cards array`);
        }

        return packData.data.cards
          .filter(card => card.type_code === 'investigator')
          .map(card => ({
            ...card,
            isFanMade: true,
            imageUrl: card.image_url,
            pack_name: project.meta.name
          }));
      }));

      const investigators = projectCards.flat();
      sessionStorage.setItem(FAN_MADE_CACHE_KEY, JSON.stringify(investigators));
      return investigators;
    })().catch(error => {
      fanMadeInvestigatorsPromise = null;
      throw error;
    });
  }

  return fanMadeInvestigatorsPromise;
}

export async function fetchInvestigatorCards(source = CardSource.OFFICIAL) {
  let officialCards = [];
  if (source !== CardSource.FANMADE) {
    const officialUrl = 'https://arkhamdb.com/api/public/cards/';
    const officialResponse = await fetch(officialUrl);
    if (!officialResponse.ok) throw new Error('Failed to fetch official cards');
    officialCards = await officialResponse.json();
  }

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
