/* ========================================= */
/* === 1. GLOBAL SETTINGS & NAVIGATION   === */
/* ========================================= */

let allPokemonNames = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialization
    setInterval(createSparkle, 400);
    fetchAllNames();

    // Setup Navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', '') + '-view';
            showSection(targetId);
            if (targetId === 'favorites-view') renderFavorites();
        });
    });

    // Setup Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);

    // --- SEARCH SUGGESTIONS ---
    const searchInput = document.getElementById('pokemon-search');
    const suggestionsBox = document.getElementById('suggestions');

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';

        if (value.length > 1) {
            const matches = allPokemonNames
                .filter(name => name.startsWith(value))
                .slice(0, 6);

            matches.forEach(match => {
                const div = document.createElement('div');
                div.innerHTML = `<strong>${match.substring(0, value.length)}</strong>${match.substring(value.length)}`;
                div.addEventListener('click', () => {
                    searchInput.value = match;
                    suggestionsBox.innerHTML = '';
                    handleSearch();
                });
                suggestionsBox.appendChild(div);
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== searchInput) suggestionsBox.innerHTML = '';
    });
});

function showSection(id) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}

/* ========================================= */
/* === 2. API FETCH & SEARCH LOGIC       === */
/* ========================================= */

// --- NEW: TCGDEX API FETCH (API #2) ---
async function fetchTcgCardImage(name) {
    try {
        const response = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${name}`);
        const cards = await response.json();

        if (cards && cards.length > 0) {
            // Get detail of first card to get the high-res image
            const detailRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${cards[0].id}`);
            const detail = await detailRes.json();
            return detail.image ? `${detail.image}/high.webp` : null;
        }
        return null;
    } catch (error) {
        console.error("TCG API Error:", error);
        return null;
    }
}

async function handleSearch() {
    const query = document.getElementById('pokemon-search').value.toLowerCase().trim();
    if (!query) return;

    const statsTarget = document.getElementById('stats-target');
    const cardTarget = document.getElementById('card-target');
    const saveBtn = document.getElementById('save-btn');

    statsTarget.innerHTML = '<div class="loader"></div>';
    cardTarget.innerHTML = '<div class="loader"></div>';

    try {
        // API 1: PokeAPI (Stats)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const data = await response.json();

        // API 2: TCGDex (Visual Card)
        const tcgImageUrl = await fetchTcgCardImage(data.name);

        // Fallback: Use official artwork if TCG card isn't found
        const finalImageUrl = tcgImageUrl || data.sprites.other['official-artwork'].front_default;

        // Update Display Stats
        statsTarget.innerHTML = `
            <div class="stats-list fade-in">
                <p><strong>Name:</strong> ${data.name.toUpperCase()}</p>
                <p><strong>Type:</strong> ${data.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>HP:</strong> ${data.stats[0].base_stat}</p>
                <p><strong>Abilities:</strong> ${data.abilities.map(a => a.ability.name).join(', ')}</p>
                <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
                ${tcgImageUrl ? '<p style="font-size: 0.7rem; opacity: 0.6;">Visual Source: TCGDex API</p>' : ''}
            </div>
        `;

        cardTarget.innerHTML = `<img src="${finalImageUrl}" class="pokemon-image fade-in" alt="${data.name}">`;

        saveBtn.style.display = 'block';
        saveBtn.onclick = () => {
            saveToFavorites({
                id: data.id,
                name: data.name,
                image: finalImageUrl
            });
        };

    } catch (error) {
        cardTarget.innerHTML = `<p class="error-msg">Hmm... I can't find that Pokémon! 🔍</p>`;
        statsTarget.innerHTML = `<p>Check your spelling and try again!</p>`;
        saveBtn.style.display = 'none';

        setTimeout(() => {
            if (cardTarget.innerHTML.includes("can't find")) {
                cardTarget.innerHTML = `<div class="card-placeholder">Ready for next search!</div>`;
                statsTarget.innerHTML = `<p>(Stats will appear here)</p>`;
            }
        }, 5000);
    }
}

/* ========================================= */
/* === 3. LOCAL STORAGE & FAVORITES      === */
/* ========================================= */

function saveToFavorites(pokemon) {
    let favorites = JSON.parse(localStorage.getItem('poke-favorites')) || [];

    if (!favorites.some(f => f.id === pokemon.id)) {
        favorites.push(pokemon);
        localStorage.setItem('poke-favorites', JSON.stringify(favorites));
        showToast(`✨ ${pokemon.name.toUpperCase()} added to deck!`);
        if (document.getElementById('favorites-view').style.display !== 'none') renderFavorites();
    } else {
        showToast("💖 Already in your favorites!");
    }
}

function renderFavorites() {
    const grid = document.getElementById('favorites-grid');
    const favorites = JSON.parse(localStorage.getItem('poke-favorites')) || [];

    if (favorites.length === 0) {
        grid.innerHTML = `<div class="empty-msg"><p>Your PokéDeck is lonely... 🍃</p></div>`;
        return;
    }

    grid.innerHTML = '';
    favorites.forEach(pokemon => {
        grid.innerHTML += `
            <article class="fav-card fade-in">
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <h3>${pokemon.name.toUpperCase()}</h3>
                <button class="remove-btn" onclick="removeFavorite(${pokemon.id})">Remove</button>
            </article>
        `;
    });
}

window.removeFavorite = function (id) {
    let favorites = JSON.parse(localStorage.getItem('poke-favorites')) || [];
    favorites = favorites.filter(f => f.id !== id);
    localStorage.setItem('poke-favorites', JSON.stringify(favorites));
    renderFavorites();
};

/* ========================================= */
/* === 4. AESTHETICS & NOTIFICATIONS     === */
/* ========================================= */

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification fade-in";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("fade-in");
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

function createSparkle() {
    const emojis = ["✨", "🌸", "⭐", "☁️"];
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    const side = Math.random() > 0.5 ? "left" : "right";
    sparkle.style.left = side === "left" ? (Math.random() * 15 + "vw") : (Math.random() * 15 + 85 + "vw");
    sparkle.style.animationDuration = (Math.random() * 3 + 3) + "s";
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 6000);
}

async function fetchAllNames() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await res.json();
        allPokemonNames = data.results.map(p => p.name);
    } catch (e) {
        console.error("Failed to load suggestions.");
    }
}