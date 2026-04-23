/**
 * SHADOWLARK'S ORACLE - Main Script
 * Vanilla JS + Three.js + Anime.js
 */

// ── MOBILE MENU ──
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.add('active'));
mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('active'));

// Close menu on link click
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
    constructor() {
        this.reset();
    }
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

for (let i = 0; i < 100; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ── THREE.JS CAROUSEL CLASS ──
class ThreeCarousel {
    constructor(containerId, items, color, titleId) {
        this.container = document.getElementById(containerId);
        this.items = items;
        this.color = color;
        this.titleElement = document.getElementById(titleId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.planes = [];
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.activeIndex = 0;
        this.isDragging = false;
        this.prevMouseX = 0;
        this.isMobile = window.innerWidth < 768;

        this.init();
    }

    init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        const radius = this.isMobile ? 8 : 10;
        const angleStep = (Math.PI * 2) / this.items.length;
        const loader = new THREE.TextureLoader();

        this.items.forEach((item, i) => {
            const texture = loader.load(item.src);
            
            // Define ratios to match the 'vibe' of each device
            const isDesktop = containerId === 'desktop-carousel';
            const aspect = isDesktop ? 16/9 : 9/19; 
            
            // Adjust width/height based on screen size
            let width = isDesktop ? (this.isMobile ? 8 : 12) : (this.isMobile ? 5 : 6);
            let height = width / aspect;

            // Ensure height doesn't exceed container
            if (height > 15) {
                height = 15;
                width = height * aspect;
            }
            
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });

            const mesh = new THREE.Mesh(geometry, material);
            const angle = i * angleStep;
            
            mesh.position.x = Math.sin(angle) * radius;
            mesh.position.z = Math.cos(angle) * radius;
            mesh.lookAt(0, 0, 0);
            
            this.scene.add(mesh);
            this.planes.push(mesh);
        });

        this.camera.position.z = this.isMobile ? 18 : 22;
        this.camera.position.y = 1;
        this.camera.lookAt(0, 0, 0);

        this.setupEvents();
        this.animate();
        this.updateActiveState();
    }

    setupEvents() {
        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.prevMouseX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) {
                // Raycasting for hover selection on Desktop
                if (!this.isMobile) {
                    const rect = this.container.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
                    const y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
                    
                    if (x > -1 && x < 1 && y > -1 && y < 1) {
                        this.handleHover(x, y);
                    }
                }
                return;
            }
            const deltaX = e.clientX - this.prevMouseX;
            this.targetRotation += deltaX * 0.003; // Smoother dragging
            this.prevMouseX = e.clientX;
        });

        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.targetRotation += e.deltaY * 0.001;
            this.snapToClosest();
        }, { passive: false });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.snapToClosest();
            }
        });

        // Touch events
        this.container.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.prevMouseX = e.touches[0].clientX;
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.touches[0].clientX - this.prevMouseX;
            this.targetRotation += deltaX * 0.012; // More sensitive for mobile swipes
            this.prevMouseX = e.touches[0].clientX;
        });

        window.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.snapToClosest();
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.isMobile = window.innerWidth < 768;
        });
    }

    handleHover(x, y) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);
        const intersects = raycaster.intersectObjects(this.planes);
        
        if (intersects.length > 0) {
            const index = this.planes.indexOf(intersects[0].object);
            if (index !== this.activeIndex) {
                this.scrollToIndex(index);
            }
        }
    }

    scrollToIndex(index) {
        const angleStep = (Math.PI * 2) / this.items.length;
        this.targetRotation = -index * angleStep;
        this.updateActiveState();
    }

    snapToClosest() {
        const angleStep = (Math.PI * 2) / this.items.length;
        const index = Math.round(-this.targetRotation / angleStep);
        this.scrollToIndex((index % this.items.length + this.items.length) % this.items.length);
    }

    updateActiveState() {
        const angleStep = (Math.PI * 2) / this.items.length;
        this.activeIndex = (Math.round(-this.targetRotation / angleStep) % this.items.length + this.items.length) % this.items.length;
        
        if (this.titleElement) {
            this.titleElement.innerText = this.items[this.activeIndex].title;
            anime({
                targets: this.titleElement,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 500,
                easing: 'easeOutExpo'
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth rotation
        this.currentRotation += (this.targetRotation - this.currentRotation) * 0.1;
        this.scene.rotation.y = this.currentRotation;

        // Update individual planes (scale and opacity)
        this.planes.forEach((plane, i) => {
            const angleStep = (Math.PI * 2) / this.items.length;
            const relativeAngle = (i * angleStep + this.currentRotation) % (Math.PI * 2);
            const normalizedAngle = Math.abs(((relativeAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
            
            const isActive = normalizedAngle < 0.5;
            const targetOpacity = isActive ? 1.0 : 0.2;
            const targetScale = isActive ? 1.2 : 0.8;

            plane.material.opacity += (targetOpacity - plane.material.opacity) * 0.1;
            plane.scale.setScalar(plane.scale.x + (targetScale - plane.scale.x) * 0.1);
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// ── INITIALIZE CAROUSELS ──
window.addEventListener('load', () => {
    new ThreeCarousel(
        'desktop-carousel', 
        [
            { src: 'imgs/shadowlarkoracle0.png', title: 'The Interface' },
            { src: 'imgs/shadowlarkoracle1.png', title: 'The Narrative Engine' },
            { src: 'imgs/shadowlarkoracle2.png', title: 'Tarot Alignment' }
        ],
        '#00e5ff',
        'desktop-title'
    );

    new ThreeCarousel(
        'mobile-carousel', 
        [
            { src: 'imgs/android_main.png', title: 'Mobile Interface' },
            { src: 'imgs/android_weaving.png', title: 'Mobile Narrative Engine' },
            { src: 'imgs/android_tarot.png', title: 'Mobile Tarot Ritual' }
        ],
        '#f5d061',
        'mobile-title'
    );

    // Initial Reveal Animations
    anime({
        targets: '#hero .hero-content',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1500,
        easing: 'easeOutExpo',
        delay: 500
    });
});

// ── SCROLL REVEALS ──
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            anime({
                targets: entry.target,
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            });
            // Fallback for immediate visibility
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .matrix-content, .section-title').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});
