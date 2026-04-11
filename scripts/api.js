/**
 * api.js - API Module
 * Fetches data from PokéAPI and TCGdex API.
 */
export async function fetchFullPokemonData(pokemonName) {
    const name = pokemonName.toLowerCase().trim();
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;

    // Updated to TCGdex URL
    const tcgApiUrl = `https://api.tcgdex.net/v2/en/cards?name=${name}`;

    try {
        const [pokeResponse, tcgResponse] = await Promise.all([
            fetch(pokeApiUrl),
            fetch(tcgApiUrl)
        ]);

        if (!pokeResponse.ok || !tcgResponse.ok) {
            throw new Error("Pokemon not found");
        }

        const pokeData = await pokeResponse.json();
        const tcgCards = await tcgResponse.json();

        // TCGdex returns a list. We need to fetch the detail of the first card 
        // to get the high-quality image, just like in your main script.
        let cardDetail = null;
        if (tcgCards && tcgCards.length > 0) {
            const detailRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${tcgCards[0].id}`);
            cardDetail = await detailRes.json();
        }

        return {
            stats: pokeData,
            // We map the image to a 'card' object so it doesn't break your other code
            card: cardDetail ? {
                images: { large: `${cardDetail.image}/high.webp` },
                name: cardDetail.name
            } : null
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}