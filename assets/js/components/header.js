
function renderHeader() {
    const headerContainer = document.getElementById("site-header");

    // Some pages may not include the shared header.
    if (!headerContainer) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const links = [
        { label: "Home", href: "index.html" },
        { label: "Movies", href: "movies.html" },
        { label: "My Watchlist", href: "watchlist.html" }
    ];

    headerContainer.innerHTML = `
        <header class="site-header">
            <div class="nav-container">
                <a class="brand" href="index.html" aria-label="Movie Mint home">
                    <span class="brand-icon" aria-hidden="true">
                        <img src="assets/images/logo.jpg" alt="">
                    </span>
                    <span>Movie<span class="brand-accent">Mint</span></span>
                </a>

                <button
                    class="menu-toggle"
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded="false"
                    aria-controls="primary-navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav class="primary-navigation" id="primary-navigation"
                     aria-label="Main navigation">
                    ${links.map(link => `
                        <a
                            class="nav-link ${currentPage === link.href ? "active" : ""}"
                            href="${link.href}"
                            ${currentPage === link.href ? 'aria-current="page"' : ""}
                        >${link.label}</a>
                    `).join("")}
                </nav>

                <span class="nav-tagline">YOUR NEXT FAVORITE FILM</span>
            </div>
        </header>
    `;
}

renderHeader();
