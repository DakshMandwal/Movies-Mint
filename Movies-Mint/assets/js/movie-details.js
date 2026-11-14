
"use strict";

document.addEventListener("DOMContentLoaded", initializeMovieDetails);

function initializeMovieDetails() {
    const detailsContainer = document.getElementById("movie-details");
    const breadcrumbTitle = document.getElementById("breadcrumb-title");
    const relatedSection = document.getElementById("related-section");
    const relatedContainer = document.getElementById("related-movies");

    if (!detailsContainer) return;

    if (!Array.isArray(window.MOVIES)) {
        showDetailsError(
            detailsContainer,
            "Movie data could not be loaded. Check the movies.js script path."
        );
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        showDetailsError(
            detailsContainer,
            "No movie was selected. Please return to the movies page."
        );
        return;
    }

    const movie = window.MOVIES.find(
        (item) => String(item.id) === movieId
    );

    if (!movie) {
        showDetailsError(
            detailsContainer,
            "We couldn't find that movie. It may not exist in the movie catalogue."
        );
        return;
    }

    if (window.MovieMintStore) {
        window.MovieMintStore.addRecent(movie.id);
    }
    
    document.title = `${movie.title} | Movie Mint`;

    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = movie.title;
    }

    renderMovieDetails(detailsContainer, movie);
    renderRelatedMovies(movie, relatedSection, relatedContainer);
    initializePosterFallback(detailsContainer);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderMovieDetails(container, movie) {
    const title = escapeHTML(movie.title || "Untitled Movie");
    const year = escapeHTML(movie.year || "Year unavailable");
    const description = escapeHTML(
        movie.description || "No description is available for this movie yet."
    );

    const genres = Array.isArray(movie.genres) ? movie.genres : [];
    const genreMarkup = genres.length
        ? genres.map((genre) =>
            `<span class="genre-chip">${escapeHTML(genre)}</span>`
        ).join("")
        : '<span class="genre-chip">Genre unavailable</span>';

    const runtime = Number.isFinite(movie.runtime) && movie.runtime > 0
        ? `${movie.runtime} min`
        : "Runtime unavailable";

    const poster = escapeHTML(
        movie.poster || "assets/images/placeholders/poster-placeholder.svg"
    );

    const backdrop = escapeHTML(movie.backdrop || movie.poster || "");

    const movieId = encodeURIComponent(String(movie.id));

    container.innerHTML = `
        <div class="details-backdrop"
             ${backdrop ? `style="--movie-backdrop: url('${backdrop}')"` : ""}>
        </div>

        <div class="details-content">
            <div class="details-poster-wrap">
                <img
                    class="details-poster"
                    src="${poster}"
                    alt="Poster for ${title}"
                    data-fallback="assets/images/placeholders/poster-placeholder.svg"
                >
            </div>

            <div class="details-info">
                <p class="eyebrow">MOVIE MINT COLLECTION</p>

                <h1>${title}</h1>

                <div class="details-meta">
                    <span>${year}</span>
                    <span aria-hidden="true">•</span>
                    <span>${escapeHTML(runtime)}</span>
                </div>

                <div class="details-genres" aria-label="Genres">
                    ${genreMarkup}
                </div>

                <h2 class="description-heading">About this movie</h2>
                <p class="movie-description">${description}</p>

                
            <div class="details-actions">
                <a class="btn btn-primary"
                href="player.html?id=${movieId}">
                    <span aria-hidden="true">▶</span>
                    Watch Movie
                </a>

                <button class="btn btn-secondary"
                        type="button"
                        data-download-movie="${movieId}">
                    <span aria-hidden="true">↓</span>
                    Download Movie
                </button>
            </div>

            <p class="download-status" role="status" aria-live="polite"></p>

            <p class="details-note">
                Downloads are available for video files configured in this project.
                Only download files you have permission to access.
            </p>

            </div>
        </div>
    `;
}

function renderRelatedMovies(movie, section, container) {
    if (!section || !container || typeof window.renderMovieCard !== "function") {
        return;
    }

    const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];

    const relatedMovies = window.MOVIES
        .filter((candidate) => {
            if (String(candidate.id) === String(movie.id)) return false;

            const candidateGenres = Array.isArray(candidate.genres)
                ? candidate.genres
                : [];

            return candidateGenres.some((genre) => movieGenres.includes(genre));
        })
        .sort((a, b) => {
            const aGenres = Array.isArray(a.genres) ? a.genres : [];
            const bGenres = Array.isArray(b.genres) ? b.genres : [];

            const aMatches = aGenres.filter((genre) =>
                movieGenres.includes(genre)
            ).length;

            const bMatches = bGenres.filter((genre) =>
                movieGenres.includes(genre)
            ).length;

            return bMatches - aMatches;
        })
        .slice(0, 4);

    if (relatedMovies.length === 0) return;

    container.innerHTML = relatedMovies
        .map((relatedMovie) => window.renderMovieCard(relatedMovie))
        .join("");

    section.hidden = false;
}

function initializePosterFallback(container) {
    container.addEventListener("error", (event) => {
        const image = event.target;

        if (!(image instanceof HTMLImageElement)) return;
        if (!image.classList.contains("details-poster")) return;
        if (image.dataset.fallbackUsed === "true") return;

        image.dataset.fallbackUsed = "true";
        image.src = image.dataset.fallback;
    }, true);
}

function showDetailsError(container, message) {
    container.innerHTML = `
        <div class="details-error">
            <h1>Movie unavailable</h1>
            <p>${escapeHTML(message)}</p>
            <a class="btn btn-primary" href="movies.html">
                Back to Movies
            </a>
        </div>
    `;

    document.title = "Movie Unavailable | Movie Mint";
}
