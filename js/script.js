/**
 * SHADOWLARK'S ORACLE - Main Script
 * Vanilla JS + Anime.js (2D Optimized)
 */

// ── MOBILE MENU ──
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.add('active'));
mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('active'));

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('active'));
});

// ── PARTICLES BACKGROUND ──
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.fillStyle = `rgba(0, 229, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
for (let i = 0; i < 80; i++) particles.push(new Particle());
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ── ANIME 2D CAROUSEL CLASS ──
class AnimeCarousel {
    constructor(containerId, items, titleId) {
        this.container = document.getElementById(containerId);
        this.itemsData = items;
        this.titleElement = document.getElementById(titleId);
        this.activeIndex = 0;
        this.isMobile = window.innerWidth < 768;

        this.init();
    }

    init() {
        // Build HTML
        this.container.innerHTML = `
            <div class="carousel-track">
                ${this.itemsData.map((item, i) => `
                    <div class="carousel-item glass" data-index="${i}">
                        <img src="${item.src}" alt="${item.title}">
                    </div>
                `).join('')}
            </div>
        `;

        this.track = this.container.querySelector('.carousel-track');
        this.items = this.container.querySelectorAll('.carousel-item');

        this.setupEvents();
        this.updateActive(0);
    }

    setupEvents() {
        this.container.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Click to scroll
        this.items.forEach((item, i) => {
            item.addEventListener('click', () => this.scrollToIndex(i));
            item.addEventListener('mouseenter', () => {
                if (!this.isMobile) this.scrollToIndex(i);
            });
        });

        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
        });
    }

    handleScroll() {
        const containerCenter = this.container.scrollLeft + this.container.clientWidth / 2;
        let closestIndex = 0;
        let minDiff = Infinity;

        this.items.forEach((item, i) => {
            const itemCenter = item.offsetLeft + item.clientWidth / 2;
            const diff = Math.abs(itemCenter - containerCenter);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });

        if (closestIndex !== this.activeIndex) {
            this.updateActive(closestIndex);
        }
    }

    scrollToIndex(index) {
        const item = this.items[index];
        const targetScroll = item.offsetLeft - this.container.clientWidth / 2 + item.clientWidth / 2;
        
        this.container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    updateActive(index) {
        this.activeIndex = index;
        
        // Update Title
        if (this.titleElement) {
            this.titleElement.innerText = this.itemsData[index].title;
            anime({
                targets: this.titleElement,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }

        // Toggle active class for CSS transitions (performance optimized)
        this.items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// ── INITIALIZE ──
window.addEventListener('load', () => {
    new AnimeCarousel('desktop-carousel', [
        { src: 'imgs/shadowlarkoracle0.png', title: 'The Interface' },
        { src: 'imgs/shadowlarkoracle1.png', title: 'The Narrative Engine' },
        { src: 'imgs/shadowlarkoracle2.png', title: 'Tarot Alignment' }
    ], 'desktop-title');

    new AnimeCarousel('mobile-carousel', [
        { src: 'imgs/android_main.png', title: 'Mobile Interface' },
        { src: 'imgs/android_weaving.png', title: 'Mobile Narrative Engine' },
        { src: 'imgs/android_tarot.png', title: 'Mobile Tarot Ritual' }
    ], 'mobile-title');

    anime({
        targets: '#hero .hero-content',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 300
    });
});

// ── REVEAL OBSERVER ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            anime({
                targets: entry.target,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                easing: 'easeOutQuad'
            });
            entry.target.style.opacity = '1';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .matrix-content, .section-title').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});
