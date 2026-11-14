
"use strict";

document.addEventListener("click", handleMovieDownload);

function handleMovieDownload(event) {
    const button = event.target.closest(
        "[data-download-movie], [data-download-current]"
    );

    if (!button) return;

    event.preventDefault();

    const movieId = button.hasAttribute("data-download-current")
        ? new URLSearchParams(window.location.search).get("id")
        : button.dataset.downloadMovie;

    const statusElement =
        button.closest(".details-actions")?.parentElement
            ?.querySelector(".download-status") ||
        document.getElementById("download-status");

    if (!movieId || !Array.isArray(window.MOVIES)) {
        showDownloadStatus(
            statusElement,
            "Unable to identify the selected movie."
        );
        return;
    }

    const movie = window.MOVIES.find(
        (item) => String(item.id) === movieId
    );

    if (!movie) {
        showDownloadStatus(statusElement, "Movie not found.");
        return;
    }

    if (!movie.video || typeof movie.video !== "string") {
        showDownloadStatus(
            statusElement,
            "No video file is configured for this movie."
        );
        return;
    }

    let videoURL;

    try {
        videoURL = new URL(movie.video, document.baseURI);
    } catch {
        showDownloadStatus(statusElement, "The video path is invalid.");
        return;
    }

    if (
        !["http:", "https:"].includes(videoURL.protocol) ||
        videoURL.origin !== window.location.origin
    ) {
        showDownloadStatus(
            statusElement,
            "Downloads are supported only for video files hosted by this project."
        );
        return;
    }

    const filename = createDownloadFilename(
        movie.downloadFilename || `${movie.title || "movie"}.mp4`
    );

    const link = document.createElement("a");
    link.href = videoURL.href;
    link.download = filename;
    link.hidden = true;

    document.body.appendChild(link);
    link.click();
    link.remove();

    showDownloadStatus(
        statusElement,
        `Download requested for ${movie.title}. If it doesn't start, verify the MP4 path and try again.`
    );
}

function createDownloadFilename(filename) {
    let safeName = String(filename)
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
        .trim()
        .replace(/[. ]+$/g, "");

    if (!safeName) safeName = "movie";

    if (!/\.mp4$/i.test(safeName)) {
        safeName += ".mp4";
    }

    return safeName;
}

function showDownloadStatus(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        window.alert(message);
    }
}
