// Smooth scrolling for in-page navigation.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Navbar appearance and active section link.
const navbar = document.querySelector('.navbar');
const sections = [...document.querySelectorAll('section[id]')];
function updateNavigation() {
    if (navbar) {
        navbar.style.background = window.scrollY > 100 ? 'var(--navbar-bg-scrolled)' : 'var(--navbar-bg)';
        navbar.style.boxShadow = window.scrollY > 100 ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none';
    }
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) current = section.id;
    });
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
        link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--accent-blue)' : '';
    });
}
window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();

// Persistent light/dark theme toggle.
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleIcon = document.querySelector('.theme-toggle-icon');
let savedTheme = null;
try {
    savedTheme = localStorage.getItem('portfolio-theme');
} catch (_) {
    // Keep the default theme if storage is unavailable (for example, on file:// pages).
}
if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
}

function syncThemeToggle() {
    const isDark = document.documentElement.dataset.theme !== 'light';
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    if (themeToggleIcon) themeToggleIcon.textContent = isDark ? '☀' : '☾';
}

syncThemeToggle();
themeToggle?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    try {
        localStorage.setItem('portfolio-theme', nextTheme);
    } catch (_) {
        // Theme switching still works for this visit when storage is unavailable.
    }
    syncThemeToggle();
});

// Replay each section's entrance when it re-enters the viewport.
if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.replay-reveal').forEach(section => sectionObserver.observe(section));

    const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.style.transitionDelay = `${(index % 3) * 90}ms`;
        cardObserver.observe(card);
    });
} else {
    document.querySelectorAll('.replay-reveal, .project-card').forEach(element => element.classList.add('is-visible'));
}

// Keep the existing first-visit hero entrance separate from scroll reveals.
window.addEventListener('load', () => document.body.classList.add('page-loaded'));
if (document.readyState === 'complete') document.body.classList.add('page-loaded');

// Send contact form submissions through FormSubmit without leaving the page.
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        const status = contactForm.querySelector('.form-status');
        const submitButton = contactForm.querySelector('[type="submit"]');
        const data = Object.fromEntries(new FormData(contactForm));
        submitButton.disabled = true;
        status.textContent = 'Sending your message…';

        try {
            const response = await fetch('https://formsubmit.co/ajax/mohammedelkhawaga098@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    _replyto: data.email,
                    _subject: data.subject,
                    message: data.message
                })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) {
                throw new Error(result.message || 'The email service could not accept the message.');
            }
            status.textContent = 'Message sent successfully. Thank you for reaching out!';
            contactForm.reset();
        } catch (error) {
            status.textContent = 'Could not send your message right now. Please try again later or email mohammedelkhawaga098@gmail.com directly.';
            console.error('Contact form submission failed:', error);
        } finally {
            submitButton.disabled = false;
        }
    });
}

