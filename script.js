// Navbar — frosted glass when scrolled
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Hero scroll fade (content + scroll indicator)
const heroContent = document.querySelector('.hero-content');
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (heroContent) {
        if (s <= 300)      heroContent.style.opacity = 1;
        else if (s >= 600) heroContent.style.opacity = 0;
        else               heroContent.style.opacity = 1 - ((s - 300) / 300);
    }
    if (scrollIndicator) {
        scrollIndicator.style.opacity = Math.max(0, 1 - s / 180);
    }
}, { passive: true });

// Stats counter animation (fires when scrolled into view)
const statConfig = [
    { id: 'stat-items',     target: 4,    suffix: 'K+' },
    { id: 'stat-sales',     target: 25.5, suffix: 'M+' },
    { id: 'stat-community', target: 420,  suffix: 'K+' },
];

function animateNumber(el, target, suffix) {
    let startTime = null;
    const duration = 2000;
    function step(now) {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const value = progress * target;
        el.textContent = suffix === 'M+' ? value.toFixed(1) + suffix : Math.floor(value) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = suffix === 'M+' ? target.toFixed(1) + suffix : target + suffix;
    }
    requestAnimationFrame(step);
}

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            statConfig.forEach(({ id, target, suffix }) => {
                const el = document.getElementById(id);
                if (el) animateNumber(el, target, suffix);
            });
            statsObserver.disconnect();
        }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
}

// Fade-in on scroll (generalized — works for any .fade-in element)
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// Featured carousel
const featuredGrid = document.querySelector('.featured-grid');
const leftArrow = document.querySelector('.carousel-arrow.left');
const rightArrow = document.querySelector('.carousel-arrow.right');
const featuredItems = document.querySelectorAll('.featured-item');
let scrollIndex = 0;

function getItemsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1200) return 2;
    return 4;
}

function updateArrowPosition() {
    const firstImage = document.querySelector('.featured-image img');
    const wrapper = document.querySelector('.carousel-wrapper');
    if (!firstImage || !wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const imageRect = firstImage.getBoundingClientRect();
    const offset = imageRect.top - wrapperRect.top + imageRect.height / 2;
    leftArrow.style.top = rightArrow.style.top = offset + 'px';
}

function updateCarousel() {
    const gap = parseInt(getComputedStyle(featuredGrid).gap) || 0;
    const itemWidth = featuredItems[0].offsetWidth + gap;
    featuredGrid.style.transform = `translateX(-${scrollIndex * itemWidth}px)`;
    leftArrow.disabled = scrollIndex === 0;
    rightArrow.disabled = scrollIndex >= featuredItems.length - getItemsPerView();
    updateArrowPosition();
}

leftArrow.addEventListener('click', () => {
    if (scrollIndex > 0) { scrollIndex--; updateCarousel(); }
});
rightArrow.addEventListener('click', () => {
    if (scrollIndex < featuredItems.length - getItemsPerView()) { scrollIndex++; updateCarousel(); }
});
window.addEventListener('resize', () => {
    const max = featuredItems.length - getItemsPerView();
    if (scrollIndex > max) scrollIndex = Math.max(0, max);
    updateCarousel();
});
window.addEventListener('load', updateArrowPosition);
updateCarousel();

// Inner dot-carousels + modal arrow carousels
function initCarousel(carouselId, paginationId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const dots = paginationId
        ? Array.from(document.querySelectorAll(`#${paginationId} .carousel-dot`))
        : [];

    const wrap = carousel.parentElement;
    const prevBtn = wrap?.querySelector('.modal-arrow-prev') ?? null;
    const nextBtn = wrap?.querySelector('.modal-arrow-next') ?? null;
    const imageCount = carousel.querySelectorAll('img').length;

    function updateState() {
        const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx >= imageCount - 1;
    }

    carousel.addEventListener('scroll', updateState, { passive: true });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            carousel.scrollTo({ left: i * carousel.clientWidth, behavior: 'smooth' });
        });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
        carousel.scrollTo({ left: (idx - 1) * carousel.clientWidth, behavior: 'smooth' });
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
        carousel.scrollTo({ left: (idx + 1) * carousel.clientWidth, behavior: 'smooth' });
    });

    updateState();
}

initCarousel('modal-walmart-carousel',       'modal-walmart-pagination');
initCarousel('modal-rollingstones-carousel', 'modal-rollingstones-pagination');
initCarousel('modal-hugo-carousel',          'modal-hugo-pagination');
initCarousel('mari-carousel',                'mari-carousel-pagination');

// Works page — brand collab modals
function openWorksModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeWorksModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.works-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => openWorksModal(card.dataset.modal));
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openWorksModal(card.dataset.modal);
    });
});

document.querySelectorAll('.works-modal').forEach(modal => {
    modal.querySelector('.works-modal-backdrop')?.addEventListener('click', () => closeWorksModal(modal));
    modal.querySelector('.works-modal-close')?.addEventListener('click', () => closeWorksModal(modal));
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.works-modal.open').forEach(m => closeWorksModal(m));
    }
});

// Hash routing
const sections = {
    hero:      document.querySelector('.hero'),
    stats:     document.querySelector('.stats-section'),
    ria:       document.querySelector('.ria-banner'),
    scrolling: document.querySelector('.scrolling-banner'),
    about:     document.querySelector('.about-section'),
    works:     document.querySelector('.works-section'),
    contact:   document.querySelector('.contact-section'),
    featured:  document.querySelector('.featured'),
};

const layouts = {
    home: {
        hero: '', stats: '', ria: 'none', scrolling: 'none',
        about: 'none', works: 'none', contact: 'none', featured: '',
    },
    about: {
        hero: 'none', stats: 'none', ria: 'block', scrolling: 'block',
        about: 'block', works: 'none', contact: 'none', featured: 'none',
    },
    works: {
        hero: 'none', stats: 'none', ria: 'none', scrolling: 'none',
        about: 'none', works: 'block', contact: 'none', featured: 'none',
    },
    contact: {
        hero: 'none', stats: 'none', ria: 'none', scrolling: 'none',
        about: 'none', works: 'none', contact: 'block', featured: 'none',
    },
};

function handleRouting() {
    const hash = location.hash;
    const key = hash === '#/about'   ? 'about'
              : hash === '#/works'   ? 'works'
              : hash === '#/contact' ? 'contact'
              : 'home';

    document.querySelectorAll('.works-modal.open').forEach(m => closeWorksModal(m));

    Object.entries(layouts[key]).forEach(([k, display]) => {
        if (sections[k]) sections[k].style.display = display;
    });

    document.body.classList.toggle('dark-mode-nav', key !== 'home');
    window.scrollTo(0, 0);
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        setTimeout(handleRouting, 0);
    });
});

window.addEventListener('hashchange', handleRouting);
handleRouting();
