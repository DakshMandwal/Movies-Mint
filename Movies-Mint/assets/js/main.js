
/* ========================================
   MOVIE MINT — SHARED PAGE INTERACTIONS
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeMobileNavigation();
    initializeHomepage();
});

/* ---------- Mobile navigation ---------- */

function initializeMobileNavigation() {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#primary-navigation");

    if (!menuButton || !navigation) return;

    function closeMenu() {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 640) {
            closeMenu();
        }
    });
}

/* ---------- Homepage rendering ---------- */

function initializeHomepage() {
    // Other pages reuse main.js but do not have homepage collections.
    const trendingContainer = document.getElementById("trending-movies");

    if (!trendingContainer) return;

    if (!Array.isArray(window.MOVIES) ||
        typeof window.renderMovieCard !== "function") {
        showCollectionMessage(
            trendingContainer,
            "Movie data could not be loaded. Check your JavaScript file paths."
        );
        return;
    }

    const movies = window.MOVIES;

    renderFeaturedMovie(movies);

    renderCollection(
        "trending-movies",
        movies.filter(movie => movie.trending)
    );

    renderCollection(
        "scifi-movies",
        movies.filter(movie => movie.genres.includes("Sci-Fi"))
    );

    renderCollection(
        "action-movies",
        movies.filter(movie => movie.genres.includes("Action"))
    );

    renderCollection(
        "animation-movies",
        movies.filter(movie => movie.genres.includes("Animation"))
    );

    renderCollection(
        "comedy-movies",
        movies.filter(movie => movie.genres.includes("Comedy"))
    );

    renderCollection(
        "thriller-movies",
        movies.filter(movie => movie.genres.includes("Thriller"))
    );

    initializeImageFallbacks();
}

/* ---------- Featured movie ---------- */

function renderFeaturedMovie(movies) {
    const featuredMovie = movies.find(movie => movie.featured);

    if (!featuredMovie) return;

    const title = document.getElementById("hero-title");
    const year = document.getElementById("hero-year");
    const runtime = document.getElementById("hero-runtime");
    const genres = document.getElementById("hero-genres");
    const description = document.getElementById("hero-description");
    const poster = document.getElementById("hero-poster");
    const detailsLink = document.getElementById("hero-details-link");

    if (title) title.textContent = featuredMovie.title;
    if (year) year.textContent = String(featuredMovie.year);
    if (runtime) runtime.textContent = `${featuredMovie.runtime} min`;

    if (genres) {
        genres.textContent = featuredMovie.genres.join(" · ");
    }

    if (description) {
        description.textContent = featuredMovie.description;
    }

    if (poster) {
        poster.src = featuredMovie.poster;
        poster.alt = "";
        poster.dataset.fallback =
            "assets/images/placeholders/poster-placeholder.svg";
    }

    if (detailsLink) {
        detailsLink.href =
            `movie.html?id=${encodeURIComponent(featuredMovie.id)}`;
    }
}

/* ---------- Movie collections ---------- */

function renderCollection(containerId, movies) {
    const container = document.getElementById(containerId);

    if (!container) return;

    if (movies.length === 0) {
        showCollectionMessage(container, "No movies in this collection yet.");
        return;
    }

    container.innerHTML = movies
        .map(movie => window.renderMovieCard(movie))
        .join("");
}

function showCollectionMessage(container, message) {
    if (!container) return;

    const paragraph = document.createElement("p");
    paragraph.className = "collection-message";
    paragraph.textContent = message;

    container.replaceChildren(paragraph);
}

/* ---------- Missing image handling ---------- */

function initializeImageFallbacks() {
    document.addEventListener("error", (event) => {
        const image = event.target;

        if (!(image instanceof HTMLImageElement)) return;

        const fallback = image.dataset.fallback;

        if (!fallback || image.dataset.fallbackUsed === "true") return;

        image.dataset.fallbackUsed = "true";
        image.src = fallback;
    }, true);
}

const heroWatchButton = document.getElementById("hero-watch-button");

if (heroWatchButton) {
    heroWatchButton.addEventListener("click", () => {
        const featuredMovie = window.MOVIES?.find(
            movie => movie.featured
        );

        if (featuredMovie) {
            window.location.href =
                `player.html?id=${encodeURIComponent(featuredMovie.id)}`;
        } else {
            console.error("Movie Mint: Featured movie not found.");
        }
    });
}
