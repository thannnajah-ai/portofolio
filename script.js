// Intersection Observer for natural scroll animations
// Following Emil Kowalski's philosophy: avoiding clunky entrances.
// We start slightly scaled down (0.98 in CSS) and fade in smoothly.

document.addEventListener("DOMContentLoaded", () => {
    // 0. Initialize Lenis Smooth Scroll (Design Engineering touch)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            smooth: true
        });

        function raf(time) {
            lenis.raf(time);
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
    const circleReveal = document.getElementById('theme-reveal-circle');

    themeToggleBtn.addEventListener('click', (e) => {
        const isLight = document.body.classList.contains('light-theme');

        // 360° spin animation
        themeToggleBtn.classList.remove('spin-anim');
        void themeToggleBtn.offsetWidth; // reflow to restart animation
        themeToggleBtn.classList.add('spin-anim');
        setTimeout(() => themeToggleBtn.classList.remove('spin-anim'), 650);

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
                if (typeof showDynamicIsland === 'function') showDynamicIsland('Dark Mode Activated');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-theme');
                if (typeof showDynamicIsland === 'function') showDynamicIsland('Light Mode Activated');
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

    // i18n Dictionary
    const i18n = {
        id: {
            available: "Tersedia untuk kerja",
            heroTitle: "Frontend & Mobile Developer",
            heroSubtitle: "Bikin Antarmuka yang Berasa",
            heroDesc: "Saya pakai AI buat nulis kode lebih cepat, tapi yang pegang kendali desainnya tetap saya.",
            viewProjects: "Lihat Proyek",
            aboutMe: "Tentang Saya",
            aboutP1: "Masih pelajar di <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong>, jurusan IPA. Lahir 23 Februari 2009. Mulai tertarik coding karena penasaran kenapa ada antarmuka yang kerasa hidup dan ada yang kerasa datar — terus nggak bisa berhenti.",
            aboutP2: "Sehari-hari saya pakai Claude Code CLI sama Antigravity buat akselerasi. Tapi keputusan desainnya tetap saya yang ambil. Saya pegang prinsip <em>Design Engineering</em> — produk yang keluar harus punya <em>good taste</em>, bukan cuma jalan.",
            skillsTitle: "Kemampuan & Selera",
            skill1Desc: "HTML5, CSS3, Vanilla JS — tanpa framework yang nambah beban. Flutter buat mobile cross-platform.",
            skill2Desc: "Animasi berbasis physics, custom easing, tactile feedback. Interaksinya kerasa presisi, bukan asal gerak.",
            skill3Desc: "Tipografi yang pas, spacing yang proporsional, desain yang punya karakter. Saya benci tampilan template.",
            projectsTitle: "Proyek Pilihan",
            project1Title: "TembusPTN.my.id",
            project1Desc: "Platform belajar UTBK/SNBT gratis. Antarmukanya saya rancang supaya orang bisa fokus belajar, bukan fokus navigasi.",
            project2Title: "Karya Tulis Ilmiah",
            project2Desc: "Penelitian tentang pengaruh cara konsumsi terhadap kadar glukosa nasi putih. Sisi saya yang lain di luar coding.",
            project3Title: "Proyek Berikutnya",
            project3Desc: "Masih digarap. Nantikan.",
            wipBadge: "Dalam Pengerjaan",
            wipLabel: "Lagi dimasak...",
            thoughtsTitle: "Catatan & Pikiran",
            contactTitle: "Hubungi Saya",
            sendBtn: "Kirim Pesan",
            blog1Title: "Kenapa Animasi UI Itu Penting",
            blog1Date: "20 Mei 2026",
            blog1Content: "<p>Banyak yang mikir animasi itu cuma hiasan. Padahal animasi yang dirancang dengan <em>good taste</em> punya fungsi konkret: <strong>feedback visual dan spasial</strong>.</p><p>Waktu kamu tekan tombol dan tombolnya merespons dengan ripple atau spring yang mulus, otak kamu merasa terhubung secara fisik sama layar. Itu yang bikin aplikasi terasa enak dipakai, bukan sekadar fungsional.</p><p>Detail mikro interaksi kayak gini yang saya kejar di setiap project.</p>",
            blog2Title: "Kenapa Saya Tinggalkan React dan Balik ke Vanilla JS",
            blog2Date: "15 April 2026",
            blog2Content: "<p>Ekosistem JavaScript sekarang kayaknya wajib pakai React, Next.js, atau Vue. Tapi untuk website statis kayak portofolio, semua framework itu cuma nambah beban tanpa manfaat yang sebanding.</p><p>Portofolio ini 100% Vanilla JS dan CSS murni. Hasilnya: nggak ada hydration yang lambat, nggak ada bundle file gila-gilaan, dan 60fps stabil bahkan di HP kelas bawah.</p><p>Kadang pilihan paling sederhana itu yang paling tepat.</p>",
            blog3Title: "Gimana Rasanya Coding Pakai AI Setiap Hari",
            blog3Date: "10 Sep 2026",
            blog3Content: "<p>Saya pakai Claude Code CLI dan Antigravity hampir setiap hari. Dan ini bukan magic — AI bisa salah, nulis kode yang nggak nyambung, atau malah nambah kompleksitas yang nggak perlu.</p><p>Yang menentukan hasilnya adalah cara pakainya. Kalau kamu cuma <em>paste output AI mentah-mentah</em>, hasilnya kelihatan — generik dan susah di-maintain. Cara saya: AI buat akselerasi, keputusan desain tetap di tangan saya.</p><p>Taste, judgment, sense of quality — itu yang nggak bisa didelegasikan ke AI.</p>",
            blog4Title: "Kenapa Saya Pilih Flutter buat Mobile",
            blog4Date: "1 Agt 2026",
            blog4Content: "<p>Yang pertama bikin saya tertarik sama Flutter bukan fitur-fiturnya, tapi filosofinya. Satu codebase, jalan di mana aja, dan UI-nya dikontrol penuh pixel by pixel.</p><p>React Native masih ngandalin native components, jadi ada batasan visual yang nggak bisa kamu tembus. Flutter punya canvas-nya sendiri — semua yang keliatan di layar itu Flutter yang gambar. Kalau kamu ngerti desain, kamu bisa bikin apapun yang kamu mau.</p><p>Buat saya yang obsesi sama UI detail, ini bedanya besar.</p>",
            philosophyTitle: "Filosofi Kerja",
            phil1Title: "Pixel Perfect",
            phil1Desc: "Desain bukan cuma soal tampilan, tapi tentang bagaimana setiap elemen memiliki proporsi dan fungsi yang tepat.",
            phil2Title: "Performance First",
            phil2Desc: "Animasi sekeren apa pun nggak ada artinya kalau bikin web lambat. Performa dan fluiditas adalah kunci.",
            phil3Title: "User Centric",
            phil3Desc: "Kode yang saya tulis selalu memprioritaskan empati terhadap end-user. Aksesibilitas dan kenyamanan nomor satu.",
            downloadCV: "Unduh CV",
            menuCV: "Unduh CV"
        },
        en: {
            available: "Available for work",
            heroTitle: "Frontend & Mobile Developer",
            heroSubtitle: "Building Interfaces That Feel Right",
            heroDesc: "I use AI to write code faster, but the design decisions stay with me.",
            viewProjects: "View Projects",
            aboutMe: "About Me",
            aboutP1: "Still a student at <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong> — science track. Born February 23, 2009. I got into coding because I kept noticing why some interfaces feel alive and others don't, and couldn't stop pulling at that thread.",
            aboutP2: "I work with Claude Code CLI and Antigravity daily for speed. But I make the design calls myself. I hold to <em>Design Engineering</em> principles — what ships has to have <em>good taste</em>, not just work.",
            skillsTitle: "Capabilities & Taste",
            skill1Desc: "HTML5, CSS3, Vanilla JS — no bloated framework in the middle. Flutter for cross-platform mobile.",
            skill2Desc: "Physics-based animations, custom easing, tactile feedback. Interactions feel precise, not generic.",
            skill3Desc: "Typography that fits, spacing that breathes, design with character. I avoid templates.",
            projectsTitle: "Featured Projects",
            project1Title: "TembusPTN.my.id",
            project1Desc: "Free UTBK/SNBT study platform. I designed the interface so people can focus on studying, not on navigating.",
            project2Title: "Scientific Research",
            project2Desc: "Research on how consumption method affects glucose levels in white rice. A different side of me outside coding.",
            project3Title: "Next Project",
            project3Desc: "Still in the works. Stay tuned.",
            wipBadge: "In Progress",
            wipLabel: "Something's cooking...",
            thoughtsTitle: "Thoughts & Logs",
            contactTitle: "Get In Touch",
            sendBtn: "Send Message",
            blog1Title: "Why UI Animation Matters",
            blog1Date: "May 20, 2026",
            blog1Content: "<p>A lot of people treat UI animations as decoration. Animation built with <em>good taste</em> does something concrete: it provides <strong>visual and spatial feedback</strong>.</p><p>When you press a button and it responds with a smooth ripple or spring, you feel a physical connection to the screen. That's what makes an app feel good to use, not just functional.</p><p>That micro-interaction detail is what I chase in every project.</p>",
            blog2Title: "Why I Left React and Went Back to Vanilla JS",
            blog2Date: "April 15, 2026",
            blog2Content: "<p>The JavaScript ecosystem says you have to use React, Next.js, or Vue. But for a static site like a portfolio, that framework overhead adds weight without a real payoff.</p><p>This portfolio is 100% Vanilla JS and pure CSS. No slow hydration, no massive bundle files, 60fps performance even on budget phones.</p><p>Sometimes the simpler choice is the right one.</p>",
            blog3Title: "What It's Actually Like to Code with AI Every Day",
            blog3Date: "Sep 10, 2026",
            blog3Content: "<p>I use Claude Code CLI and Antigravity almost every day. It's not magic — AI gets things wrong, writes code that doesn't fit, or adds complexity you didn't ask for.</p><p>What determines the output is how you use it. If you paste AI output raw, it shows — generic and hard to maintain. My approach: AI for speed, design decisions are mine.</p><p>Taste, judgment, sense of quality — those don't delegate well.</p>",
            blog4Title: "Why I Chose Flutter for Mobile",
            blog4Date: "Aug 1, 2026",
            blog4Content: "<p>What got me interested in Flutter wasn't the feature list. It was the philosophy. One codebase, runs anywhere, and the UI is fully controlled pixel by pixel.</p><p>React Native still depends on native components, so there are visual limits you can't push past. Flutter has its own canvas — everything on screen, Flutter drew it. If you understand design, you can build exactly what you picture.</p><p>For someone obsessed with UI detail, that difference matters.</p>",
            philosophyTitle: "Work Philosophy",
            phil1Title: "Pixel Perfect",
            phil1Desc: "Design is not just what it looks like. It's about how every element has its exact proportion and function.",
            phil2Title: "Performance First",
            phil2Desc: "Cool animations mean nothing if they make the web slow. Performance and fluidity are key.",
            phil3Title: "User Centric",
            phil3Desc: "The code I write always prioritizes empathy for the end-user. Accessibility and comfort are number one.",
            downloadCV: "Download CV",
            menuCV: "Download CV"
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
            projectModal.showModal();
            if (window.lenis) window.lenis.stop();
        }
    });
});

if (projectModalClose && projectModal) {
    projectModalClose.addEventListener('click', () => {
        projectModal.classList.add('closing');
        setTimeout(() => {
            projectModal.close();
            projectModal.classList.remove('closing');
            if (window.lenis) window.lenis.start();
        }, 300);
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
            projectModal.classList.add('closing');
            setTimeout(() => {
                projectModal.close();
                projectModal.classList.remove('closing');
                if (window.lenis) window.lenis.start();
            }, 300);
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
});
