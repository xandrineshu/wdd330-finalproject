/**
 * api.js - API Module
 * Fetches data from PokéAPI and Pokémon TCG API.
 */
export async function fetchFullPokemonData(pokemonName) {
    const name = pokemonName.toLowerCase().trim();
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const tcgApiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${name}`;

    try {
        const [pokeResponse, tcgResponse] = await Promise.all([
            fetch(pokeApiUrl),
            fetch(tcgApiUrl)
        ]);

        if (!pokeResponse.ok || !tcgResponse.ok) {
            throw new Error("Pokemon not found");
        }

        const pokeData = await pokeResponse.json();
        const tcgData = await tcgResponse.json();

        return {
            stats: pokeData,
            card: tcgData.data[0] // Taking the first card result
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}