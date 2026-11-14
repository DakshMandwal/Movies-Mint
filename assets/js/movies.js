
/* ========================================
   MOVIE MINT — MOVIE BROWSING
   Search, genre filtering, sorting,
   and empty-state handling.
   ======================================== */

document.addEventListener("DOMContentLoaded", initializeMovieBrowser);

function initializeMovieBrowser() {
    const grid = document.getElementById("browse-movie-grid");

    // This script is loaded on the Movies page only.
    if (!grid) return;

    const searchInput = document.getElementById("movie-search");
    const genreFilter = document.getElementById("genre-filter");
    const sortFilter = document.getElementById("sort-filter");
    const clearButton = document.getElementById("clear-filters");
    const resultsCount = document.getElementById("results-count");

    if (
        !searchInput ||
        !genreFilter ||
        !sortFilter ||
        !clearButton ||
        !resultsCount
    ) {
        console.error("Movie Mint: A movie browser control is missing.");
        grid.textContent = "The movie browser could not be initialized.";
        return;
    }

    if (
        !Array.isArray(window.MOVIES) ||
        typeof window.renderMovieCard !== "function"
    ) {
        resultsCount.textContent = "Unable to load movies.";

        grid.textContent =
            "Movie data or the movie-card component could not be loaded. " +
            "Check the script paths in movies.html.";

        console.error(
            "Movie Mint: MOVIES data or renderMovieCard() is unavailable."
        );

        return;
    }

    const movies = window.MOVIES;

    populateGenreFilter(movies, genreFilter);

    // React to changes without reloading the page.
    searchInput.addEventListener("input", renderFilteredMovies);
    genreFilter.addEventListener("change", renderFilteredMovies);
    sortFilter.addEventListener("change", renderFilteredMovies);

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        genreFilter.value = "";
        sortFilter.value = "newest";

        renderFilteredMovies();
        searchInput.focus();
    });

    renderFilteredMovies();

    /* ---------- Populate genres ---------- */

    function populateGenreFilter(movieList, selectElement) {
        const genres = [
            ...new Set(
                movieList.flatMap(movie =>
                    Array.isArray(movie.genres) ? movie.genres : []
                )
            )
        ].sort((a, b) => a.localeCompare(b));

        genres.forEach(genre => {
            const option = document.createElement("option");

            option.value = genre;
            option.textContent = genre;

            selectElement.appendChild(option);
        });
    }

    /* ---------- Filter and sort ---------- */

    function getFilteredMovies() {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const selectedGenre = genreFilter.value;
        const sortOrder = sortFilter.value;

        const filteredMovies = movies.filter(movie => {
            const matchesTitle = movie.title
                .toLocaleLowerCase()
                .includes(query);

            const matchesGenre =
                !selectedGenre ||
                movie.genres.includes(selectedGenre);

            return matchesTitle && matchesGenre;
        });

        filteredMovies.sort((a, b) => {
            switch (sortOrder) {
                case "oldest":
                    return a.year - b.year ||
                        a.title.localeCompare(b.title);

                case "title-asc":
                    return a.title.localeCompare(b.title);

                case "title-desc":
                    return b.title.localeCompare(a.title);

                case "newest":
                default:
                    return b.year - a.year ||
                        a.title.localeCompare(b.title);
            }
        });

        return filteredMovies;
    }

    /* ---------- Render current results ---------- */

    function renderFilteredMovies() {
        const filteredMovies = getFilteredMovies();

        resultsCount.textContent =
            `${filteredMovies.length} ` +
            `${filteredMovies.length === 1 ? "movie" : "movies"} found`;

        grid.replaceChildren();

        if (filteredMovies.length === 0) {
            showEmptyState(grid);
            return;
        }

        grid.innerHTML = filteredMovies
            .map(movie => window.renderMovieCard(movie))
            .join("");

        initializePosterFallbacks(grid);
    }

    /* ---------- No-results message ---------- */

    function showEmptyState(container) {
        const emptyState = document.createElement("div");
        emptyState.className = "movie-empty-state";

        const heading = document.createElement("h3");
        heading.textContent = "No movies found";

        const message = document.createElement("p");
        message.textContent =
            "Try another title or genre, or clear your filters.";

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.className = "btn btn-primary";
        resetButton.textContent = "Clear filters";

        resetButton.addEventListener("click", () => {
            searchInput.value = "";
            genreFilter.value = "";
            sortFilter.value = "newest";

            renderFilteredMovies();
            searchInput.focus();
        });

        emptyState.append(heading, message, resetButton);
        container.appendChild(emptyState);
    }

    /* ---------- Missing poster fallback ---------- */

    function initializePosterFallbacks(container) {
        container.querySelectorAll(".movie-poster").forEach(image => {
            image.addEventListener("error", () => {
                const fallback = image.dataset.fallback;

                if (
                    !fallback ||
                    image.dataset.fallbackUsed === "true"
                ) {
                    return;
                }

                image.dataset.fallbackUsed = "true";
                image.src = fallback;
            });
        });
    }
}
