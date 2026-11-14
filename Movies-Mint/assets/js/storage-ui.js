
"use strict";

document.addEventListener("DOMContentLoaded", initializeStorageUI);

function initializeStorageUI() {
    const store = window.MovieMintStore;
    if (!store) return;

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-watchlist-toggle]");
        if (!button) return;

        
        const id = button.dataset.watchlistToggle;
        const wasSaved = store.isInWatchlist(id);
        const saved = store.toggleWatchlist(id);

        if (!wasSaved && !saved && !store.isInWatchlist(id)) {
            button.textContent = "Could not save";
            return;
        }

        refreshWatchlistButtons();
        renderWatchlistPage();

    });

    window.addEventListener("moviemint:watchlistchange", () => {
        refreshWatchlistButtons();
        renderWatchlistPage();
    });

    window.addEventListener("moviemint:progresschange", () => {
        renderContinueWatching();
    });

    refreshWatchlistButtons();
    renderWatchlistPage();
    renderContinueWatching();
    renderRecentlyViewed();
}

function refreshWatchlistButtons() {
    const store = window.MovieMintStore;
    if (!store) return;

    document.querySelectorAll("[data-watchlist-toggle]").forEach((button) => {
        const id = button.dataset.watchlistToggle;
        const saved = store.isInWatchlist(id);

        button.setAttribute("aria-pressed", String(saved));
        button.textContent = saved ? "✓ In Watchlist" : "+ Watchlist";
        button.setAttribute(
            "aria-label",
            saved ? "Remove from My Watchlist" : "Add to My Watchlist"
        );
    });
}

function renderWatchlistPage() {
    const container = document.getElementById("watchlist-movies");
    if (!container) return;

    const store = window.MovieMintStore;
    if (!store || typeof window.renderMovieCard !== "function") return;

    const movies = store.getWatchlistMovies();

    container.innerHTML = movies.length
        ? movies.map((movie) => window.renderMovieCard(movie)).join("")
        : `<div class="storage-empty">
               <h2>Your watchlist is empty</h2>
               <p>Save movies using the + Watchlist button to find them here.</p>
               <a class="btn btn-primary" href="movies.html">Explore Movies</a>
           </div>`;

    refreshWatchlistButtons();
}

function renderContinueWatching() {
    const container = document.getElementById("continue-watching-movies");
    const section = document.getElementById("continue-watching-section");

    if (!container) return;

    const store = window.MovieMintStore;
    if (!store || typeof window.renderMovieCard !== "function") return;

    const items = store.getContinueWatching();

    container.innerHTML = items.length
        ? items.map(({ movie, time, duration }) => {
            const percent = duration > 0
                ? Math.min(100, Math.max(0, (time / duration) * 100))
                : 0;

            const safePercent = Number(percent.toFixed(2));
            const card = window.renderMovieCard(movie);

            return `
                <div class="continue-card">
                    ${card}
                    <div class="progress-info">
                        <div class="progress-track"
                             role="progressbar"
                             aria-label="Playback progress for ${escapeStorageHTML(movie.title)}"
                             aria-valuemin="0"
                             aria-valuemax="100"
                             aria-valuenow="${Math.round(safePercent)}">
                            <span style="width: ${safePercent}%"></span>
                        </div>
                        <p>${formatStorageTime(time)} watched</p>
                        <a class="resume-link"
                           href="player.html?id=${encodeURIComponent(String(movie.id))}&resume=1">
                            ▶ Resume watching
                        </a>
                    </div>
                </div>
            `;
        }).join("")
        : "";

    if (section) section.hidden = items.length === 0;
}

function renderRecentlyViewed() {
    const container = document.getElementById("recently-viewed-movies");
    const section = document.getElementById("recently-viewed-section");

    if (!container) return;

    const store = window.MovieMintStore;
    if (!store || typeof window.renderMovieCard !== "function") return;

    const movies = store.getRecentlyViewed();

    container.innerHTML = movies.length
        ? movies.map((movie) => window.renderMovieCard(movie)).join("")
        : "";

    if (section) section.hidden = movies.length === 0;

    refreshWatchlistButtons();
}

function formatStorageTime(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const remainingSeconds = value % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
}

function escapeStorageHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
