/**
 * api.js - API Module
 * Responsible for fetching data from PokéAPI and Pokémon TCG API.
 */

export async function fetchFullPokemonData(pokemonName) {
    const name = pokemonName.toLowerCase().trim();

    // Define our API endpoints
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const tcgApiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${name}`;

    try {
        // We trigger both fetches at the same time for better performance
        const [pokeResponse, tcgResponse] = await Promise.all([
            fetch(pokeApiUrl),
            fetch(tcgApiUrl)
        ]);

        // Check if both requests were successful
        if (!pokeResponse.ok || !tcgResponse.ok) {
            throw new Error("Pokemon not found in one or both databases.");
        }

        const pokeData = await pokeResponse.json();
        const tcgData = await tcgResponse.json();

        // Log the results to the console as requested
        console.log("--- PokéAPI Data (Stats & Types) ---");
        console.log(pokeData);

        console.log("--- TCG API Data (Card Images) ---");
        console.log(tcgData.data[0]); // We take the first card match

        return {
            stats: pokeData,
            card: tcgData.data[0]
        };

    } catch (error) {
        console.error("Error fetching Pokemon data:", error);
        return null;
    }
}