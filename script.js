const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const postsContainer = document.querySelector(".post-container");
const navLinks = document.querySelectorAll(".nav-link");

let selectedCategory = "all";
let allArticles = [];

async function fetchArticles(category = "general") {
    postsContainer.innerHTML = "<p>Loading articles...</p>";

    try {
        const params = new URLSearchParams({
            category: category,
            country: "in",
            lang: "en",
            max: "10",
            apikey: API_KEY
        });

        const response = await fetch(
            `https://gnews.io/api/v4/top-headlines?${params}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.errors ? data.errors.join(", ") : "Unable to fetch news."
            );
        }

        allArticles = data.articles || [];
        displayArticles();
    } catch (error) {
        postsContainer.innerHTML =
            "<p>Unable to load articles. Check your API key, internet connection, and API usage limit, then try again.</p>";

        console.error(error);
    }
}

function displayArticles() {
    const searchText = searchInput.value.toLowerCase();

    const filteredArticles = allArticles.filter(function(article) {
        const text = (
            article.title + " " +
            (article.description || "") + " " +
            (article.source?.name || "")
        ).toLowerCase();

        return text.includes(searchText);
    });

    postsContainer.innerHTML = "";

    if (filteredArticles.length === 0) {
        postsContainer.innerHTML = "<p>No articles found.</p>";
        return;
    }

    filteredArticles.forEach(function(article) {
        const post = document.createElement("article");
        post.className = "post";

        const image = document.createElement("img");
        image.src = article.image || "";
        image.alt = article.title;
        image.loading = "lazy";

        if (!article.image) {
            image.hidden = true;
        }

        image.onerror = function() {
            image.hidden = true;
        };

        const content = document.createElement("div");
        content.className = "post-content";

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = selectedCategory.toUpperCase();

        const title = document.createElement("h3");
        title.textContent = article.title;

        const description = document.createElement("p");
        description.textContent =
            article.description || "No description available.";

        const details = document.createElement("small");
        const date = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString("en-IN")
            : "Date unavailable";

        details.textContent =
            (article.source?.name || "Unknown source") + " · " + date;

        const readLink = document.createElement("a");
        readLink.className = "read-btn";
        readLink.href = article.url;
        readLink.target = "_blank";
        readLink.rel = "noopener noreferrer";
        readLink.textContent = "Read Original";

        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(details);
        content.appendChild(document.createElement("br"));
        content.appendChild(readLink);

        post.appendChild(image);
        post.appendChild(content);
        postsContainer.appendChild(post);
    });
}

searchInput.addEventListener("input", displayArticles);

filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        selectedCategory = button.dataset.category;

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        let apiCategory = "general";

        if (selectedCategory === "technology") {
            apiCategory = "technology";
        } else if (selectedCategory === "lifestyle") {
            apiCategory = "health";
        } else if (selectedCategory === "travel") {
            apiCategory = "world";
        }

        fetchArticles(apiCategory);
    });
});

navLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        const destination = link.getAttribute("href");

        if (!destination || !destination.startsWith("#")) {
            return;
        }

        event.preventDefault();

        if (link.classList.contains("home-link")) {
            searchInput.value = "";
            selectedCategory = "all";
            fetchArticles("general");
        }

        if (link.classList.contains("discover-link")) {
            searchInput.value = "";
            selectedCategory = "all";
            fetchArticles("general");
        }

        const target = document.getElementById(destination.substring(1));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

fetchArticles();