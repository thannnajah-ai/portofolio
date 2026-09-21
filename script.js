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
        const isLight = document.body.classList.contains('light-theme');
        
        // Batman Reveal Effect
        const x = e.clientX || window.innerWidth - 50;
        const y = e.clientY || 50;
        if (circleReveal) {
            circleReveal.style.left = x + 'px';
            circleReveal.style.top = y + 'px';
            circleReveal.style.backgroundColor = isLight ? '#000000' : '#FAFAFA';
            circleReveal.classList.add('active');
        }
        
        setTimeout(() => {
            if (isLight) {
                document.body.classList.remove('light-theme');
                showDynamicIsland('Dark Mode Activated');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-theme');
                showDynamicIsland('Light Mode Activated');
                localStorage.setItem('theme', 'light');
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
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
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

        // 5. Ripple Click Effect
        document.addEventListener('mousedown', () => {
            cursor.classList.remove('ripple-active');
            void cursor.offsetWidth; // trigger reflow
            cursor.classList.add('ripple-active');
        });
    }

    // Magnetic Button Logic
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach((el) => {
        let rect = null;
        el.addEventListener('mouseenter', () => {
            rect = el.getBoundingClientRect();
        });
        
        el.addEventListener('mousemove', (e) => {
            if (!rect) return;
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move element slightly towards cursor (magnetic effect)
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            // Reset to default on leave
            el.style.transform = `translate(0px, 0px)`;
            rect = null;
        });
    });

    // Dynamic Copyright Year
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // Parallax Glow Background
    const glowBg = document.querySelector('.glow-bg');
    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px translation
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            glowBg.style.transform = `translate(calc(-50% + ${-x}px), ${-y}px)`;
        });
    }

// Preloader Logic
const hidePreloader = () => document.body.classList.add('loaded');
const spline = document.querySelector('spline-viewer');
if (spline) {
    spline.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 3000); // Fallback
} else {
    window.addEventListener('load', hidePreloader);
}

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
        blog1Content: "<p>Animasi dalam antarmuka pengguna (UI) sering dianggap sebagai hiasan semata. Padahal, animasi yang dirancang dengan <em>good taste</em> memberikan fungsi krusial: <strong>feedback visual dan spasial</strong>.</p><p>Ketika seorang pengguna menekan tombol dan tombol tersebut merespons dengan efek gelombang (ripple) atau pegas (spring), otak mereka secara tak sadar merasa terhubung secara fisik dengan antarmuka digital tersebut.</p><p>Sebagai Frontend Developer, saya percaya bahwa memoles detail mikro interaksi adalah apa yang membedakan aplikasi biasa dari aplikasi kelas dunia.</p>",
        blog2Title: "Beralih dari React ke Vanilla JS",
        blog2Date: "15 April 2026",
        blog2Content: "<p>Ekosistem JavaScript modern sangat terobsesi dengan framework raksasa seperti React, Next.js, dan Vue. Namun untuk website statis seperti portofolio, framework seringkali hanya menambah beban (bloat).</p><p>Saya memutuskan untuk membangun portofolio ini menggunakan 100% Vanilla JS dan murni CSS. Hasilnya? Tidak ada proses <em>hydration</em> yang lambat, tidak ada file bundel raksasa berukuran MB, dan performa 60fps yang terkunci rapat bahkan di perangkat kelas bawah.</p><p>Kembali ke dasar kadang adalah langkah paling maju yang bisa kita ambil.</p>"
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
        blog1Content: "<p>Animations in user interfaces (UI) are often seen as mere decorations. In reality, tasteful animation serves a crucial function: <strong>visual and spatial feedback</strong>.</p><p>When a user presses a button and it responds with a ripple or a spring effect, their brain subconsciously feels a physical connection to the digital interface.</p><p>As a Frontend Developer, I believe that polishing micro-interactions is what separates an ordinary application from a world-class one.</p>",
        blog2Title: "Switching from React to Vanilla JS",
        blog2Date: "April 15, 2026",
        blog2Content: "<p>The modern JavaScript ecosystem is heavily obsessed with giant frameworks like React, Next.js, and Vue. However, for static websites like portfolios, frameworks often just add bloat.</p><p>I decided to build this portfolio using 100% Vanilla JS and pure CSS. The result? No slow hydration processes, no massive megabyte-sized bundle files, and rock-solid 60fps performance even on low-end devices.</p><p>Sometimes going back to basics is the most advanced step we can take.</p>"
    }
};

// Language Toggle Logic
const langToggleBtn = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'en';

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

// 3. Dynamic Island Logic (Moved up)
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

// Initialize Language (we default to EN in the HTML structure)
setLanguage('en');

langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    setLanguage(currentLang);
});

// 3D Tilt Effect on Cards
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
    let rect = null;
    let centerX, centerY;
    
    card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        centerX = rect.width / 2;
        centerY = rect.height / 2;
        card.style.transition = 'none'; // Remove transition for smooth tracking
    });

    card.addEventListener('mousemove', (e) => {
        if (!rect) return;
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        // Calculate rotation based on distance from center
        const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
        const rotateY = ((x - centerX) / centerX) * 5;  // max 5 deg
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'transform var(--speed-normal) ease'; // Smooth reset
        rect = null;
    });
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

// 3. Dynamic Island logic has been moved up

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
    document.getElementById('terminal-dialog').showModal();
    document.getElementById('terminal-input').focus();
});

// 5. GitHub Logs Injector (Live)
const logsTimeline = document.getElementById('logs-timeline');
if (logsTimeline) {
    logsTimeline.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Fetching live commits from GitHub...</div>';
    
    fetch('https://api.github.com/repos/thannnajah-ai/portofolio/commits')
        .then(response => response.json())
        .then(data => {
            logsTimeline.innerHTML = ''; // clear loading text
            
            // Get latest 4 commits
            const commits = data.slice(0, 4);
            commits.forEach(commitObj => {
                const hash = commitObj.sha.substring(0, 7);
                const dateObj = new Date(commitObj.commit.author.date);
                const dateStr = dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
                const msg = commitObj.commit.message;
                
                const div = document.createElement('div');
                div.className = 'log-item';
                div.innerHTML = `<div class="log-date">${dateStr}</div><div class="log-msg"><a href="${commitObj.html_url}" target="_blank" class="log-hash" style="text-decoration:none">${hash}</a> ${msg}</div>`;
                logsTimeline.appendChild(div);
            });
        })
        .catch(err => {
            logsTimeline.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Failed to load live commits.</div>';
            console.error('Error fetching commits:', err);
        });
}

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
    if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
    }
}

window.addEventListener('click', (e) => {
    const wasEmpty = particles.length === 0;
    // Tweak to ignore clicks on language toggle to avoid blocking it, though pointer-events:none on canvas handles that.
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
    }
    if (wasEmpty) animateParticles();
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

// Blog Rendering & Dialog Logic
const blogs = [
    { titleKey: 'blog1Title', dateKey: 'blog1Date', contentKey: 'blog1Content', link: '#' },
    { titleKey: 'blog2Title', dateKey: 'blog2Date', contentKey: 'blog2Content', link: '#' }
];
const blogContainer = document.getElementById('blog-container');
const blogDialog = document.getElementById('blog-dialog');
const blogDialogTitle = document.getElementById('blog-dialog-title');
const blogDialogDate = document.getElementById('blog-dialog-date');
const blogDialogContent = document.getElementById('blog-dialog-content');
const blogCloseBtn = document.getElementById('blog-close');

if (blogContainer) {
    blogs.forEach(blog => {
        const card = document.createElement('a');
        card.className = 'blog-card magnetic tilt-card';
        card.href = 'javascript:void(0)';
        card.innerHTML = `
            <div class="blog-date" data-i18n="${blog.dateKey}"></div>
            <h3 class="blog-title" data-i18n="${blog.titleKey}"></h3>
        `;
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            // Populate dialog content based on current lang
            const lang = localStorage.getItem('lang') || 'en';
            blogDialogTitle.innerHTML = i18n[lang][blog.titleKey];
            blogDialogDate.innerHTML = i18n[lang][blog.dateKey];
            blogDialogContent.innerHTML = i18n[lang][blog.contentKey];
            
            // Show dialog
            blogDialog.showModal();
            document.body.style.overflow = 'hidden'; // prevent bg scrolling
        });
        
        blogContainer.appendChild(card);
    });
    // Need to re-trigger setLanguage to translate newly added nodes
    setLanguage(currentLang);
}

if (blogDialog && blogCloseBtn) {
    blogCloseBtn.addEventListener('click', () => {
        blogDialog.classList.add('closing');
        setTimeout(() => {
            blogDialog.close();
            blogDialog.classList.remove('closing');
            document.body.style.overflow = '';
        }, 300); // match CSS animation duration
    });
    
    // Close on backdrop click
    blogDialog.addEventListener('click', (e) => {
        if (e.target === blogDialog) {
            blogCloseBtn.click();
        }
    });
}

// Secret Terminal
const termOverlay = document.getElementById('terminal-dialog');
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');
const termClose = document.getElementById('term-close');

document.addEventListener('keydown', (e) => {
    if (e.key === '`') {
        if (!termOverlay.open) {
            termOverlay.showModal();
            termInput.focus();
        } else {
            termOverlay.close();
        }
    }
});

if (termClose) {
    termClose.addEventListener('click', () => {
        termOverlay.close();
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
                case 'theme':
                    document.getElementById('theme-toggle').click();
                    printToTerminal("Theme toggled.");
                    break;
                case 'contact':
                    printToTerminal("Email: thannnajah@gmail.com<br>WhatsApp: +6285725276231");
                    break;
                case 'skills':
                    printToTerminal("HTML, CSS, JS, Flutter, Design Engineering");
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

// Formspree AJAX
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const ogText = btn.innerText;
        btn.innerText = 'Sending...';
        try {
            await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            btn.innerText = 'Sent!';
            contactForm.reset();
        } catch (err) {
            btn.innerText = 'Error';
        }
        setTimeout(() => btn.innerText = ogText, 3000);
    });
}
});

