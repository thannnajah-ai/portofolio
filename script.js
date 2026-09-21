// Intersection Observer for natural scroll animations
// Following Emil Kowalski's philosophy: avoiding clunky entrances.
// We start slightly scaled down (0.98 in CSS) and fade in smoothly.

document.addEventListener("DOMContentLoaded", () => {
    // Setup observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to trigger CSS transition
                entry.target.classList.add('is-visible');
                // Unobserve after animating once to keep it clean
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections with fade-in-section class
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const circleReveal = document.getElementById('theme-reveal-circle');

    themeToggleBtn.addEventListener('click', (e) => {
        playSound();
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        // Batman Reveal Effect
        const x = e.clientX || window.innerWidth - 50;
        const y = e.clientY || 50;
        if (circleReveal) {
            circleReveal.style.left = x + 'px';
            circleReveal.style.top = y + 'px';
            circleReveal.style.backgroundColor = isDark ? '#FAFAFA' : '#000000';
            circleReveal.classList.add('active');
        }
        
        setTimeout(() => {
            if (isDark) {
                document.body.removeAttribute('data-theme');
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                showDynamicIsland('Light Mode Activated');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.setAttribute('data-theme', 'dark');
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                showDynamicIsland('Dark Mode Activated');
                localStorage.setItem('theme', 'dark');
            }
            
            if (circleReveal) {
                setTimeout(() => {
                    circleReveal.classList.remove('active');
                }, 100);
            }
        }, 400); // Wait for circle to cover screen
    });

    // Initialize theme from storage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    } else {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    }
    // Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    const interactables = document.querySelectorAll('a, button, .magnetic');

    // Only run cursor logic if fine pointer is available
    if (window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        
        // Use requestAnimationFrame for smoother following
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animateCursor = () => {
            // Linear interpolation for smooth spring effect
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // Magnetic Button Logic
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move element slightly towards cursor (magnetic effect)
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            // Reset to default on leave
            el.style.transform = `translate(0px, 0px)`;
        });
    });

    // Scroll Progress Logic
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + '%';
    });

    // Parallax Glow Background
    const glowBg = document.querySelector('.glow-bg');
    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px translation
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            glowBg.style.transform = `translate(calc(-50% + ${-x}px), ${-y}px)`;
        });
    }
});

// Preloader Logic
window.addEventListener('load', () => {
    // Add small delay for aesthetic effect
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// i18n Dictionary
const i18n = {
    id: {
        available: "Tersedia untuk kerja",
        heroTitle: "Frontend & Mobile Developer",
        heroSubtitle: "Menciptakan Antarmuka Berkelas",
        heroDesc: "Menggabungkan alat coding AI dengan prinsip Design Engineering yang kuat untuk menciptakan pengalaman digital yang estetis dan mulus.",
        viewProjects: "Lihat Proyek",
        aboutMe: "Tentang Saya",
        aboutP1: "Saya adalah pelajar di <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong> (Jurusan IPA) yang memiliki passion mendalam pada software engineering, khususnya di bidang Web dan Mobile (Flutter). Lahir pada 23 Februari 2009, perjalanan saya di dunia teknologi didorong oleh rasa ingin tahu terhadap bagaimana antarmuka digital dapat terasa hidup.",
        aboutP2: "Saya sangat peduli pada detail antarmuka (UI). Dalam alur kerja sehari-hari, saya terbiasa menggunakan AI-assisted coding tools dan agentic workflows (seperti Claude Code CLI & Antigravity) di lingkungan local/proxy. Saya menggabungkan kecepatan AI dengan prinsip <em>Design Engineering</em> yang kuat untuk memastikan produk akhir tidak hanya fungsional, tetapi juga memiliki <em>good taste</em> dan pengalaman pengguna yang premium.",
        skillsTitle: "Kapabilitas & Selera",
        skill1Desc: "Keahlian solid dalam fondasi web modern menggunakan HTML5, CSS3, dan Vanilla JS, serta pengembangan aplikasi mobile cross-platform dengan Flutter.",
        skill2Desc: "Menerapkan animasi natural berbasis physics, custom easing curves, dan tactile feedback. Interaksi terasa presisi, menghindari animasi generik linear.",
        skill3Desc: "Fokus pada <em>good taste</em> UI/UX: tipografi presisi, proporsi spacing sempurna, dan desain asimetris. Menghindari tampilan \"boilerplate\" khas template.",
        projectsTitle: "Proyek Pilihan",
        project1Title: "TembusPTN.my.id",
        project1Desc: "Platform belajar online UTBK/SNBT gratis dengan antarmuka yang clean dan responsif, dirancang untuk fokus tinggi penggunanya.",
        project2Title: "Karya Tulis Ilmiah",
        project2Desc: "Penelitian eksperimental mengenai Pengaruh Cara Konsumsi Berbeda terhadap Kadar Glukosa Nasi Putih. Studi ini memberikan implikasi untuk pola makan sehat.",
        thoughtsTitle: "Catatan & Pikiran",
        contactTitle: "Hubungi Saya",
        sendBtn: "Kirim Pesan",
        blog1Title: "Mengapa Animasi UI Itu Penting",
        blog1Date: "20 Mei 2026",
        blog2Title: "Beralih dari React ke Vanilla JS",
        blog2Date: "15 April 2026"
    },
    en: {
        available: "Available for work",
        heroTitle: "Frontend & Mobile Developer",
        heroSubtitle: "Crafting Interfaces with Taste",
        heroDesc: "Combining AI-assisted coding tools with strong Design Engineering principles to create highly aesthetic and fluid digital experiences.",
        viewProjects: "View Projects",
        aboutMe: "About Me",
        aboutP1: "I am a student at <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong> (Science major) with a deep passion for software engineering, specifically in Web and Mobile (Flutter). Born on February 23, 2009, my journey in technology is driven by a curiosity about how digital interfaces can feel alive.",
        aboutP2: "I deeply care about user interface (UI) details. In my daily workflow, I am accustomed to using AI-assisted coding tools and agentic workflows (such as Claude Code CLI & Antigravity) in local/proxy environments. I combine the speed of AI with strong <em>Design Engineering</em> principles to ensure the final product is not only functional but also has <em>good taste</em> and a premium user experience.",
        skillsTitle: "Capabilities & Taste",
        skill1Desc: "Solid expertise in modern web foundations using HTML5, CSS3, and Vanilla JS, as well as cross-platform mobile app development with Flutter.",
        skill2Desc: "Applying natural physics-based animations, custom easing curves, and tactile feedback. Interactions feel precise, avoiding linear generic animations.",
        skill3Desc: "Focus on UI/UX <em>good taste</em>: precise typography, perfect spacing proportions, and modern asymmetrical design. Avoiding typical \"boilerplate\" templates.",
        projectsTitle: "Featured Projects",
        project1Title: "TembusPTN.my.id",
        project1Desc: "A free online learning platform for UTBK/SNBT with a clean and responsive interface, designed for high user focus.",
        project2Title: "Scientific Research",
        project2Desc: "Experimental research on the Effect of Different Consumption Methods on Glucose Levels in White Rice. This study provides implications for a healthy diet.",
        thoughtsTitle: "Thoughts & Logs",
        contactTitle: "Get In Touch",
        sendBtn: "Send Message",
        blog1Title: "Why UI Animation Matters",
        blog1Date: "May 20, 2026",
        blog2Title: "Switching from React to Vanilla JS",
        blog2Date: "April 15, 2026"
    }
};

// Language Toggle Logic
const langToggleBtn = document.getElementById('lang-toggle');
let currentLang = 'en'; // Default to EN for now, or ID if preferred

function setLanguage(lang) {
    showDynamicIsland(lang === 'id' ? 'Bahasa Indonesia Aktif' : 'English Activated');
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.innerHTML = i18n[lang][key];
        }
    });
    langToggleBtn.innerText = lang.toUpperCase();
}

// Initialize Language (we default to EN in the HTML structure)
setLanguage('en');

langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    setLanguage(currentLang);
});

// 3D Tilt Effect on Cards
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation based on distance from center
        const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
        const rotateY = ((x - centerX) / centerX) * 5;  // max 5 deg
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none'; // Remove transition for smooth tracking
    });

// ==========================================
// PHASE 6: EXTREME LAZY FEATURES
// ==========================================

// 1. Magnetic Text Wrapper
document.querySelectorAll('.hero-title span').forEach(el => {
    el.classList.add('magnetic-text');
});

// 2. Scroll Line Indicator
const scrollLine = document.getElementById('scroll-line-indicator');
window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollLine) scrollLine.style.height = scrolled + '%';
});

// 3. Dynamic Island
let islandTimeout;
function showDynamicIsland(text) {
    const island = document.getElementById('dynamic-island');
    const islandText = document.getElementById('island-text');
    if (!island || !islandText) return;
    
    islandText.textContent = text;
    island.classList.remove('hidden-island');
    
    clearTimeout(islandTimeout);
    islandTimeout = setTimeout(() => {
        island.classList.add('hidden-island');
    }, 3000);
}

// 4. Custom Context Menu
const contextMenu = document.getElementById('custom-context-menu');
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('a') || e.target.closest('img')) return; // Allow default on links/images
    e.preventDefault();
    
    // Constrain to window bounds
    let x = e.clientX;
    let y = e.clientY;
    if (x + 200 > window.innerWidth) x = window.innerWidth - 200;
    if (y + 150 > window.innerHeight) y = window.innerHeight - 150;
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) {
        contextMenu.classList.add('hidden');
    }
});

document.getElementById('menu-theme')?.addEventListener('click', (e) => {
    contextMenu.classList.add('hidden');
    themeToggleBtn.click(); // Trigger native click
});

document.getElementById('menu-terminal')?.addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    document.getElementById('terminal-overlay').classList.remove('hidden');
    document.getElementById('terminal-input').focus();
});

// 5. GitHub Logs Injector
const commits = [
    { hash: 'a1b2c3d', date: 'Sep 21, 2026', msg: 'Implement Phase 6: Dynamic Island & Context Menu' },
    { hash: 'f900a60', date: 'Sep 21, 2026', msg: 'Refactor Spline 3D Viewer and Custom Terminal' },
    { hash: '3437892', date: 'Sep 20, 2026', msg: 'Initial commit: God-Tier Portfolio Setup' },
];
const logsTimeline = document.getElementById('logs-timeline');
if (logsTimeline) {
    commits.forEach(commit => {
        const div = document.createElement('div');
        div.className = 'log-item';
        div.innerHTML = `<div class="log-date">${commit.date}</div><div class="log-msg"><span class="log-hash">${commit.hash}</span> ${commit.msg}</div>`;
        logsTimeline.appendChild(div);
    });
}

    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 300ms ease'; // Smooth reset
    });
});

// Local Time Widget (Yogyakarta Time)
const localTimeEl = document.getElementById('local-time');
setInterval(() => {
    const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    localTimeEl.innerText = `📍 Yogyakarta, ID • ${formatter.format(new Date())}`;
}, 1000);

// Dynamic SVG Favicon & Title
const favicon = document.getElementById('favicon');
const originalFavicon = favicon.href;
const missYouFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ef4444'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white'%3E!%3C/text%3E%3C/svg%3E";

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        favicon.href = missYouFavicon;
        document.title = "Come back! 🥺";
    } else {
        favicon.href = originalFavicon;
        document.title = "Nathan Ferdwiansyah W. | Frontend & Mobile Developer";
    }
});

// Interactive Canvas Particles
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 100;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95;
        this.life--;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0 || particles[i].size <= 0.2) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('click', (e) => {
    // Tweak to ignore clicks on language toggle to avoid blocking it, though pointer-events:none on canvas handles that.
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// UI Sound Design
const clickSound = new Audio("data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTEAAAAAAFAAeAB4AGgARgAvABMACgD//wEA//8BAP//AQD//wEA"); 
clickSound.volume = 0.1;

document.querySelectorAll('a, button, .tilt-card').forEach(el => {
    el.addEventListener('mousedown', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => {}); // Ignore autoplay block if any
    });
});

// Blog Rendering
const blogs = [
    { titleKey: 'blog1Title', dateKey: 'blog1Date', link: '#' },
    { titleKey: 'blog2Title', dateKey: 'blog2Date', link: '#' }
];
const blogContainer = document.getElementById('blog-container');
if (blogContainer) {
    blogs.forEach(blog => {
        const card = document.createElement('a');
        card.className = 'blog-card magnetic tilt-card';
        card.href = blog.link;
        card.innerHTML = `
            <div class="blog-date" data-i18n="${blog.dateKey}"></div>
            <h3 class="blog-title" data-i18n="${blog.titleKey}"></h3>
        `;
        blogContainer.appendChild(card);
    });
    // Need to re-trigger setLanguage to translate newly added nodes
    setLanguage(currentLang);
}

// Secret Terminal
const termOverlay = document.getElementById('terminal-overlay');
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');
const termClose = document.getElementById('term-close');

document.addEventListener('keydown', (e) => {
    if (e.key === '`') {
        termOverlay.classList.toggle('hidden');
        if (!termOverlay.classList.contains('hidden')) {
            termInput.focus();
        }
    }
});

if (termClose) {
    termClose.addEventListener('click', () => {
        termOverlay.classList.add('hidden');
    });
}

function printToTerminal(text) {
    const p = document.createElement('p');
    p.innerHTML = text;
    termOutput.appendChild(p);
    termOutput.scrollTop = termOutput.scrollHeight;
}

if (termInput) {
    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim().toLowerCase();
            termInput.value = '';
            
            printToTerminal(`<span class="prompt">guest@nathan:~$</span> ${cmd}`);
            
            switch(cmd) {
                case 'help':
                    printToTerminal("Available commands: <br> - <span class='highlight'>whoami</span>: Who am I? <br> - <span class='highlight'>projects</span>: List projects <br> - <span class='highlight'>clear</span>: Clear terminal");
                    break;
                case 'whoami':
                    printToTerminal("Nathan Ferdwiansyah W. - Frontend & Mobile Developer. Born 2009. Crafts fluid UI.");
                    break;
                case 'projects':
                    printToTerminal("1. TembusPTN.my.id (Education Platform)<br>2. Scientific Research (Glucose Levels)");
                    break;
                case 'clear':
                    termOutput.innerHTML = '';
                    break;
                case '':
                    break;
                default:
                    printToTerminal(`Command not found: ${cmd}. Type 'help' for a list of commands.`);
            }
        }
    });
}
