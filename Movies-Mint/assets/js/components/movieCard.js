
/* ========================================
   MOVIE MINT — REUSABLE MOVIE CARD
   ======================================== */

window.renderMovieCard = function renderMovieCard(movie) {
    if (!movie || !movie.id || !movie.title) {
        return "";
    }

    const escapeHTML = (value) =>
        String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const title = escapeHTML(movie.title);
    const id = encodeURIComponent(movie.id);
    const year = escapeHTML(movie.year);
    const genres = Array.isArray(movie.genres)
        ? movie.genres.map(escapeHTML).join(" · ")
        : "Genre unavailable";

    const poster = escapeHTML(
        movie.poster || "assets/images/placeholders/poster-placeholder.svg"
    );

    const runtime = Number.isFinite(movie.runtime) && movie.runtime > 0
        ? `${movie.runtime} min`
        : "";

    const quality = movie.quality
        ? escapeHTML(movie.quality)
        : "";

    return `
        <article class="movie-card">
            <div class="movie-poster-wrap">
                <img
                    class="movie-poster"
                    src="${poster}"
                    alt="${title} poster"
                    loading="lazy"
                    data-fallback="assets/images/placeholders/poster-placeholder.svg"
                >

                ${quality ? `
                    <span class="quality-badge">${quality}</span>
                ` : ""}

                <span class="poster-play-icon" aria-hidden="true">▶</span>
            </div>

            <div class="movie-card-body">
                <div class="movie-card-heading">
                    <h3 class="movie-title" title="${title}">${title}</h3>
                    <span class="movie-year">${year}</span>
                </div>

                <p class="movie-genres">${genres}</p>

                <div class="movie-card-meta">
                    ${runtime ? `<span>${runtime}</span>` : ""}
                    <span class="movie-meta-dot" aria-hidden="true">•</span>
                    <span>${genres.split(" · ")[0]}</span>
                </div>

                <div class="movie-card-actions">
                    <a
                        class="card-action card-action-primary"
                        href="movie.html?id=${id}"
                        aria-label="View details for ${title}"
                    >Details</a>

                    <a
    class="card-action card-action-secondary"
    href="player.html?id=${encodeURIComponent(movie.id)}"
    aria-label="Watch ${title}"
>▶ Watch</a>

                    <button
                        class="watchlist-toggle"
                        type="button"
                        data-watchlist-toggle="${id}"
                        aria-pressed="false"
                        aria-label="Add ${title} to My Watchlist"
                    >+ Watchlist</button>
                </div>
            </div>
        </article>
    `;
};
