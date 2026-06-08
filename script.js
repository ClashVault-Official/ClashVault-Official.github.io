/**
 * ClashVault - Clash Royale Deck Viewer
 * Using raw GitHub URLs with correct naming convention
 * Pattern: lowercase, hyphens, -ev1 for evolutions
 */

// ============================================
// CORRECT URL PATTERN FOR CARD IMAGES
// ============================================
const CARD_BASE_URL = "https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/cards/";

function getCardImageUrl(cardName) {
    if (!cardName) return null;
    
    // Use local log.png
    if (cardName === 'log' || cardName === 'log-ev1') {
        return 'assets/cr/cards/log.png';
    }
    
    let fileName = cardName.toLowerCase();
    
    // Special cases that need conversion
    const specialMappings = {
        'three-musketeers': '3-musketeers',
        'elixir-pump': 'elixir-collector',
        'spear-goblins': 'spear-goblins',
        'goblin-gang': 'goblin-gang',
        'skeleton-army': 'skeleton-army',
        'goblin-barrel': 'goblin-barrel',
        'battle-ram': 'battle-ram',
        'wall-breakers': 'wall-breakers',
        'royal-giant': 'royal-giant',
        'royal-hogs': 'royal-hogs',
        'royal-recruits': 'royal-recruits',
        'barbarian-barrel': 'barbarian-barrel',
        'electro-giant': 'electro-giant',
        'goblin-giant': 'goblin-giant',
        'elixir-golem': 'elixir-golem',
        'battle-healer': 'battle-healer',
        'electro-dragon': 'electro-dragon',
        'goblin-drill': 'goblin-drill',
        'heal-spirit': 'heal-spirit',
        'ice-spirit': 'ice-spirit',
        'fire-spirit': 'fire-spirit',
        'mega-minion': 'mega-minion',
        'dark-prince': 'dark-prince',
        'baby-dragon': 'baby-dragon',
        'giant-skeleton': 'giant-skeleton',
        'skeleton-king': 'skeleton-king',
        'little-prince': 'little-prince',
        'archer-queen': 'archer-queen',
        'golden-knight': 'golden-knight',
        'mighty-miner': 'mighty-miner',
        'mother-witch': 'mother-witch',
        'magic-archer': 'magic-archer',
        'lava-hound': 'lava-hound',
        'mega-knight': 'mega-knight',
        'inferno-dragon': 'inferno-dragon',
        'inferno-tower': 'inferno-tower',
        'night-witch': 'night-witch',
        'electro-wizard': 'electro-wizard',
        'ice-wizard': 'ice-wizard',
        'ram-rider': 'ram-rider',
        'royal-ghost': 'royal-ghost',
        'cannon-cart': 'cannon-cart',
        'skeleton-barrel': 'skeleton-barrel',
        'elite-barbarians': 'elite-barbarians',
        'goblin-demolisher': 'goblin-demolisher',
        'goblin-stein': 'goblin-stein',
        'tower-princess': 'tower-princess',
        'void': 'void',
        'phoenix': 'phoenix',
        'monk': 'monk'
    };
    
    if (specialMappings[fileName]) {
        fileName = specialMappings[fileName];
    }
    
    return `${CARD_BASE_URL}${fileName}.png`;
}

// ============================================
// SMART SEARCH FUNCTIONALITY
// ============================================

// Arena name mapping for smart search
const ARENA_NAMES = {
    1: 'Goblin Stadium',
    2: 'Bone Pit', 
    3: 'Barbarian Bowl',
    4: "P.E.K.K.A's Playhouse",
    5: 'Spell Valley',
    6: "Builder's Workshop",
    7: 'Royal Arena',
    8: 'Frozen Peak',
    9: 'Jungle Arena',
    10: 'Hog Mountain',
    11: 'Electro Valley',
    12: 'Spooky Town',
    13: "Rascal's Hideout",
    14: 'Serenity Peak'
};

// Deck type keywords for better search
const DECK_TYPES = {
    'beatdown': ['golem', 'goblin-giant', 'lava-hound', 'pekka', 'giant', 'royal-giant', 'e-giant', 'electro-giant'],
    'cycle': ['hog-rider', 'x-bow', 'mortar', 'miner', 'wall-breakers', '2.6', '2.9', '3.0'],
    'control': ['miner', 'graveyard', 'poison', 'rocket', 'ice-wizard', 'tornado'],
    'bait': ['goblin-barrel', 'princess', 'goblin-gang', 'log-bait', 'zap-bait'],
    'bridge spam': ['pekka', 'bandit', 'battle-ram', 'royal-ghost', 'bridge-spam'],
    'siege': ['x-bow', 'mortar', 'rocket'],
    'swarm': ['skeleton-army', 'goblin-gang', 'minion-horde', 'bats', 'swarm']
};

// Arena detection
function isArenaPage() {
    return window.location.pathname.includes('/arena/') || window.location.pathname.includes('arena.html');
}

// Global variables
let searchTimeout = null;
let allDecks = [];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const hasArenaGrid = document.getElementById('arena-grid');
    const hasDeckContainer = document.getElementById('deck-container');
    
    if (hasArenaGrid) {
        initializeHomepage();
        loadTrendingDecks();
        setupSearch();
    } else if (hasDeckContainer) {
        setupArenaPage();
    }
});

function setupArenaPage() {
    let arenaNum = 1;
    const urlMatch = window.location.pathname.match(/arena(\d+)\.html/);
    if (urlMatch) {
        arenaNum = parseInt(urlMatch[1]);
    }
    
    const arenaKey = `arena${arenaNum}`;
    loadArenaDecks(arenaKey);
}

function loadArenaDecks(arenaKey) {
    if (typeof window.crDecks === 'undefined') {
        setTimeout(() => loadArenaDecks(arenaKey), 100);
        return;
    }
    
    const container = document.getElementById('deck-container');
    if (!container) return;
    
    const decks = window.crDecks[arenaKey];
    if (!decks || !decks.length) {
        container.innerHTML = '<div class="trending-skeleton">No decks available for this arena yet.</div>';
        return;
    }
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    decks.forEach((deck, index) => {
        const card = createDeckCard(deck, index + 1);
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

function createDeckCard(deck, rank) {
    const card = document.createElement('div');
    card.className = 'trending-card';
    
    const rankBadge = document.createElement('div');
    rankBadge.className = 'trending-rank';
    rankBadge.textContent = `#${rank}`;
    
    const header = document.createElement('div');
    header.className = 'trending-header';
    
    const name = document.createElement('div');
    name.className = 'trending-name';
    name.textContent = deck.deckName || `Meta Deck ${rank}`;
    
    const elixir = document.createElement('div');
    elixir.className = 'trending-elixir';
    elixir.innerHTML = `<span class="elixir-icon"></span> ${deck.avgElixir || '3.5'}`;
    
    header.appendChild(name);
    header.appendChild(elixir);
    
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'trending-cards';
    
    if (deck.cards && Array.isArray(deck.cards)) {
        deck.cards.forEach(cardName => {
            const slot = document.createElement('div');
            slot.className = 'trending-card-slot';
            
            if (cardName && cardName.trim()) {
                const img = document.createElement('img');
                const imageUrl = getCardImageUrl(cardName);
                img.src = imageUrl;
                img.alt = cardName;
                img.loading = 'lazy';
                
                img.onerror = () => {
                    img.style.display = 'none';
                    let shortName = cardName.substring(0, 2).toUpperCase();
                    if (cardName.includes('ev1')) shortName = shortName + 'E';
                    slot.textContent = shortName;
                    slot.style.fontSize = '0.7rem';
                    slot.style.fontWeight = 'bold';
                    slot.style.color = '#ffd700';
                    slot.style.display = 'flex';
                    slot.style.alignItems = 'center';
                    slot.style.justifyContent = 'center';
                    slot.style.backgroundColor = '#1a1a1a';
                    slot.style.borderRadius = '12px';
                };
                
                slot.appendChild(img);
            } else {
                slot.classList.add('empty');
                slot.textContent = '?';
                slot.style.display = 'flex';
                slot.style.alignItems = 'center';
                slot.style.justifyContent = 'center';
                slot.style.color = '#666';
            }
            cardsGrid.appendChild(slot);
        });
    }
    
    const footer = document.createElement('div');
    footer.className = 'trending-footer';
    
    const tryBtn = document.createElement('button');
    tryBtn.className = 'trending-try-btn';
    tryBtn.textContent = 'Try in Game';
    tryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openInClashRoyale(deck.copyLink, deck.deckName);
    });
    
    footer.appendChild(tryBtn);
    
    card.appendChild(rankBadge);
    card.appendChild(header);
    card.appendChild(cardsGrid);
    card.appendChild(footer);
    
    return card;
}

function initializeHomepage() {
    const gridContainer = document.getElementById('arena-grid');
    if (!gridContainer) return;
    
    const ARENAS = [
        { num: 1, name: 'Goblin Stadium', path: 'arena/arena1.html' },
        { num: 2, name: 'Bone Pit', path: 'arena/arena2.html' },
        { num: 3, name: 'Barbarian Bowl', path: 'arena/arena3.html' },
        { num: 4, name: "P.E.K.K.A's Playhouse", path: 'arena/arena4.html' },
        { num: 5, name: 'Spell Valley', path: 'arena/arena5.html' },
        { num: 6, name: "Builder's Workshop", path: 'arena/arena6.html' },
        { num: 7, name: 'Royal Arena', path: 'arena/arena7.html' },
        { num: 8, name: 'Frozen Peak', path: 'arena/arena8.html' },
        { num: 9, name: 'Jungle Arena', path: 'arena/arena9.html' },
        { num: 10, name: 'Hog Mountain', path: 'arena/arena10.html' },
        { num: 11, name: 'Electro Valley', path: 'arena/arena11.html' },
        { num: 12, name: 'Spooky Town', path: 'arena/arena12.html' },
        { num: 13, name: "Rascal's Hideout", path: 'arena/arena13.html' },
        { num: 14, name: 'Serenity Peak', path: 'arena/arena14.html' }
    ];
    
    gridContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    ARENAS.forEach(arena => {
        const card = createArenaCard(arena);
        fragment.appendChild(card);
    });
    
    gridContainer.appendChild(fragment);
}

function createArenaCard(arena) {
    const card = document.createElement('a');
    card.className = 'arena-card';
    card.href = arena.path;
    card.setAttribute('data-arena', arena.num);
    
    const bgDiv = document.createElement('div');
    bgDiv.className = 'arena-bg';
    bgDiv.style.backgroundImage = `url('assets/cr/arena${arena.num}.png')`;
    bgDiv.style.backgroundSize = 'cover';
    bgDiv.style.backgroundPosition = 'center';
    
    const overlay = document.createElement('div');
    overlay.className = 'arena-overlay';
    
    const badge = document.createElement('div');
    badge.className = 'arena-badge';
    badge.textContent = `ARENA ${arena.num.toString().padStart(2, '0')}`;
    
    const info = document.createElement('div');
    info.className = 'arena-info';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'arena-name';
    nameSpan.textContent = arena.name;
    
    info.appendChild(nameSpan);
    
    bgDiv.appendChild(overlay);
    bgDiv.appendChild(badge);
    bgDiv.appendChild(info);
    card.appendChild(bgDiv);
    
    return card;
}

function loadTrendingDecks() {
    if (typeof window.crDecks === 'undefined') {
        setTimeout(loadTrendingDecks, 100);
        return;
    }
    
    const arena14Decks = window.crDecks['arena14'];
    if (!arena14Decks || !arena14Decks.length) {
        const trendingGrid = document.getElementById('trending-grid');
        if (trendingGrid) trendingGrid.innerHTML = '<div class="trending-skeleton">No trending decks available</div>';
        return;
    }
    
    // Store all decks for search
    allDecks = [];
    for (const arena in window.crDecks) {
        if (window.crDecks[arena]) {
            window.crDecks[arena].forEach(deck => {
                allDecks.push({
                    ...deck,
                    arenaKey: arena,
                    arenaNum: parseInt(arena.replace('arena', ''))
                });
            });
        }
    }
    
    renderTrendingDecks(arena14Decks.slice(0, 4));
}

function renderTrendingDecks(decks) {
    const container = document.getElementById('trending-grid');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    decks.forEach((deck, index) => {
        const card = createTrendingCard(deck, index + 1);
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

function createTrendingCard(deck, rank) {
    const card = document.createElement('div');
    card.className = 'trending-card';
    
    const rankBadge = document.createElement('div');
    rankBadge.className = 'trending-rank';
    rankBadge.textContent = `#${rank}`;
    
    const header = document.createElement('div');
    header.className = 'trending-header';
    
    const name = document.createElement('div');
    name.className = 'trending-name';
    name.textContent = deck.deckName || `Top Meta Deck ${rank}`;
    
    const elixir = document.createElement('div');
    elixir.className = 'trending-elixir';
    elixir.innerHTML = `<span class="elixir-icon"></span> ${deck.avgElixir || '3.5'}`;
    
    header.appendChild(name);
    header.appendChild(elixir);
    
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'trending-cards';
    
    if (deck.cards && Array.isArray(deck.cards)) {
        deck.cards.forEach(cardName => {
            const slot = document.createElement('div');
            slot.className = 'trending-card-slot';
            
            if (cardName && cardName.trim()) {
                const img = document.createElement('img');
                img.src = getCardImageUrl(cardName);
                img.alt = cardName;
                img.loading = 'lazy';
                
                img.onerror = () => {
                    img.style.display = 'none';
                    let shortName = cardName.substring(0, 2).toUpperCase();
                    if (cardName.includes('ev1')) shortName = shortName + 'E';
                    slot.textContent = shortName;
                    slot.style.fontSize = '0.7rem';
                    slot.style.fontWeight = 'bold';
                    slot.style.color = '#ffd700';
                    slot.style.display = 'flex';
                    slot.style.alignItems = 'center';
                    slot.style.justifyContent = 'center';
                    slot.style.backgroundColor = '#1a1a1a';
                    slot.style.borderRadius = '12px';
                };
                
                slot.appendChild(img);
            } else {
                slot.classList.add('empty');
                slot.textContent = '?';
                slot.style.display = 'flex';
                slot.style.alignItems = 'center';
                slot.style.justifyContent = 'center';
                slot.style.color = '#666';
            }
            cardsGrid.appendChild(slot);
        });
    }
    
    const footer = document.createElement('div');
    footer.className = 'trending-footer';
    
    const tryBtn = document.createElement('button');
    tryBtn.className = 'trending-try-btn';
    tryBtn.textContent = 'Try in Game';
    tryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openInClashRoyale(deck.copyLink, deck.deckName);
    });
    
    footer.appendChild(tryBtn);
    
    card.appendChild(rankBadge);
    card.appendChild(header);
    card.appendChild(cardsGrid);
    card.appendChild(footer);
    
    return card;
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!searchInput) return;
    
    // Set high z-index on container
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.style.zIndex = '10000';
    }
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length > 0) {
            searchClear.style.display = 'flex';
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(query), 300);
        } else {
            searchClear.style.display = 'none';
            hideSuggestions();
        }
    });
    
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        hideSuggestions();
        showToast('Search cleared', 'info');
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });
}

function performSearch(query) {
    if (!allDecks.length) return;
    
    const searchTerm = query.toLowerCase().trim();
    
    const results = allDecks.filter(deck => {
        const deckName = (deck.deckName || '').toLowerCase();
        const arenaName = ARENA_NAMES[deck.arenaNum].toLowerCase();
        const deckCards = deck.cards || [];
        
        // Arena number search (e.g., "arena 10")
        const arenaMatch = searchTerm.match(/arena\s*(\d+)/i);
        if (arenaMatch && deck.arenaNum === parseInt(arenaMatch[1])) {
            return true;
        }
        
        // Arena name search (e.g., "goblin stadium")
        if (arenaName.includes(searchTerm)) {
            return true;
        }
        
        // Card search
        for (const card of deckCards) {
            if (card && card.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }
        
        // Deck type search (beatdown, cycle, bait, etc.)
        for (const [type, keywords] of Object.entries(DECK_TYPES)) {
            if (searchTerm.includes(type)) {
                for (const keyword of keywords) {
                    if (deckName.includes(keyword) || deckCards.some(c => c && c.includes(keyword))) {
                        return true;
                    }
                }
            }
        }
        
        // Deck name search
        return deckName.includes(searchTerm);
    });
    
    displaySuggestions(results.slice(0, 10), searchTerm);
}

function displaySuggestions(results, query) {
    const container = document.getElementById('search-suggestions');
    if (!container) return;
    
    if (results.length === 0) {
        hideSuggestions();
        showToast(`No results found for "${query}"`, 'info');
        return;
    }
    
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.position = 'absolute';
    container.style.top = '100%';
    container.style.left = '0';
    container.style.right = '0';
    container.style.zIndex = '99999';
    
    results.forEach(deck => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const textContainer = document.createElement('div');
        textContainer.style.flex = '1';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'suggestion-name';
        nameSpan.textContent = deck.deckName || 'Unnamed Deck';
        nameSpan.style.display = 'block';
        
        const arenaSpan = document.createElement('span');
        arenaSpan.className = 'suggestion-arena';
        arenaSpan.textContent = ARENA_NAMES[deck.arenaNum] || `Arena ${deck.arenaNum}`;
        arenaSpan.style.fontSize = '0.65rem';
        arenaSpan.style.color = '#ffd700';
        arenaSpan.style.background = 'rgba(255,215,0,0.1)';
        arenaSpan.style.padding = '0.2rem 0.6rem';
        arenaSpan.style.borderRadius = '20px';
        arenaSpan.style.display = 'inline-block';
        arenaSpan.style.marginTop = '0.25rem';
        
        // Card preview
        const cardsPreview = document.createElement('div');
        cardsPreview.className = 'suggestion-cards';
        if (deck.cards && deck.cards.length) {
            const previewCards = deck.cards.slice(0, 3).map(c => {
                let short = c.substring(0, 2).toUpperCase();
                if (c.includes('ev1')) short = short + 'E';
                return short;
            }).join(' · ');
            cardsPreview.textContent = previewCards;
            cardsPreview.style.fontSize = '0.6rem';
            cardsPreview.style.color = '#888';
            cardsPreview.style.marginTop = '0.2rem';
        }
        
        textContainer.appendChild(nameSpan);
        textContainer.appendChild(cardsPreview);
        textContainer.appendChild(arenaSpan);
        
        item.appendChild(textContainer);
        
        item.addEventListener('click', () => {
            window.location.href = `arena/arena${deck.arenaNum}.html`;
        });
        
        container.appendChild(item);
    });
    
    // Search tip
    const tipItem = document.createElement('div');
    tipItem.className = 'suggestion-tip';
    tipItem.innerHTML = '💡 Try: "arena 10", "pekka", "cycle", "log bait"';
    tipItem.style.fontSize = '0.65rem';
    tipItem.style.padding = '0.5rem';
    tipItem.style.color = '#888';
    tipItem.style.textAlign = 'center';
    tipItem.style.borderTop = '1px solid rgba(255,215,0,0.1)';
    container.appendChild(tipItem);
}

function hideSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function openInClashRoyale(link, deckName) {
    if (!link) {
        showToast('No link available for this deck', 'error');
        return;
    }
    
    showToast(`Opening ${deckName || 'deck'} in Clash Royale...`, 'info');
    window.location.href = link;
    
    if (navigator.vibrate) navigator.vibrate(50);
}

let toastTimeout = null;

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    
    toast.classList.remove('show');
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    const iconMap = { success: '✓', error: '⚠', info: '🔍' };
    const borderMap = { success: '#ffd700', error: '#ff4444', info: '#9b4dff' };
    
    if (toastIcon) toastIcon.textContent = iconMap[type] || iconMap.success;
    toast.style.borderColor = borderMap[type] || borderMap.success;
    if (toastMessage) toastMessage.textContent = message;
    
    toast.style.display = 'flex';
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast && !toast.classList.contains('show')) {
                toast.style.display = 'none';
            }
        }, 300);
        toastTimeout = null;
    }, 2500);
}