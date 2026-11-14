
"use strict";

document.addEventListener("DOMContentLoaded", initializeMoviePlayer);

function initializeMoviePlayer() {
    const video = document.getElementById("movie-video");
    const message = document.getElementById("player-message");
    const titleElement = document.getElementById("player-title");
    const subtitleElement = document.getElementById("player-subtitle");
    const breadcrumbElement = document.getElementById("player-breadcrumb-title");
    const backLink = document.getElementById("back-to-details");
    const statusElement = document.getElementById("playback-status");
    const speedSelect = document.getElementById("playback-speed");
    const fullscreenButton = document.getElementById("fullscreen-button");
    const descriptionElement = document.getElementById("player-description");
    const genresElement = document.getElementById("player-genres");

    if (!video || !message) return;

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!Array.isArray(window.MOVIES)) {
        showPlayerMessage(
            message,
            "Movie data could not be loaded. Check the movies.js script path."
        );
        setStatus(statusElement, "Movie data unavailable");
        return;
    }

    if (!movieId) {
        showPlayerMessage(
            message,
            "No movie was selected. Open the player from a movie's details page."
        );
        setStatus(statusElement, "No movie selected");
        return;
    }

    const movie = window.MOVIES.find(
        (item) => String(item.id) === movieId
    );

    if (!movie) {
        showPlayerMessage(
            message,
            "This movie could not be found in the catalogue."
        );
        setStatus(statusElement, "Movie unavailable");
        return;
    }

    document.title = `Watching ${movie.title} | Movie Mint`;

    titleElement.textContent = movie.title || "Untitled Movie";
    subtitleElement.textContent = [
        movie.year,
        Array.isArray(movie.genres) ? movie.genres.join(" · ") : ""
    ].filter(Boolean).join(" · ");

    breadcrumbElement.textContent = movie.title || "Player";
    backLink.href = `movie.html?id=${encodeURIComponent(String(movie.id))}`;

    descriptionElement.textContent =
        movie.description || "No description is available for this movie.";

    const genres = Array.isArray(movie.genres) ? movie.genres : [];

    genresElement.replaceChildren();

    genres.forEach((genre) => {
        const chip = document.createElement("span");
        chip.className = "player-genre-chip";
        chip.textContent = genre;
        genresElement.appendChild(chip);
    });

    if (!movie.video || typeof movie.video !== "string") {
        showPlayerMessage(
            message,
            "A video file has not been configured for this movie yet. Add its local MP4 path to the movie data."
        );
        setStatus(statusElement, "Video path missing");
        return;
    }

    // Resolve the configured path relative to the project page.
    const videoURL = new URL(movie.video, document.baseURI);

    // Only load local project files or HTTP(S) URLs.
    if (!["http:", "https:"].includes(videoURL.protocol)) {
        showPlayerMessage(message, "The configured video URL is not supported.");
        setStatus(statusElement, "Invalid video path");
        return;
    }

    video.addEventListener("loadstart", () => {
        showPlayerMessage(message, "Loading video...");
        setStatus(statusElement, "Loading video");
    });

    video.addEventListener("loadedmetadata", () => {
        hidePlayerMessage(message);
        setStatus(statusElement, "Video ready");
    });

    video.addEventListener("canplay", () => {
        hidePlayerMessage(message);
        setStatus(statusElement, "Ready to play");
    });

    video.addEventListener("playing", () => {
        hidePlayerMessage(message);
        setStatus(statusElement, "Playing");
    });

    video.addEventListener("waiting", () => {
        showPlayerMessage(message, "Buffering video...");
        setStatus(statusElement, "Buffering");
    });

    video.addEventListener("pause", () => {
        if (!video.ended && video.currentTime > 0) {
            setStatus(statusElement, "Paused");
        }
    });

    video.addEventListener("ended", () => {
        setStatus(statusElement, "Playback completed");
    });

    video.addEventListener("error", () => {
        const errorCode = video.error ? video.error.code : 0;

        let errorText = "The video could not be played.";

        if (errorCode === 2) {
            errorText = "A network or file-loading error occurred. Check the video path.";
        } else if (errorCode === 3) {
            errorText = "The video format could not be decoded by your browser.";
        } else if (errorCode === 4) {
            errorText = "This video format or file path is not supported.";
        }

        showPlayerMessage(
            message,
            `${errorText} Confirm that the MP4 file exists and can be played in your browser.`
        );

        setStatus(statusElement, "Playback error");
    });

    if (speedSelect) {
        speedSelect.addEventListener("change", () => {
            const speed = Number(speedSelect.value);

            if (Number.isFinite(speed) && speed > 0) {
                video.playbackRate = speed;
            }
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", async () => {
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    await video.requestFullscreen();
                } else if (video.webkitEnterFullscreen) {
                    // Safari fallback on supported devices.
                    video.webkitEnterFullscreen();
                } else {
                    setStatus(statusElement, "Fullscreen is not supported");
                }
            } catch (error) {
                console.error("Fullscreen request failed:", error);
                setStatus(statusElement, "Could not open fullscreen");
            }
        });

        document.addEventListener("fullscreenchange", () => {
            fullscreenButton.textContent = document.fullscreenElement
                ? "Exit fullscreen"
                : "Fullscreen";
        });
    }
    
    const resumeRequested = params.get("resume") === "1";
    let lastProgressSave = 0;

    video.addEventListener("loadedmetadata", () => {
        if (!window.MovieMintStore) return;

        if (resumeRequested) {
            const progress = window.MovieMintStore.getProgressFor(movie.id);

            if (
                progress &&
                Number.isFinite(progress.time) &&
                progress.time > 0 &&
                (!Number.isFinite(video.duration) ||
                    progress.time < video.duration - 3)
            ) {
                video.currentTime = progress.time;
                setStatus(statusElement, "Ready to resume");
            }
        }
    });

    video.addEventListener("timeupdate", () => {
        if (!window.MovieMintStore) return;

        // Avoid writing to localStorage on every video time update.
        const now = Date.now();
        if (now - lastProgressSave < 5000) return;

        lastProgressSave = now;

        window.MovieMintStore.saveProgress(
            movie.id,
            video.currentTime,
            Number.isFinite(video.duration) ? video.duration : 0
        );
    });

    video.addEventListener("pause", () => {
        if (!window.MovieMintStore) return;

        window.MovieMintStore.saveProgress(
            movie.id,
            video.currentTime,
            Number.isFinite(video.duration) ? video.duration : 0
        );
    });

    window.addEventListener("pagehide", () => {
        if (!window.MovieMintStore) return;

        window.MovieMintStore.saveProgress(
            movie.id,
            video.currentTime,
            Number.isFinite(video.duration) ? video.duration : 0
        );
    });


    video.src = videoURL.href;
    video.load();
}

function showPlayerMessage(container, text) {
    container.textContent = "";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    container.appendChild(paragraph);
    container.hidden = false;
}

function hidePlayerMessage(container) {
    container.hidden = true;
}

function setStatus(element, text) {
    if (element) {
        element.textContent = text;
    }
}
