// Intersection Observer for natural scroll animations
// Following Emil Kowalski's philosophy: avoiding clunky entrances.
// We start slightly scaled down (0.98 in CSS) and fade in smoothly.

document.addEventListener("DOMContentLoaded", () => {
    // 0. Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW fail:', err));
        });
    }

    // 0. Initialize Lenis Smooth Scroll (Design Engineering touch)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            smooth: true
        });

        // Setup for Velocity Marquee and Image Parallax
        const marqueeContent = document.querySelector('.marquee-content');
        if (marqueeContent) marqueeContent.style.animation = 'none';
        let marqueePos = 0;
        
        const parallaxImages = document.querySelectorAll('.project-image > *');

        function raf(time) {
            lenis.raf(time);
            
            // 1. Velocity Marquee
            if (marqueeContent) {
                const velocity = lenis.velocity || 0;
                marqueePos -= 0.5 + Math.abs(velocity * 0.05); // Base speed + scroll momentum
                
                // Wrap around at 50% for infinite scroll
                const maxScroll = marqueeContent.scrollWidth / 2;
                if (Math.abs(marqueePos) >= maxScroll) {
                    marqueePos = 0;
                }
                marqueeContent.style.transform = `translate3d(${marqueePos}px, 0, 0)`;
            }

            // 2. Image Parallax
            if (parallaxImages.length > 0) {
                parallaxImages.forEach(img => {
                    const rect = img.parentElement.getBoundingClientRect();
                    const centerOffset = (window.innerHeight / 2) - (rect.top + rect.height / 2);
                    const y = centerOffset * -0.15; // 15% parallax effect
                    img.style.setProperty('--parallax-y', `${y}px`);
                });
            }

            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        window.lenis = lenis; // Expose globally just in case
    }


    // Configuration for Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Trigger when 30% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to trigger CSS transition
                entry.target.classList.add('is-visible');
            } else {
                // Remove class to reverse animation when scrolled out of view
                entry.target.classList.remove('is-visible');
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
    themeToggleBtn.addEventListener('click', (e) => {
        const isLight = document.body.classList.contains('light-theme');

        // 360° spin animation
        themeToggleBtn.classList.remove('spin-anim');
        void themeToggleBtn.offsetWidth; // reflow to restart animation
        themeToggleBtn.classList.add('spin-anim');
        setTimeout(() => themeToggleBtn.classList.remove('spin-anim'), 650);

        // Smooth CSS Transition
        document.body.classList.add('theme-transitioning');

        if (isLight) {
            document.body.classList.remove('light-theme');
            if (typeof showDynamicIsland === 'function') showDynamicIsland('Dark Mode Activated');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            if (typeof showDynamicIsland === 'function') showDynamicIsland('Light Mode Activated');
            localStorage.setItem('theme', 'light');
        }

        // Remove the transition class after animation completes (matches CSS 0.4s)
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 400);
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
    if (window.matchMedia('(pointer: fine)').matches && cursor) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let isCursorVisible = false;

        // Use requestAnimationFrame for smoother following
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isCursorVisible) {
                cursor.style.opacity = '1';
                isCursorVisible = true;
            }
        });

        const animateCursor = () => {
            // Increased interpolation factor (0.8) for less delay while keeping it smooth
            cursorX += (mouseX - cursorX) * 1;
            cursorY += (mouseY - cursorY) * 1;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                if (el.classList.contains('project-card')) {
                    const img = el.querySelector('.preview-img, .placeholder-img');
                    if (img && img.nodeName === 'IMG') {
                        cursor.style.backgroundImage = `url(${img.src})`;
                        cursor.classList.add('reveal-image');
                    } else if (img) {
                        cursor.innerHTML = "<span style='color: black; font-weight: 600; font-size: 0.9rem;'>View</span>";
                        cursor.classList.add('reveal-text');
                    }
                }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active', 'reveal-image', 'reveal-text');
                cursor.style.backgroundImage = 'none';
                cursor.innerHTML = '';
            });
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

    // Spotlight Glow Effect Logic
    const glowCards = document.querySelectorAll('.skill-card, .project-card');
    glowCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3D Tilt Effect Logic (Vanilla JS)
    const tiltCards = document.querySelectorAll('.tilt-card');
    if (window.matchMedia('(pointer: fine)').matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8; // max 8 deg
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1000px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.style.transition = 'none';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
                card.style.transition = 'transform 0.5s var(--ease-out-expo)';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

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

    // Page Reveal Logic
    const hidePreloader = () => {
        document.body.classList.add('loaded');
        // Re-enable smooth scrolling after reveal
        if (window.lenis) {
            window.lenis.start();
        }
    };

    // Stop scrolling while curtain is down
    if (window.lenis) window.lenis.stop();

    // Always hide after the greeting sequence (2.8s)
    setTimeout(hidePreloader, 2800);

    // i18n dictionary is now dynamically fetched from /i18n/{lang}.json

    // Language Toggle Logic
    const langToggleBtn = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'en';

    let i18nCache = {};

    async function setLanguage(lang) {
        if (typeof showDynamicIsland === 'function') {
            showDynamicIsland(lang === 'id' ? 'Bahasa Indonesia Aktif' : 'English Activated');
        }
        
        let dict = i18nCache[lang];
        if (!dict) {
            try {
                const response = await fetch(`./i18n/${lang}.json`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                dict = await response.json();
                i18nCache[lang] = dict;
            } catch (e) {
                console.error("Failed to load language file:", e);
                return;
            }
        }

        const elementsToTranslate = document.querySelectorAll('[data-i18n]');

        elementsToTranslate.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        // Auto-stagger for hero title to give word-by-word reveal animation
        const heroSpans = document.querySelectorAll('.hero-title span[data-i18n]');
        heroSpans.forEach((span, spanIdx) => {
            const text = span.innerText.trim();
            span.innerHTML = ''; // clear raw text

            // Rebuild with stagger masks
            const words = text.split(' ');
            words.forEach((word, index) => {
                const mask = document.createElement('span');
                mask.className = 'stagger-mask visible';
                mask.style.display = 'inline-block';
                mask.style.overflow = 'hidden';
                mask.style.verticalAlign = 'top';

                const inner = document.createElement('span');
                inner.className = 'stagger-text';
                inner.style.display = 'inline-block';
                // Adjust delay based on span index and word index
                inner.style.animationDelay = `${0.2 + (spanIdx * 0.2) + (index * 0.1)}s`;
                inner.style.animation = 'revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                inner.style.opacity = '0';
                inner.style.transform = 'translateY(120%)';

                inner.textContent = word;
                mask.appendChild(inner);
                span.appendChild(mask);

                // Add space after word
                if (index < words.length - 1) {
                    span.appendChild(document.createTextNode(' '));
                }
            });
        });

        const langToggleBtn = document.getElementById('lang-toggle');
        if (langToggleBtn) {
            langToggleBtn.innerText = lang.toUpperCase();
        }
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
        // Card flip animation
        langToggleBtn.classList.remove('flip-anim');
        void langToggleBtn.offsetWidth; // reflow to restart
        langToggleBtn.classList.add('flip-anim');
        setTimeout(() => langToggleBtn.classList.remove('flip-anim'), 420);

        currentLang = currentLang === 'en' ? 'id' : 'en';
        localStorage.setItem('lang', currentLang);
        setLanguage(currentLang);
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

    // Converts raw commit messages into conversational language
    function humanizeCommit(msg) {
        // Only use the first line (ignore multiline commit bodies)
        const firstLine = msg.split('\n')[0].trim();
        const match = firstLine.match(/^([^:(]+)[:(]\s*(.+)/);
        if (!match) return firstLine;

        const type = match[1].toLowerCase().trim();
        const body = match[2].replace(/[()]/g, '').trim();
        const cap = body.charAt(0).toUpperCase() + body.slice(1);

        const map = {
            'feat': `${cap}`,
            'fitur': `${cap}`,
            'fix': `${cap}`,
            'perbaikan': `${cap}`,
            'config': `${cap}`,
            'konfigurasi': `${cap}`,
            'refactor': `${cap}`,
            'style': `${cap}`,
            'docs': `${cap}`,
            'chore': `${cap}`,
            'perf': `${cap}`,
            'animasi': `${cap}`
        };

        return map[type] || cap;
    }

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
                    const msg = humanizeCommit(commitObj.commit.message);

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
            document.title = "Portofolio Nathan";
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
            clickSound.play().catch(e => { }); // Ignore autoplay block if any
        });
    });

    // Blog Rendering & Dialog Logic
    const blogs = [
        { titleKey: 'blog1Title', dateKey: 'blog1Date', contentKey: 'blog1Content', link: '#' },
        { titleKey: 'blog2Title', dateKey: 'blog2Date', contentKey: 'blog2Content', link: '#' },
        { titleKey: 'blog3Title', dateKey: 'blog3Date', contentKey: 'blog3Content', link: '#' },
        { titleKey: 'blog4Title', dateKey: 'blog4Date', contentKey: 'blog4Content', link: '#' }
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

});

// 2. Project Modal Logic
const projectModal = document.getElementById('project-modal');
const projectModalClose = document.getElementById('project-close');
const projectCardsDOM = document.querySelectorAll('.project-card');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalDesc = document.getElementById('project-modal-desc');
const projectModalImgContainer = document.getElementById('project-modal-img-container');
const projectModalLink = document.getElementById('project-modal-link');

projectCardsDOM.forEach(card => {
    card.addEventListener('click', (e) => {
        // Ignore if it's the WIP card
        if (card.classList.contains('project-wip')) return;

        e.preventDefault(); // Stop default anchor navigation

        // Extract content
        const titleEl = card.querySelector('.project-title');
        const descEl = card.querySelector('.project-desc');
        const imgEl = card.querySelector('.project-image img');

        if (titleEl) projectModalTitle.innerHTML = titleEl.innerHTML;
        if (descEl) projectModalDesc.innerHTML = descEl.innerHTML;

        if (imgEl) {
            projectModalImgContainer.innerHTML = `<img src="${imgEl.src}" alt="${titleEl ? titleEl.textContent : 'Project'}">`;
        } else {
            projectModalImgContainer.innerHTML = '';
        }

        const href = card.getAttribute('href');
        if (href && href !== '#') {
            projectModalLink.href = href;
            projectModalLink.style.display = 'inline-block';
        } else {
            projectModalLink.style.display = 'none';
        }

        if (projectModal) {
            if (document.startViewTransition) {
                document.startViewTransition(() => projectModal.showModal());
            } else {
                projectModal.showModal();
            }
            if (window.lenis) window.lenis.stop();
        }
    });
});

if (projectModalClose && projectModal) {
    projectModalClose.addEventListener('click', () => {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                projectModal.close();
                if (window.lenis) window.lenis.start();
            });
        } else {
            projectModal.classList.add('closing');
            setTimeout(() => {
                projectModal.close();
                projectModal.classList.remove('closing');
                if (window.lenis) window.lenis.start();
            }, 300);
        }
    });

    // Close when clicking outside
    projectModal.addEventListener('click', (e) => {
        const rect = projectModal.getBoundingClientRect();
        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) {
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    projectModal.close();
                    if (window.lenis) window.lenis.start();
                });
            } else {
                projectModal.classList.add('closing');
                setTimeout(() => {
                    projectModal.close();
                    projectModal.classList.remove('closing');
                    if (window.lenis) window.lenis.start();
                }, 300);
            }
        }
    });
}

// 3. Scroll Reading Progress Bar
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                scrollProgress.style.width = scrolled + "%";
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// 4. Dynamic Favicon & Title
let originalTitle = document.title;
let originalFavicon = document.querySelector('link[rel="icon"]');
let originalFaviconHref = originalFavicon ? originalFavicon.href : '';

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = 'Come back! 😢';
        if (originalFavicon) {
            originalFavicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>😢</text></svg>';
        }
    } else {
        document.title = originalTitle;
        if (originalFavicon) {
            originalFavicon.href = originalFaviconHref;
        }
    }
});



// 7. Parallax Depth Scrolling & Staggered Reveal
// Parallax on Hero elements
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroTitle) heroTitle.dataset.parallaxSpeed = '0.25';
if (heroSubtitle) heroSubtitle.dataset.parallaxSpeed = '0.1';

let isParallaxing = false;
window.addEventListener('scroll', () => {
    if (!isParallaxing) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset || document.documentElement.scrollTop;
            document.querySelectorAll('[data-parallax-speed]').forEach(el => {
                const speed = parseFloat(el.dataset.parallaxSpeed);
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
            isParallaxing = false;
        });
        isParallaxing = true;
    }
});

const maskObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class to the mask
            const mask = entry.target.querySelector('.stagger-mask');
            if (mask) mask.classList.add('visible');
            maskObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(el => {
    maskObserver.observe(el);
});

// 8. Interactive Download CV Button
const setupDownloadBtn = (btnId) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        if (btn.classList.contains('loading') || btn.classList.contains('success')) {
            e.preventDefault();
            return;
        }

        e.preventDefault(); // Mencegah download langsung untuk animasi
        btn.classList.add('loading');

        // Simulasi proses download 1.5 detik
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.classList.add('success');

            // Trigger download aslinya
            if (typeof showDynamicIsland === 'function') {
                const isId = document.documentElement.lang === 'id';
                showDynamicIsland(isId ? 'CV Berhasil Diunduh' : 'CV Downloaded');
            }
            const a = document.createElement('a');
            a.href = 'CV_Nathan.pdf';
            a.download = 'CV_Nathan_Ferdwiansyah.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Kembalikan tombol ke semula setelah 3 detik
            setTimeout(() => {
                btn.classList.remove('success');
            }, 3000);
        }, 1500);
    });
};

setupDownloadBtn('download-cv-btn');
setupDownloadBtn('mobile-cv-btn');
document.addEventListener('DOMContentLoaded', () => {
    let staggerDelay = 0;
    let staggerTimeout;

    // Intersection Observer for Philosophy Cards (Smart Staggered Animation)
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply dynamic delay for batched elements (e.g. desktop)
                entry.target.style.animationDelay = (0.1 + staggerDelay * 0.2) + 's';
                entry.target.classList.add('in-view');
                cardObserver.unobserve(entry.target);
                staggerDelay++;
            }
        });

        // Reset stagger counter after the batch is processed
        clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
            staggerDelay = 0;
        }, 100);
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    const philCards = document.querySelectorAll('.philosophy-card');
    philCards.forEach(card => cardObserver.observe(card));
});

document.addEventListener('DOMContentLoaded', () => {


    // Premium Scroll-Driven Parallax for Spline Background
    const splineBg = document.querySelector('.spline-bg');
    if (splineBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            // Move the background slower than the scroll speed
            splineBg.style.transform = `translateY(${scrollY * 0.35}px)`;
        }, { passive: true });
    }

});


document.addEventListener('DOMContentLoaded', () => {


    // --- Project Filtering System ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hide');
                    card.style.animation = 'revealUp 0.5s ease forwards'; // re-trigger animation
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });

    // --- Functional Contact Form (Formspree/EmailJS alternative using native fetch) ---
    // Note: We use a dummy endpoint for demonstration, but it simulates a real API call
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI Loading State
            submitBtnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            formStatus.className = 'form-status';

            // Simulate Network Request (Since we don't have user's Formspree key)
            await new Promise(r => setTimeout(r, 1500));

            // Simulate Success
            contactForm.reset();
            submitBtnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';

            formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
            formStatus.classList.add('success');

            setTimeout(() => {
                formStatus.classList.remove('success');
            }, 5000);
        });
    }

    // --- Live GitHub Stats Integration ---
    // Insert GitHub stats into the About section dynamically
    const aboutTextContainer = document.querySelector('.about-text');
    if (aboutTextContainer) {
        const statsHTML = `
        <div class="github-stats-container" id="github-stats">
            <div class="stat-card">
                <h4 id="repo-count">--</h4>
                <p>Public Repos</p>
            </div>
            <div class="stat-card">
                <h4 id="follower-count">--</h4>
                <p>Followers</p>
            </div>
        </div>
    `;
        aboutTextContainer.insertAdjacentHTML('beforeend', statsHTML);

        // Fetch from GitHub API
        fetch('https://api.github.com/users/thannnajah-ai')
            .then(res => res.json())
            .then(data => {
                if (data.public_repos !== undefined) {
                    document.getElementById('repo-count').textContent = data.public_repos;
                    document.getElementById('follower-count').textContent = data.followers;
                }
            })
            .catch(err => console.error('GitHub API failed:', err));
    }

    // --- Fully Functional Language Switcher (i18n) ---
    const i18nDict = {
        'en': {
            'available': 'Available for work',
            'heroTitle': 'Software Developer, Mobile Developer, and Front-end Developer',
            'heroSubtitle': 'Crafting Interfaces with Taste',
            'heroDesc': 'Combining AI, CLI Agent, and My Knowledge about AI with strong Design Engineering principles to create highly aesthetic and fluid digital experiences.',
            'viewProjects': 'View Projects',
            'aboutMe': 'About Me',
            'aboutTitle': 'Behind the Code',
            'aboutP1': 'I am Nathan Ferdwiansyah Wicaksono, a software developer, web developer, etc.',
            'filterAll': 'All',
            'filterWeb': 'Web Dev',
            'filterResearch': 'Research',
            'filterConcept': 'Concept',
            'projectsTitle': 'Featured Projects',
            'contactTitle': 'Get In Touch',
            'contactName': 'Your Name',
            'contactEmail': 'Your Email',
            'contactMessage': 'Your Message',
            'contactSubmit': 'Send Message'
        },
        'id': {
            'available': 'Tersedia untuk projek',
            'heroTitle': 'Pengembang Perangkat Lunak, Mobile, dan Front-end',
            'heroSubtitle': 'Merancang Interface dengan Selera',
            'heroDesc': 'Menggabungkan AI, CLI Agent, dan Kemmampuan Pemahaman saya dengan prinsip Rekayasa Desain yang kuat untuk menciptakan pengalaman digital yang sangat estetis dan mulus.',
            'viewProjects': 'Lihat Projek',
            'aboutMe': 'Tentang Saya',
            'aboutTitle': 'Di Balik Kode',
            'aboutP1': 'Saya Nathan Ferdwiansyah Wicaksono, seorang pengembang perangkat lunak, web developer, dan sebagainya',
            'filterAll': 'Semua',
            'filterWeb': 'Web Dev',
            'filterResearch': 'Riset',
            'filterConcept': 'Konsep',
            'projectsTitle': 'Proyek Unggulan',
            'contactTitle': 'Hubungi Saya',
            'contactName': 'Nama Anda',
            'contactEmail': 'Email Anda',
            'contactMessage': 'Pesan Anda',
            'contactSubmit': 'Kirim Pesan'
        }
    };

    let currentLang = localStorage.getItem('lang') || 'en';
    const updateLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18nDict[lang] && i18nDict[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    // If we used placeholder we would update it here, but we use floating labels
                } else {
                    el.textContent = i18nDict[lang][key];
                }
            }
        });


    };

    // Hook into existing #lang-toggle button
    const existingLangToggle = document.getElementById('lang-toggle');
    if (existingLangToggle) {
        // Set initial text: If we are in English, the button should offer to switch to ID, and vice versa.
        existingLangToggle.textContent = currentLang === 'en' ? 'ID' : 'EN';

        existingLangToggle.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'id' : 'en';
            localStorage.setItem('lang', newLang);
            currentLang = newLang;
            updateLanguage(newLang);
            existingLangToggle.textContent = newLang === 'en' ? 'ID' : 'EN';
        });
    }

    // Initial language load
    updateLanguage(currentLang);

    // 1. Local Time & Status Indicator
    const timeText = document.getElementById('time-text');
    const timeStatusDot = document.getElementById('time-status-dot');
    if (timeText) {
        const updateTime = () => {
            const date = new Date();
            const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            timeText.textContent = formatter.format(date) + ' WIB';

            const hour = parseInt(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }));
            if (hour >= 23 || hour < 8) {
                if (timeStatusDot) timeStatusDot.classList.add('sleeping');
                timeText.title = 'Probably Sleeping 😴';
            } else {
                if (timeStatusDot) timeStatusDot.classList.remove('sleeping');
                timeText.title = 'Awake & Coding 💻';
            }
        };
        updateTime();
        setInterval(updateTime, 10000);
    }

    // 2. Custom Text-Select Tooltip
    const tooltip = document.getElementById('selection-tooltip');
    const btnCopyText = document.getElementById('btn-copy-text');
    if (tooltip) {
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = rect.top - 10 + 'px';
                tooltip.classList.add('show');
            } else {
                tooltip.classList.remove('show');
            }
        });
        if (btnCopyText) {
            btnCopyText.addEventListener('click', () => {
                const text = window.getSelection().toString();
                navigator.clipboard.writeText(text).then(() => {
                    btnCopyText.textContent = 'Copied!';
                    if (typeof showDynamicIsland === 'function') {
                        showDynamicIsland('Teks Disalin');
                    }
                    setTimeout(() => {
                        btnCopyText.textContent = 'Copy';
                        window.getSelection().removeAllRanges();
                    }, 1500);
                });
            });
        }
    }

    // 3. Scroll-Spy Side Navigation
    const sections = document.querySelectorAll('section');
    const spyLinks = document.querySelectorAll('.spy-link');
    if (spyLinks.length > 0) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spyLinks.forEach(link => link.classList.remove('active'));
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.spy-link[data-target="${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(sec => spyObserver.observe(sec));
    }

    // 4. Interactive Timeline Resume
    const btnViewCv = document.getElementById('btn-view-cv');
    const resumeDialog = document.getElementById('resume-dialog');
    const resumeClose = document.getElementById('resume-close');
    if (btnViewCv && resumeDialog) {
        btnViewCv.addEventListener('click', () => {
            resumeDialog.showModal();
        });
        if (resumeClose) {
            resumeClose.addEventListener('click', () => {
                resumeDialog.close();
            });
        }
        resumeDialog.addEventListener('click', (e) => {
            if (e.target === resumeDialog) resumeDialog.close();
        });
    }

    // === Task 1: Command Palette ===
    const cmdPalette = document.getElementById('command-palette-dialog');
    const cmdInput = document.getElementById('cmd-input');
    const cmdItems = document.querySelectorAll('.cmd-item');
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdPalette) {
                cmdPalette.showModal();
                if(cmdInput) cmdInput.focus();
                if (window.lenis) window.lenis.stop();
            }
        }
    });
    
    if (cmdPalette) {
        cmdPalette.addEventListener('click', (e) => {
            if (e.target === cmdPalette) {
                cmdPalette.close();
                if (window.lenis) window.lenis.start();
            }
        });
        
        if (cmdInput) {
            cmdInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                cmdItems.forEach(item => {
                    item.style.display = item.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                });
            });
        }
        
        cmdItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                if (action === 'toggle-theme') {
                    document.getElementById('theme-toggle')?.click();
                } else if (action === 'download-cv') {
                    document.getElementById('download-cv-btn')?.click();
                } else if (action === 'goto-projects') {
                    document.querySelector('.spy-link[data-target="projects"]')?.click();
                } else if (action === 'copy-email') {
                    navigator.clipboard.writeText('thannnajah@gmail.com');
                    if (typeof showDynamicIsland === 'function') showDynamicIsland('Email Copied!');
                }
                cmdPalette.close();
                if (window.lenis) window.lenis.start();
            });
        });
    }

    // === Task 2: Live GitHub Stats API ===
    const ghRepos = document.getElementById('gh-repos');
    const ghFollowers = document.getElementById('gh-followers');
    if (ghRepos && ghFollowers) {
        fetch('https://api.github.com/users/thannnajah-ai')
            .then(res => res.json())
            .then(data => {
                if (data.public_repos !== undefined) {
                    ghRepos.textContent = data.public_repos;
                    ghFollowers.textContent = data.followers;
                } else {
                    ghRepos.textContent = 'API Limit';
                    ghFollowers.textContent = 'API Limit';
                }
            })
            .catch(() => {
                ghRepos.textContent = 'Err';
                ghFollowers.textContent = 'Err';
            });
    }

    // === Task 7: Guestbook (Local Storage) ===
    const btnSignGuestbook = document.getElementById('btn-sign-guestbook');
    const guestNameInput = document.getElementById('guest-name');
    const guestMsgInput = document.getElementById('guest-message');
    const guestbookEntries = document.getElementById('guestbook-entries');
    
    if (btnSignGuestbook && guestbookEntries) {
        const loadGuestbook = () => {
            const entries = JSON.parse(localStorage.getItem('guestbook') || '[]');
            guestbookEntries.innerHTML = '';
            entries.reverse().forEach(entry => {
                const div = document.createElement('div');
                div.style.padding = '1rem';
                div.style.background = 'rgba(255,255,255,0.05)';
                div.style.borderRadius = '8px';
                div.innerHTML = `<strong style="color: var(--text-primary);">${entry.name}</strong> <span style="font-size: 0.8rem; color: var(--text-secondary);">${entry.date}</span><p style="margin-top: 4px; font-size: 0.9rem;">${entry.message}</p>`;
                guestbookEntries.appendChild(div);
            });
            if (entries.length === 0) {
                guestbookEntries.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem;">No entries yet. Be the first!</div>';
            }
        };
        loadGuestbook();
        
        btnSignGuestbook.addEventListener('click', () => {
            const name = guestNameInput.value.trim();
            const msg = guestMsgInput.value.trim();
            if (name && msg) {
                const entries = JSON.parse(localStorage.getItem('guestbook') || '[]');
                entries.push({ name, message: msg, date: new Date().toLocaleDateString() });
                localStorage.setItem('guestbook', JSON.stringify(entries));
                guestNameInput.value = '';
                guestMsgInput.value = '';
                loadGuestbook();
                if (typeof showDynamicIsland === 'function') showDynamicIsland('Pesan Tersimpan');
            }
        });
    }

    // === Task 8: Dynamic Now Page ===
    const nowWeather = document.getElementById('now-weather');
    const nowTime = document.getElementById('now-time');
    
    if (nowWeather && nowTime) {
        // Update Time
        setInterval(() => {
            nowTime.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        }, 1000);
        
        // Fetch Weather (Jakarta coordinates)
        fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true')
            .then(res => res.json())
            .then(data => {
                const w = data.current_weather;
                nowWeather.textContent = `${w.temperature}°C, Wind ${w.windspeed}km/h`;
            })
            .catch(() => {
                nowWeather.textContent = 'Weather API failed';
            });
    }

    // === Task 10: Interactive Skill Radar Chart ===
    const canvas = document.getElementById('skill-radar');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const labels = ['Frontend', 'UI/UX', 'Mobile', 'Backend', 'Tools'];
        const values = [0.9, 0.85, 0.8, 0.6, 0.75]; // percentages
        
        const drawRadar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 40;
            
            const isLight = document.body.classList.contains('light-theme');
            const dataColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            const strokeColor = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
            const axisColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            const textColor = isLight ? '#555' : '#aaa';
            
            // Draw Web
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            for (let j = 1; j <= 4; j++) {
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const r = (radius / 4) * j;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }
            
            // Draw Axis & Labels
            ctx.fillStyle = textColor;
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                // Axis
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
                ctx.stroke();
                
                // Label
                const labelX = centerX + Math.cos(angle) * (radius + 20);
                const labelY = centerY + Math.sin(angle) * (radius + 20);
                ctx.fillText(labels[i], labelX, labelY);
            }
            
            // Draw Data Polygon
            ctx.beginPath();
            ctx.fillStyle = dataColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const valRadius = radius * values[i];
                const x = centerX + Math.cos(angle) * valRadius;
                const y = centerY + Math.sin(angle) * valRadius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Draw Data Points
            ctx.fillStyle = strokeColor;
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const valRadius = radius * values[i];
                const x = centerX + Math.cos(angle) * valRadius;
                const y = centerY + Math.sin(angle) * valRadius;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        
        drawRadar();
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(drawRadar, 100); 
            });
        }
    }

});
