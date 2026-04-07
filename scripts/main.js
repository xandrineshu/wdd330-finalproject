import { fetchFullPokemonData } from './api.js';

const searchInput = document.querySelector('.search-area input');
const searchBtn = document.querySelector('.search-area button');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    if (query) {
        console.log(`Searching for: ${query}...`);
        const data = await fetchFullPokemonData(query);

        if (data) {
            console.log("Data successfully retrieved! Check the objects above.");
            alert(`Found ${data.stats.name}! Check the console for details.`);
        } else {
            alert("Could not find that Pokemon. Check your spelling!");
        }
    }
});