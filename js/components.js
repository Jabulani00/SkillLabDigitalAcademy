// Load components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.15)';
            } else {
                navbar.style.background = 'var(--glass-bg)';
            }
        }
    });
}

// Initialize components
document.addEventListener('DOMContentLoaded', function() {
    // Load navbar and footer
    loadComponent('navbar-container', '/components/navbar.html');
    loadComponent('footer-container', '/components/footer.html');
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});