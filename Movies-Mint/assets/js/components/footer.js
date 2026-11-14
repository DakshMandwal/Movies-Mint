
function renderFooter() {
    const footerContainer = document.getElementById("site-footer");

    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="site-footer">
            <div class="footer-content">
                <a class="brand footer-brand" href="index.html">
                    <span class="brand-icon" aria-hidden="true">
                        <img src="assets/images/logo.jpg" alt="">
                    </span>
                    <span>Movie<span class="brand-accent">Mint</span></span>
                </a>

                <p>
                    A personal frontend movie-library project built
                    with HTML, CSS, and JavaScript.
                </p>

                <nav class="footer-links" aria-label="Footer navigation">
                    <a href="index.html">Home</a>
                    <a href="movies.html">Movies</a>
                </nav>

                <p class="copyright">
                    &copy; ${new Date().getFullYear()} Movie Mint.
                    Built for learning.
                </p>
            </div>
        </footer>
    `;
}

renderFooter();
