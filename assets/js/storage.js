
"use strict";

(function () {
    const KEYS = {
        watchlist: "moviemint-watchlist-v1",
        progress: "moviemint-progress-v1",
        recent: "moviemint-recent-v1"
    };

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            console.warn("Movie Mint storage could not be read:", error);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn("Movie Mint storage could not be saved:", error);
            return false;
        }
    }

    function getMovie(id) {
        if (!Array.isArray(window.MOVIES)) return null;

        return window.MOVIES.find(
            (movie) => String(movie.id) === String(id)
        ) || null;
    }

    function getWatchlist() {
        const ids = read(KEYS.watchlist, []);
        return Array.isArray(ids) ? [...new Set(ids.map(String))] : [];
    }

    function isInWatchlist(id) {
        return getWatchlist().includes(String(id));
    }

    function toggleWatchlist(id) {
        const movie = getMovie(id);
        if (!movie) return false;

        const ids = getWatchlist();
        const movieId = String(id);
        const next = ids.includes(movieId)
            ? ids.filter((item) => item !== movieId)
            : [...ids, movieId];

        if (!write(KEYS.watchlist, next)) return false;

        window.dispatchEvent(new CustomEvent("moviemint:watchlistchange", {
            detail: { id: movieId, saved: next.includes(movieId) }
        }));

        return next.includes(movieId);
    }

    function getWatchlistMovies() {
        return getWatchlist()
            .map(getMovie)
            .filter(Boolean);
    }

    function getProgress() {
        const value = read(KEYS.progress, {});
        return value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};
    }

    function saveProgress(id, currentTime, duration) {
        const movie = getMovie(id);
        if (!movie || !Number.isFinite(currentTime)) return false;

        const progress = getProgress();
        const safeDuration = Number.isFinite(duration) && duration > 0
            ? duration
            : 0;

        // A finished movie is removed from Continue Watching.
        if (safeDuration > 0 && currentTime >= safeDuration - 5) {
            delete progress[String(id)];
        } else if (currentTime > 0) {
            progress[String(id)] = {
                time: Math.max(0, currentTime),
                duration: safeDuration,
                updatedAt: Date.now()
            };
        } else {
            return true;
        }

        const saved = write(KEYS.progress, progress);

        if (saved) {
            window.dispatchEvent(new CustomEvent("moviemint:progresschange", {
                detail: { id: String(id) }
            }));
        }

        return saved;
    }

    function getProgressFor(id) {
        return getProgress()[String(id)] || null;
    }

    function getContinueWatching() {
        const progress = getProgress();

        return Object.entries(progress)
            .map(([id, item]) => {
                const movie = getMovie(id);
                if (!movie || !item || !Number.isFinite(item.time)) {
                    return null;
                }

                const duration = Number.isFinite(item.duration)
                    ? item.duration
                    : 0;

                if (duration > 0 && item.time >= duration - 5) {
                    return null;
                }

                return {
                    movie,
                    time: item.time,
                    duration,
                    updatedAt: Number(item.updatedAt) || 0
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    function addRecent(id) {
        const movie = getMovie(id);
        if (!movie) return;

        const next = read(KEYS.recent, []);
        const ids = Array.isArray(next) ? next.map(String) : [];

        const updated = [
            String(id),
            ...ids.filter((item) => item !== String(id))
        ].slice(0, 10);

        write(KEYS.recent, updated);
    }

    function getRecentlyViewed() {
        const ids = read(KEYS.recent, []);
        return (Array.isArray(ids) ? ids : [])
            .map(getMovie)
            .filter(Boolean);
    }

    function clearProgress(id) {
        const progress = getProgress();
        delete progress[String(id)];
        write(KEYS.progress, progress);

        window.dispatchEvent(new CustomEvent("moviemint:progresschange", {
            detail: { id: String(id) }
        }));
    }

    window.MovieMintStore = {
        getMovie,
        getWatchlist,
        getWatchlistMovies,
        isInWatchlist,
        toggleWatchlist,
        saveProgress,
        getProgressFor,
        getContinueWatching,
        addRecent,
        getRecentlyViewed,
        clearProgress
    };
})();
