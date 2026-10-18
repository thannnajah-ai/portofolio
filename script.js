// Global Error Boundary & Fallback System
window.addEventListener('error', (event) => {
    console.warn("[AGY Boundary] Caught script error:", event.message);
    let logs = JSON.parse(localStorage.getItem('agy_analytics') || '{"errors":[]}');
    logs.errors.push({msg: event.message, time: Date.now()});
    localStorage.setItem('agy_analytics', JSON.stringify(logs));
    event.preventDefault(); // Graceful degradation
});
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.name === 'AbortError' || String(event.reason).includes('Transition was skipped'))) {
        event.preventDefault();
        return;
    }
    console.warn("[AGY Boundary] Caught unhandled promise rejection:", event.reason);
    let logs = JSON.parse(localStorage.getItem('agy_analytics') || '{"errors":[]}');
    logs.errors.push({msg: String(event.reason), time: Date.now()});
    localStorage.setItem('agy_analytics', JSON.stringify(logs));
});

// Centralized Bilingual Language State
let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'en';
let i18nData = null;

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

    // Initialize theme from storage or system preference
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    }
    
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
            cursorX += (mouseX - cursorX) * 0.8;
            cursorY += (mouseY - cursorY) * 0.8;

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

    i18nData = {
        en: {
            "metaTitle": "Nathan Ferdwiansyah W. | Frontend Developer",
            "metaDesc": "Frontend Developer crafting intuitive digital experiences. Focused on clean semantic HTML, modern CSS, and performant JavaScript.",
            "available": "Available for work",
            "navHome": "Home",
            "navAbout": "About",
            "navSkills": "Skills",
            "navProjects": "Projects",
            "navThoughts": "Thoughts",
            "heroTitle": "Frontend Developer",
            "heroSubtitle": "Crafting intuitive digital experiences.",
            "heroDesc": "Specializing in clean HTML, modern CSS, and performant JavaScript to turn interface designs into accessible, responsive web experiences.",
            "viewProjects": "View Projects",
            "aboutMe": "About Me",
            "aboutTitle": "Behind the Code",
            "btnViewCv": "Interactive Resume",
            "aboutP1": "Student at <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong> (Science stream, born Feb 23, 2009) with a deep passion for frontend web development. I focus on creating interfaces where layout structure, interaction fidelity, and speed work together naturally.",
            "aboutP2": "My core foundation is built on semantic HTML5, modern modular CSS, and Vanilla JavaScript. I leverage AI tools for development acceleration, while keeping architecture, accessibility, and visual craft strictly under personal engineering control.",
            "nowTitle": "RIGHT NOW IN YOGYAKARTA",
            "nowWeather": "Fetching weather...",
            "publicRepos": "Public Repos",
            "followers": "Followers",
            "resumeTitle": "Interactive Resume",
            "resumeCloseAria": "Close Resume",
            "resume1Title": "Frontend Developer",
            "resume1Period": "2024 — Present",
            "resume1Desc": "Building responsive, accessible web interfaces and component systems using semantic HTML, CSS, and Vanilla JavaScript.",
            "resume2Title": "UI/UX & Web Foundations",
            "resume2Period": "2023 — 2024",
            "resume2Desc": "Studying layout design principles, visual hierarchy, responsive grids, and DOM manipulation.",
            "resume3Title": "Programming Foundations",
            "resume3Period": "2021 — 2023",
            "resume3Desc": "Learned algorithms, data structures, and the core fundamentals of web development.",
            "skillsTitle": "Capabilities & Focus",
            "skill1Title": "Core Tech Stack",
            "skill1Desc": "Strong command of modern semantic HTML5, CSS3 architecture, and Vanilla JavaScript without unnecessary framework bloat.",
            "skill2Title": "Interface Motion",
            "skill2Desc": "Crafting natural transitions with custom easing curves and tactile feedback, ensuring interactions feel purposeful and respect reduced motion preferences.",
            "skill3Title": "UI Craft & Hierarchy",
            "skill3Desc": "Designing interfaces with strict typographic hierarchy, intentional spacing systems, and dark/light modes engineered for clarity across all screens.",
            "philosophyTitle": "Work Philosophy",
            "phil1Title": "Visual Precision",
            "phil1Desc": "Interfaces should feel deliberate. Every spacing token, border, and typography choice serves visual clarity and ease of use.",
            "phil2Title": "Performance First",
            "phil2Desc": "Fluidity is meaningless if the page stutters. Lightweight assets and efficient DOM operations keep experiences fast on any device.",
            "phil3Title": "User-Centric & Accessible",
            "phil3Desc": "Code should serve people. Clean keyboard navigation, screen-reader friendly labels, and high readability come first.",
            "projectsTitle": "Featured Projects",
            "filterAll": "All",
            "filterWeb": "Web Dev",
            "filterResearch": "Research",
            "searchPlaceholder": "Search projects...",
            "project1Tag": "Case Study • Web App",
            "project1Title": "TembusPTN.my.id",
            "project1Desc": "Educational web platform designed to help students prepare for UTBK/SNBT exams. Led the frontend interface implementation: clean question navigation, readable typography, and distraction-free responsive practice views.",
            "project2Tag": "Research Paper",
            "project2Title": "Scientific Research: Rice Glycemic Response",
            "project2Desc": "Scientific paper exploring the impact of consumption methods on white rice glycemic response. Highlights analytical discipline, structured documentation, and research rigor applied alongside engineering.",
            "modalCloseAria": "Close Project",
            "modalViewProject": "Visit Project / View Document",
            "thoughtsTitle": "Thoughts & Logs",
            "blogCloseAria": "Close Article",
            "blog1Title": "Why UI Animation Matters",
            "blog1Date": "May 20, 2026",
            "blog1Content": "<p>UI animation is often treated as simple decoration, but well-designed motion serves a functional purpose: <strong>clear spatial feedback and state communication</strong>.</p><p>When an interactive element responds with subtle spring physics or smooth transitions, the user instantly understands that the system registered their intent. It transforms a static layout into a responsive tool.</p><p>Crafting intentional micro-interactions without sacrificing frame rates is a core standard I apply to every frontend project.</p>",
            "blog2Title": "Why I Value Vanilla JavaScript for Core Interfaces",
            "blog2Date": "April 15, 2026",
            "blog2Content": "<p>Modern web development often defaults to heavy framework stacks for every project. While frameworks have their place in large complex systems, applying them to focused web interfaces often introduces unnecessary hydration delays and large bundle sizes.</p><p>Building directly with Vanilla JavaScript and modern CSS provides immediate benefits: zero compile-step overhead, sub-millisecond execution, and complete control over the DOM. It forces a deeper understanding of browser standards and performance.</p><p>Choosing the simplest tool that fully solves the problem is genuine engineering maturity.</p>",
            "blog3Title": "Practical AI Workflows for Frontend Engineering",
            "blog3Date": "Sep 10, 2026",
            "blog3Content": "<p>Using AI in day-to-day development is a powerful force multiplier when guided with intention. It excels at boilerplate generation, exploring algorithmic variations, and catching edge cases.</p><p>However, AI cannot replace taste, architecture decisions, or user empathy. Generating code without validating semantic structure, accessibility attributes, and UX nuances produces bloated, generic interfaces.</p><p>My approach is clear: leverage AI for development speed, but take full responsibility for design decisions, code quality, and the final user experience.</p>",
            "blog4Title": "Bridging Design Principles and Frontend Implementation",
            "blog4Date": "Aug 1, 2026",
            "blog4Content": "<p>Great digital products happen at the intersection of visual design and technical execution. An interface can look stunning in a design mock, but fall apart if responsive breakpoints, touch targets, and contrast ratios are neglected in code.</p><p>A frontend developer must understand visual hierarchy, typography scales, and negative space just as well as CSS specificity, event loops, and DOM performance.</p><p>Treating code as a design medium ensures that what gets deployed feels as polished and intentional as what was envisioned.</p>",
            "guestbookTitle": "Guestbook",
            "guestNamePlaceholder": "Your name",
            "guestMsgPlaceholder": "Leave a friendly note...",
            "guestSignBtn": "Sign",
            "guestLoading": "Loading messages...",
            "guestEmpty": "No entries yet. Be the first to leave a message!",
            "guestOffline": "Guestbook service is currently offline or unreachable.",
            "guestRetry": "Try Again",
            "guestValidation": "Please fill in your name and message before submitting.",
            "guestSubmitting": "Signing...",
            "guestSending": "Sending message...",
            "guestSuccess": "Message sent successfully!",
            "guestFailed": "Failed to send: Guestbook service is currently unreachable.",
            "contactTitle": "Get In Touch",
            "contactStep1Title": "What's your name?",
            "contactNamePlaceholder": "Your name",
            "contactNextBtn": "Next",
            "contactStep2Title": "What would you like to discuss?",
            "contactMsgPlaceholder": "Tell me about your project, idea, or inquiry...",
            "contactBackBtn": "Back",
            "contactSubmitBtn": "Send Message",
            "contactSendingBtn": "Sending...",
            "contactSuccessTitle": "Message Sent!",
            "contactSuccessDesc": "Thank you for reaching out. I'll get back to you as soon as possible.",
            "contactErrorTitle": "Oops!",
            "contactErrorDesc": "Something went wrong while sending your message. Please try again later.",
            "contactResetBtn": "Send Another Message",
            "cmdPlaceholder": "Type a command or search...",
            "cmdTheme": "Toggle Dark/Light Mode",
            "cmdCV": "Download CV",
            "cmdProjects": "Go to Projects",
            "cmdEmail": "Copy Email to Clipboard",
            "error404Title": "Not Found",
            "error404Desc": "The section you're looking for doesn't exist or has been moved.",
            "error404Btn": "Take Me Home",
            "copyText": "Copy",
            "menuTheme": "Toggle Theme",
            "menuCV": "Download CV",
            "downloadCV": "Interactive Resume",
            "checkingUpdates": "Checking latest updates...",
            "footerTagline": "Designed & Engineered with Vanilla HTML, CSS & JavaScript",
            "marqueeContent": "<span>FRONTEND DEVELOPER &nbsp;•&nbsp; UI CRAFTSMAN &nbsp;•&nbsp; WEB INTERFACES &nbsp;•&nbsp; ACCESSIBLE & RESPONSIVE &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; UI CRAFTSMAN &nbsp;•&nbsp; WEB INTERFACES &nbsp;•&nbsp; ACCESSIBLE & RESPONSIVE &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; UI CRAFTSMAN &nbsp;•&nbsp; WEB INTERFACES &nbsp;•&nbsp; ACCESSIBLE & RESPONSIVE &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; UI CRAFTSMAN &nbsp;•&nbsp; WEB INTERFACES &nbsp;•&nbsp; ACCESSIBLE & RESPONSIVE &nbsp;•&nbsp;</span>"
        },
        id: {
            "metaTitle": "Nathan Ferdwiansyah W. | Frontend Developer",
            "metaDesc": "Frontend Developer yang membangun pengalaman digital intuitif. Fokus pada HTML semantik, CSS modern, dan JavaScript performan.",
            "available": "Tersedia untuk proyek",
            "navHome": "Beranda",
            "navAbout": "Tentang",
            "navSkills": "Keahlian",
            "navProjects": "Proyek",
            "navThoughts": "Catatan",
            "heroTitle": "Frontend Developer",
            "heroSubtitle": "Membangun pengalaman digital intuitif.",
            "heroDesc": "Fokus pada struktur HTML bersih, CSS modern, dan JavaScript performan untuk mewujudkan antarmuka web yang responsif, rapi, dan nyaman digunakan.",
            "viewProjects": "Lihat Proyek",
            "aboutMe": "Tentang Saya",
            "aboutTitle": "Di Balik Kode",
            "btnViewCv": "Resume Interaktif",
            "aboutP1": "Pelajar di <strong>MA Mu'allimin Muhammadiyah Yogyakarta</strong> (jurusan IPA, lahir 23 Februari 2009) yang mendalami pengembangan frontend web. Saya berfokus membangun antarmuka web yang rapi, interaktif, dan ringan diakses di berbagai perangkat.",
            "aboutP2": "Fondasi kerja saya berakar pada HTML5 semantik, CSS modular modern, dan Vanilla JavaScript. Saya memanfaatkan AI tools untuk akselerasi alur kerja teknis, sementara rancangan tata letak, detail aksesibilitas, dan kualitas interaksi tetap saya kendalikan secara penuh.",
            "nowTitle": "SAAT INI DI YOGYAKARTA",
            "nowWeather": "Memuat cuaca...",
            "publicRepos": "Repositori Publik",
            "followers": "Pengikut",
            "resumeTitle": "Resume Interaktif",
            "resumeCloseAria": "Tutup Resume",
            "resume1Title": "Frontend Developer",
            "resume1Period": "2024 — Sekarang",
            "resume1Desc": "Membangun antarmuka web yang responsif, aksesibel, dan terstruktur menggunakan HTML semantik, CSS, dan Vanilla JavaScript.",
            "resume2Title": "Eksplorasi UI/UX & Web",
            "resume2Period": "2023 — 2024",
            "resume2Desc": "Mempelajari prinsip tata letak antarmuka, hierarki visual, grid responsif, dan manipulasi DOM.",
            "resume3Title": "Dasar Pemrograman",
            "resume3Period": "2021 — 2023",
            "resume3Desc": "Mempelajari algoritma dasar, struktur data, dan fondasi pengembangan web.",
            "skillsTitle": "Kemampuan & Fokus",
            "skill1Title": "Fondasi Teknologi Web",
            "skill1Desc": "Penguasaan fondasi web modern: HTML5 semantik, arsitektur CSS3 (variabel, Flexbox, Grid), dan Vanilla JavaScript tanpa beban dependensi berlebih.",
            "skill2Title": "Interaksi & Animasi UI",
            "skill2Desc": "Penerapan animasi transisi CSS dan JavaScript dengan kurva easing yang halus dan tactile feedback, memastikan interaksi terasa hidup dan tetap menghargai reduced motion.",
            "skill3Title": "Desain UI & Hirarki",
            "skill3Desc": "Perancangan antarmuka dengan hierarki tipografi yang jelas, sistem spacing yang proporsional, serta mode gelap/terang yang dirancang untuk kenyamanan membaca di berbagai ukuran layar.",
            "philosophyTitle": "Prinsip Kerja",
            "phil1Title": "Presisi Visual",
            "phil1Desc": "Antarmuka harus terencana. Setiap proporsi spacing, border, dan tipografi berfungsi memperjelas konten dan mempermudah pengguna.",
            "phil2Title": "Utamakan Performa",
            "phil2Desc": "Fluiditas visual tidak berguna jika halaman berat. Aset ringan dan manipulasi DOM yang efisien menjaga website tetap cepat di perangkat apa pun.",
            "phil3Title": "Berpusat pada Pengguna & Aksesibel",
            "phil3Desc": "Kode harus melayani pengguna nyata. Navigasi keyboard yang jelas, label aksesibel, dan keterbacaan tinggi selalu menjadi prioritas.",
            "projectsTitle": "Proyek Pilihan",
            "filterAll": "Semua",
            "filterWeb": "Web Dev",
            "filterResearch": "Riset",
            "searchPlaceholder": "Cari proyek...",
            "project1Tag": "Studi Kasus • Web App",
            "project1Title": "TembusPTN.my.id",
            "project1Desc": "Platform belajar persiapan ujian UTBK/SNBT gratis. Berfokus pada implementasi antarmuka frontend: navigasi soal yang mudah dipahami, tipografi yang nyaman dibaca, serta tata letak responsif bebas distraksi.",
            "project2Tag": "Karya Tulis Ilmiah",
            "project2Title": "Karya Tulis Ilmiah: Kadar Glukosa Nasi Putih",
            "project2Desc": "Penelitian ilmiah mengenai pengaruh cara konsumsi terhadap kadar glukosa pada nasi putih. Menunjukkan ketelitian analisis data, metode eksperimen, dan disiplin dokumentasi di samping pengembangan web.",
            "modalCloseAria": "Tutup Proyek",
            "modalViewProject": "Kunjungi Proyek / Buka Dokumen",
            "thoughtsTitle": "Catatan & Jurnal",
            "blogCloseAria": "Tutup Artikel",
            "blog1Title": "Pentingnya Animasi dalam Antarmuka Web",
            "blog1Date": "20 Mei 2026",
            "blog1Content": "<p>Animasi antarmuka sering kali hanya dianggap sebagai pemanis tampilan. Padahal, motion yang dirancang dengan terencana memiliki fungsi esensial: <strong>feedback spasial yang jelas dan komunikasi status sistem</strong>.</p><p>Ketika elemen interaktif merespons dengan transisi yang proporsional, pengguna langsung memahami bahwa sistem menerima aksi mereka. Hal ini mengubah halaman statis menjadi alat kerja yang responsif dan nyaman.</p><p>Membangun mikro-interaksi yang bermakna tanpa mengorbankan performa adalah standar utama yang saya pegang dalam setiap proyek frontend.</p>",
            "blog2Title": "Alasan Memilih Vanilla JavaScript untuk Antarmuka Inti",
            "blog2Date": "15 April 2026",
            "blog2Content": "<p>Pengembangan web modern sering kali langsung mengandalkan framework besar untuk setiap kebutuhan. Meskipun framework memiliki tempatnya pada sistem berskala masif, menerapkannya pada antarmuka web mandiri sering kali menambah beban hidrasi dan ukuran berkas yang tidak perlu.</p><p>Membangun langsung dengan Vanilla JavaScript dan CSS modern memberikan kendali penuh atas DOM, waktu muat instan, dan performa tinggi tanpa dependensi berlebih. Pendekatan ini melatih pemahaman mendalam terhadap standar browser native.</p><p>Memilih solusi paling sederhana yang menyelesaikan masalah secara tepat adalah bentuk kedewasaan teknis.</p>",
            "blog3Title": "Pemanfaatan AI yang Efektif dalam Rekayasa Frontend",
            "blog3Date": "10 Sep 2026",
            "blog3Content": "<p>Pemanfaatan alat bantu AI dalam pengembangan harian dapat mengakselerasi produktivitas secara signifikan jika diarahkan dengan tujuan yang jelas. AI sangat berguna untuk menyusun struktur awal, eksplorasi variasi algoritma, dan mengidentifikasi edge case.</p><p>Kendati demikian, AI tidak dapat menggantikan pertimbangan desain, arsitektur kode, maupun empati terhadap pengguna. Menelan keluaran AI secara mentah sering kali menghasilkan kode yang rentan dan antarmuka yang generik.</p><p>Pendekatan saya lugas: jadikan AI sebagai akselerator teknis, namun tanggung jawab terhadap estetika, aksesibilitas, dan kualitas produk akhir tetap berada di tangan developer.</p>",
            "blog4Title": "Menghubungkan Prinsip Desain dengan Implementasi Frontend",
            "blog4Date": "1 Agt 2026",
            "blog4Content": "<p>Produk digital yang berkualitas lahir dari pertemuan antara perancangan visual dan eksekusi teknis yang presisi. Sebuah antarmuka bisa terlihat menarik pada rancangan grafis, namun kehilangan kualitas jika breakpoint responsif, area sentuh, dan kontras warna diabaikan saat pengkodean.</p><p>Pengembang frontend perlu memahami hierarki visual, skala tipografi, dan ruang negatif sebaik pemahamannya terhadap spesifisitas CSS, event loop, dan performa DOM.</p><p>Memperlakukan kode sebagai media desain memastikan hasil yang tampil di layar pengguna tetap presisi dan nyaman digunakan.</p>",
            "guestbookTitle": "Buku Tamu",
            "guestNamePlaceholder": "Nama Anda",
            "guestMsgPlaceholder": "Tulis pesan singkat...",
            "guestSignBtn": "Kirim",
            "guestLoading": "Memuat pesan...",
            "guestEmpty": "Belum ada pesan. Jadilah yang pertama mengisi!",
            "guestOffline": "Layanan guestbook sedang offline atau tidak dapat dijangkau.",
            "guestRetry": "Coba Lagi",
            "guestValidation": "Harap isi nama dan pesan Anda sebelum mengirim.",
            "guestSubmitting": "Mengirim...",
            "guestSending": "Mengirim pesan...",
            "guestSuccess": "Pesan berhasil terkirim!",
            "guestFailed": "Gagal mengirim: Layanan guestbook tidak dapat dijangkau saat ini.",
            "contactTitle": "Hubungi Saya",
            "contactStep1Title": "Siapa nama Anda?",
            "contactNamePlaceholder": "Nama Anda",
            "contactNextBtn": "Lanjut",
            "contactStep2Title": "Apa yang ingin Anda bicarakan?",
            "contactMsgPlaceholder": "Ceritakan proyek, ide, atau pertanyaan Anda...",
            "contactBackBtn": "Kembali",
            "contactSubmitBtn": "Kirim Pesan",
            "contactSendingBtn": "Mengirim...",
            "contactSuccessTitle": "Pesan Terkirim!",
            "contactSuccessDesc": "Terima kasih telah menghubungi. Saya akan membalas pesan Anda secepatnya.",
            "contactErrorTitle": "Terjadi Kesalahan",
            "contactErrorDesc": "Terjadi kesalahan saat mengirim pesan. Silakan coba beberapa saat lagi.",
            "contactResetBtn": "Kirim Pesan Lain",
            "cmdPlaceholder": "Ketik perintah atau cari...",
            "cmdTheme": "Ganti Mode Gelap/Terang",
            "cmdCV": "Unduh CV",
            "cmdProjects": "Menuju ke Proyek",
            "cmdEmail": "Salin Email ke Clipboard",
            "error404Title": "Tidak Ditemukan",
            "error404Desc": "Bagian yang Anda cari tidak ditemukan atau telah dipindahkan.",
            "error404Btn": "Kembali ke Beranda",
            "copyText": "Salin",
            "menuTheme": "Ganti Tema",
            "menuCV": "Unduh CV",
            "downloadCV": "Resume Interaktif",
            "checkingUpdates": "Memeriksa pembaruan...",
            "footerTagline": "Dirancang & Dibangun dengan Vanilla HTML, CSS & JavaScript",
            "marqueeContent": "<span>FRONTEND DEVELOPER &nbsp;•&nbsp; DESAIN ANTARMUKA &nbsp;•&nbsp; WEB INTERAKTIF &nbsp;•&nbsp; RESPONSIF & AKSESIBEL &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; DESAIN ANTARMUKA &nbsp;•&nbsp; WEB INTERAKTIF &nbsp;•&nbsp; RESPONSIF & AKSESIBEL &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; DESAIN ANTARMUKA &nbsp;•&nbsp; WEB INTERAKTIF &nbsp;•&nbsp; RESPONSIF & AKSESIBEL &nbsp;•&nbsp;</span><span>FRONTEND DEVELOPER &nbsp;•&nbsp; DESAIN ANTARMUKA &nbsp;•&nbsp; WEB INTERAKTIF &nbsp;•&nbsp; RESPONSIF & AKSESIBEL &nbsp;•&nbsp;</span>"
        }
    };

    // Expose dictionary globally for component access & testing
    window.__i18n = i18nData;

    function setLanguage(lang, showToast = false) {
        currentLang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('lang', lang);

        if (showToast && typeof showDynamicIsland === 'function') {
            showDynamicIsland(lang === 'id' ? 'Bahasa Indonesia Aktif' : 'English Activated');
        }

        const dict = i18nData[lang];
        if (!dict) return;

        // 1. Text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });

        // 2. Placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) {
                el.placeholder = dict[key];
            }
        });

        // 3. Aria-label attributes
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key] !== undefined) {
                el.setAttribute('aria-label', dict[key]);
            }
        });

        // 4. Update language toggle button label and accessible description
        const langToggleBtn = document.getElementById('lang-toggle');
        if (langToggleBtn) {
            langToggleBtn.textContent = lang === 'en' ? 'ID' : 'EN';
            langToggleBtn.setAttribute(
                'aria-label',
                lang === 'en' ? 'Switch language to Indonesian' : 'Ganti bahasa ke Bahasa Inggris'
            );
        }

        // 5. Update hero animated words
        const heroSpans = document.querySelectorAll('.hero-title span[data-i18n]');
        heroSpans.forEach((span, spanIdx) => {
            const key = span.getAttribute('data-i18n');
            const text = (dict[key] || span.textContent || '').trim();
            if (!text) return;
            span.innerHTML = '';

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
                inner.style.animationDelay = `${0.2 + (spanIdx * 0.2) + (index * 0.1)}s`;
                inner.style.animation = 'revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                inner.style.opacity = '0';
                inner.style.transform = 'translateY(120%)';

                inner.textContent = word;
                mask.appendChild(inner);
                span.appendChild(mask);

                if (index < words.length - 1) {
                    span.appendChild(document.createTextNode(' '));
                }
            });
        });

        // 6. Update meta title & description
        if (dict['metaTitle']) document.title = dict['metaTitle'];
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict['metaDesc']) metaDesc.setAttribute('content', dict['metaDesc']);

        // 7. Redraw radar chart if active
        if (typeof window.__drawSkillRadar === 'function') {
            window.__drawSkillRadar();
        }

        // 8. Dispatch language change event for other components
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, dict } }));
    }

    window.__setLanguage = setLanguage;

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

    // Initialize Language from localStorage or default to EN
    setLanguage(currentLang, false);

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            langToggleBtn.classList.remove('flip-anim');
            void langToggleBtn.offsetWidth;
            langToggleBtn.classList.add('flip-anim');
            setTimeout(() => langToggleBtn.classList.remove('flip-anim'), 420);

            const newLang = currentLang === 'en' ? 'id' : 'en';
            setLanguage(newLang, true);
        });
    }



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
        const lang = currentLang || localStorage.getItem('lang') || 'en';
        logsTimeline.innerHTML = `<div style="color: var(--text-muted); font-size: 0.9rem;">${lang === 'id' ? 'Memuat commit terbaru dari GitHub...' : 'Fetching live commits from GitHub...'}</div>`;

        fetch('https://api.github.com/repos/thannnajah-ai/portofolio/commits')
            .then(response => response.json())
            .then(data => {
                logsTimeline.innerHTML = ''; // clear loading text

                // Get latest 4 commits
                const commits = data.slice(0, 4);
                const curLang = currentLang || localStorage.getItem('lang') || 'en';
                commits.forEach(commitObj => {
                    const hash = commitObj.sha.substring(0, 7);
                    const dateObj = new Date(commitObj.commit.author.date);
                    const dateStr = dateObj.toLocaleDateString(curLang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const msg = humanizeCommit(commitObj.commit.message);

                    const div = document.createElement('div');
                    div.className = 'log-item';
                    div.innerHTML = `<div class="log-date">${dateStr}</div><div class="log-msg"><a href="${commitObj.html_url}" target="_blank" class="log-hash" style="text-decoration:none">${hash}</a> ${msg}</div>`;
                    logsTimeline.appendChild(div);
                });
            })
            .catch(err => {
                const curLang = currentLang || localStorage.getItem('lang') || 'en';
                logsTimeline.innerHTML = `<div style="color: var(--text-muted); font-size: 0.9rem;">${curLang === 'id' ? 'Gagal memuat commit GitHub.' : 'Failed to load live commits.'}</div>`;
                console.error('Error fetching commits:', err);
            });
    }


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
            const curLang = currentLang || localStorage.getItem('lang') || 'en';
            const metaTitle = (i18nData[curLang] && i18nData[curLang].metaTitle) || "Nathan Ferdwiansyah W. | Frontend Developer";
            document.title = metaTitle;
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
                const lang = currentLang || localStorage.getItem('lang') || 'en';
                if (i18nData[lang]) {
                    blogDialogTitle.innerHTML = i18nData[lang][blog.titleKey] || '';
                    blogDialogDate.innerHTML = i18nData[lang][blog.dateKey] || '';
                    blogDialogContent.innerHTML = i18nData[lang][blog.contentKey] || '';
                }

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
        const svgEl = card.querySelector('.project-image .placeholder-img');

        if (titleEl) projectModalTitle.innerHTML = titleEl.innerHTML;
        if (descEl) projectModalDesc.innerHTML = descEl.innerHTML;

        if (imgEl) {
            projectModalImgContainer.innerHTML = `<img src="${imgEl.src}" alt="${titleEl ? titleEl.textContent : 'Project'}">`;
        } else if (svgEl) {
            projectModalImgContainer.innerHTML = `<div class="placeholder-img" style="background: linear-gradient(135deg, #1f2937, #111827); height: 180px; display: flex; align-items: center; justify-content: center;">${svgEl.innerHTML}</div>`;
        } else {
            projectModalImgContainer.innerHTML = '';
        }

        const href = card.getAttribute('href');
        if (href && href !== '#') {
            projectModalLink.href = href;
            projectModalLink.style.display = 'inline-block';
            const isId = document.documentElement.lang === 'id';
            projectModalLink.textContent = isId ? 'Kunjungi Proyek / Buka Dokumen' : 'Visit Project / View Document';
        } else {
            projectModalLink.style.display = 'none';
        }

        const safeViewTransition = (callback) => {
            if (document.startViewTransition) {
                try {
                    const vt = document.startViewTransition(callback);
                    if (vt && vt.finished) vt.finished.catch(() => {});
                    return vt;
                } catch (e) {
                    callback();
                }
            } else {
                callback();
            }
        };

        if (projectModal) {
            safeViewTransition(() => projectModal.showModal());
            if (window.lenis) window.lenis.stop();
        }
    });
});

if (projectModalClose && projectModal) {
    const safeViewTransition = (callback) => {
        if (document.startViewTransition) {
            try {
                const vt = document.startViewTransition(callback);
                if (vt && vt.finished) vt.finished.catch(() => {});
                return vt;
            } catch (e) {
                callback();
            }
        } else {
            callback();
        }
    };

    projectModalClose.addEventListener('click', () => {
        if (document.startViewTransition) {
            safeViewTransition(() => {
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
                safeViewTransition(() => {
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

    // --- Spline Hero Manager & Fallback Controller ---
    const initSplineHero = async () => {
        const container = document.querySelector('.spline-bg');
        if (!container) return;

        const viewer = container.querySelector('spline-viewer');
        const fallback = container.querySelector('.spline-fallback');

        // Normalize attribute to data-url so viewer doesn't fetch prematurely
        if (viewer && viewer.hasAttribute('url') && !viewer.hasAttribute('data-url')) {
            viewer.setAttribute('data-url', viewer.getAttribute('url'));
            viewer.removeAttribute('url');
        }

        const targetUrl = viewer ? (viewer.getAttribute('data-url') || viewer.getAttribute('url')) : null;

        let isResolved = false;
        let loadWatchdog = null;

        const activateFallback = (reason) => {
            if (isResolved) return;
            isResolved = true;
            if (loadWatchdog) clearTimeout(loadWatchdog);
            console.warn(`[Spline Hero] 3D scene failed to load (${reason}). Activating aesthetic fallback.`);
            container.classList.add('has-fallback');
            container.classList.remove('spline-loaded');
            if (viewer) {
                viewer.style.display = 'none';
                viewer.removeAttribute('url');
            }
            if (fallback) {
                fallback.classList.add('is-active');
            }
        };

        const activateSpline = () => {
            if (isResolved) return;
            isResolved = true;
            if (loadWatchdog) clearTimeout(loadWatchdog);
            console.info('[Spline Hero] 3D scene loaded successfully.');
            container.classList.add('spline-loaded');
            container.classList.remove('has-fallback');
            if (viewer) {
                viewer.style.display = 'block';
            }
            if (fallback) {
                fallback.classList.remove('is-active');
            }
        };

        window.__splineHero = {
            activateSpline: () => { isResolved = false; activateSpline(); },
            activateFallback: (reason) => { isResolved = false; activateFallback(reason); },
            isLoaded: () => container.classList.contains('spline-loaded'),
            hasFallback: () => container.classList.contains('has-fallback')
        };

        if (!viewer || !targetUrl) {
            activateFallback('No Spline scene viewer or URL configured');
            return;
        }

        // Attach event listeners to viewer for completion and WebGL failure
        viewer.addEventListener('load-complete', activateSpline, { once: true });
        viewer.addEventListener('context-loss', () => activateFallback('WebGL context lost'));

        // Preflight asset with timeout to prevent unhandled 403 / msgpack parser crashes
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            activateFallback('Asset request timed out (3500ms)');
        }, 3500);

        try {
            let response;
            try {
                response = await fetch(targetUrl, { method: 'HEAD', signal: controller.signal });
            } catch (headErr) {
                if (controller.signal.aborted) throw headErr;
                response = await fetch(targetUrl, {
                    method: 'GET',
                    signal: controller.signal
                });
            }

            clearTimeout(timeoutId);

            if (!response.ok) {
                activateFallback(`HTTP ${response.status} (${response.statusText || 'Forbidden / Access Denied'})`);
                return;
            }

            // Asset is valid and accessible: assign url and arm watchdog timer
            loadWatchdog = setTimeout(() => {
                if (!isResolved) {
                    activateFallback('3D viewer scene initialization timed out (8000ms)');
                }
            }, 8000);

            if (viewer.getAttribute('url') !== targetUrl) {
                viewer.setAttribute('url', targetUrl);
            }
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                activateFallback('Asset request timed out');
            } else {
                activateFallback(`Network request failed: ${fetchErr.message}`);
            }
        }
    };

    initSplineHero();

    // Premium Scroll-Driven Parallax for Spline Background (Preserves CSS center anchor and respects reduced motion)
    const splineBg = document.querySelector('.spline-bg');
    if (splineBg) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        window.addEventListener('scroll', () => {
            if (prefersReducedMotion.matches) return;
            const scrollY = window.scrollY;
            splineBg.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.35}px))`;
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

    // 1. Local Time & Status Indicator (Unified Yogyakarta Time Updater)
    const timeText = document.getElementById('time-text');
    const localTimeEl = document.getElementById('local-time');
    const timeStatusDot = document.getElementById('time-status-dot');

    if (timeText || localTimeEl) {
        const updateTime = () => {
            const date = new Date();
            const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const timeFormatted = formatter.format(date);

            if (timeText) {
                timeText.textContent = `${timeFormatted} WIB`;
            }
            if (localTimeEl) {
                localTimeEl.textContent = `📍 Yogyakarta, ID • ${timeFormatted} WIB`;
            }

            const hour = parseInt(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }), 10);
            if (timeStatusDot) {
                if (hour >= 23 || hour < 8) {
                    timeStatusDot.classList.add('sleeping');
                    if (timeText) timeText.title = 'Probably Sleeping 😴';
                } else {
                    timeStatusDot.classList.remove('sleeping');
                    if (timeText) timeText.title = 'Awake & Coding 💻';
                }
            }
        };
        updateTime();
        setInterval(updateTime, 10000);
    }

    // Mobile Navigation Drawer Toggle
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navLinks = document.querySelector('.nav-links');
    if (navToggleBtn && navLinks) {
        navToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('is-open');
            navToggleBtn.classList.toggle('is-active', isOpen);
            navToggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
                navToggleBtn.classList.remove('is-active');
                navToggleBtn.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-nav')) {
                navLinks.classList.remove('is-open');
                navToggleBtn.classList.remove('is-active');
                navToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
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
                    const lang = currentLang || localStorage.getItem('lang') || 'en';
                    btnCopyText.textContent = lang === 'id' ? 'Disalin!' : 'Copied!';
                    if (typeof showDynamicIsland === 'function') {
                        showDynamicIsland(lang === 'id' ? 'Teks Disalin' : 'Text Copied');
                    }
                    setTimeout(() => {
                        const cur = currentLang || localStorage.getItem('lang') || 'en';
                        btnCopyText.textContent = (i18nData[cur] && i18nData[cur].copyText) || 'Copy';
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
                    const curLang = currentLang || localStorage.getItem('lang') || 'en';
                    if (typeof showDynamicIsland === 'function') {
                        showDynamicIsland(curLang === 'id' ? 'Email Disalin ke Clipboard!' : 'Email Copied to Clipboard!');
                    }
                }
                cmdPalette.close();
                if (window.lenis) window.lenis.start();
            });
        });
    }



    // === Supabase Client Initialization ===
    let supabaseClient = null;
    if (window.supabase) {
        const supabaseUrl = 'https://mdjlisdsbamfdftuybky.supabase.co';
        const supabaseKey = 'sb_publishable_FK9Gdil-FbhiZbvePi0wPA_NYYovLn6';
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    // === Task 7: Guestbook (Online with Supabase) ===
    const btnSignGuestbook = document.getElementById('btn-sign-guestbook');
    const guestNameInput = document.getElementById('guest-name');
    const guestMsgInput = document.getElementById('guest-message');
    const guestbookEntries = document.getElementById('guestbook-entries');
    const guestbookStatus = document.getElementById('guestbook-status');

    // Helper: Escape HTML to prevent XSS
    const escapeHtml = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Helper: Network timeout wrapper (prevents prolonged UI hang on DNS/network failure)
    const withTimeout = (promise, ms = 4000) => {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('Koneksi timeout / Layanan tidak merespons')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
    };

    const setStatus = (msg, type = 'info') => {
        if (!guestbookStatus) return;
        guestbookStatus.className = `guestbook-status ${type}`;
        guestbookStatus.textContent = msg;
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (guestbookStatus.textContent === msg) {
                    guestbookStatus.textContent = '';
                    guestbookStatus.className = 'guestbook-status';
                }
            }, 6000);
        }
    };

    if (btnSignGuestbook && guestbookEntries && supabaseClient) {
        let isLoading = false;
        let isSubmitting = false;

        const getDict = () => (i18nData && i18nData[currentLang]) ? i18nData[currentLang] : (i18nData ? i18nData.en : {});

        const loadGuestbook = async () => {
            if (isLoading) return;
            isLoading = true;
            const t = getDict();
            try {
                guestbookEntries.innerHTML = `<div style="color: var(--text-secondary); padding: 1rem;">${t.guestLoading || 'Loading messages...'}</div>`;
                
                const queryPromise = supabaseClient
                    .from('guestbook')
                    .select('*')
                    .order('created_at', { ascending: false });

                const { data: entries, error } = await withTimeout(queryPromise, 4500);
                
                if (error) throw error;

                guestbookEntries.innerHTML = '';
                
                if (!entries || entries.length === 0) {
                    guestbookEntries.innerHTML = `<div style="color: var(--text-secondary); padding: 1rem;">${t.guestEmpty || 'No entries yet. Be the first to leave a message!'}</div>`;
                    return;
                }

                entries.forEach(entry => {
                    const div = document.createElement('div');
                    div.style.padding = '1rem';
                    div.style.background = 'rgba(255,255,255,0.05)';
                    div.style.borderRadius = '8px';
                    const curLang = currentLang || localStorage.getItem('lang') || 'en';
                    const dateStr = entry.created_at ? new Date(entry.created_at).toLocaleDateString(curLang === 'id' ? 'id-ID' : 'en-US') : '';
                    
                    const safeName = escapeHtml(entry.name || 'Anonymous');
                    const safeMsg = escapeHtml(entry.message || '');
                    
                    div.innerHTML = `<strong style="color: var(--text-primary);">${safeName}</strong> <span style="font-size: 0.8rem; color: var(--text-secondary);">${dateStr}</span><p style="margin-top: 4px; font-size: 0.9rem; word-break: break-word;">${safeMsg}</p>`;
                    guestbookEntries.appendChild(div);
                });
            } catch (err) {
                console.warn("[Guestbook] Gagal memuat pesan dari Supabase:", err.message || err);
                const curT = getDict();
                guestbookEntries.innerHTML = `
                    <div style="color: var(--text-secondary); padding: 1.25rem; text-align: center; background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem; font-size: 0.9rem;" data-i18n="guestOffline">${curT.guestOffline || 'Guestbook service is currently offline or unreachable.'}</p>
                        <button type="button" id="btn-retry-guestbook" class="guestbook-retry-btn" data-i18n="guestRetry">${curT.guestRetry || 'Try Again'}</button>
                    </div>
                `;
                const btnRetry = document.getElementById('btn-retry-guestbook');
                if (btnRetry) {
                    btnRetry.addEventListener('click', () => loadGuestbook());
                }
            } finally {
                isLoading = false;
            }
        };

        loadGuestbook();
        
        btnSignGuestbook.addEventListener('click', async () => {
            if (isSubmitting) return;

            const name = guestNameInput ? guestNameInput.value.trim() : '';
            const msg = guestMsgInput ? guestMsgInput.value.trim() : '';
            const t = getDict();

            if (!name || !msg) {
                setStatus(t.guestValidation || 'Please fill in your name and message before submitting.', 'error');
                if (!name && guestNameInput) guestNameInput.focus();
                else if (guestMsgInput) guestMsgInput.focus();
                return;
            }

            isSubmitting = true;
            btnSignGuestbook.disabled = true;
            btnSignGuestbook.textContent = t.guestSubmitting || 'Signing...';
            setStatus(t.guestSending || 'Sending message...', 'info');

            try {
                const insertPromise = supabaseClient
                    .from('guestbook')
                    .insert([{ name: name, message: msg }]);

                const { error } = await withTimeout(insertPromise, 4500);

                if (error) throw error;

                if (guestNameInput) guestNameInput.value = '';
                if (guestMsgInput) guestMsgInput.value = '';
                setStatus(t.guestSuccess || 'Message sent successfully!', 'success');
                if (typeof showDynamicIsland === 'function') {
                    showDynamicIsland(currentLang === 'id' ? 'Pesan Tersimpan' : 'Message Saved');
                }
                loadGuestbook();
            } catch (err) {
                console.warn("[Guestbook] Gagal mengirim pesan ke Supabase:", err.message || err);
                // Keep inputs intact so user does not lose typed content
                setStatus(t.guestFailed || 'Failed to send: Guestbook service is currently unreachable.', 'error');
                if (typeof showDynamicIsland === 'function') {
                    showDynamicIsland(currentLang === 'id' ? 'Gagal mengirim pesan' : 'Failed to send message');
                }
            } finally {
                isSubmitting = false;
                btnSignGuestbook.disabled = false;
                const finalT = getDict();
                btnSignGuestbook.textContent = finalT.guestSignBtn || 'Sign';
            }
        });

        window.addEventListener('languagechange', (e) => {
            const dict = e.detail && e.detail.dict;
            if (!dict) return;
            const retryBtn = document.getElementById('btn-retry-guestbook');
            if (retryBtn && dict.guestRetry) {
                retryBtn.textContent = dict.guestRetry;
            }
            if (!isSubmitting && dict.guestSignBtn) {
                btnSignGuestbook.textContent = dict.guestSignBtn;
            }
        });

        window.__guestbook = {
            loadGuestbook,
            getStatus: () => guestbookStatus ? guestbookStatus.textContent : '',
            isSubmitting: () => isSubmitting,
            isLoading: () => isLoading,
            getClient: () => supabaseClient,
            setClient: (mockClient) => { supabaseClient = mockClient; }
        };
    } else if (btnSignGuestbook && guestbookEntries) {
        guestbookEntries.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem;">Guestbook offline (Supabase not loaded)</div>';
    }

    // === Task 8: Dynamic Now Page ===
    const nowWeather = document.getElementById('now-weather');
    
    if (nowWeather) {
        // Fetch Weather (Yogyakarta coordinates)
        fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.7956&longitude=110.3695&current_weather=true')
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
        const labelsEn = ['HTML/CSS', 'UI Design', 'JavaScript', 'Accessibility', 'Interaction'];
        const labelsId = ['HTML/CSS', 'Desain UI', 'JavaScript', 'Aksesibilitas', 'Interaksi'];
        const values = [0.92, 0.88, 0.85, 0.80, 0.86]; // percentages
        
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
            const curLang = currentLang || localStorage.getItem('lang') || 'en';
            const labels = curLang === 'id' ? labelsId : labelsEn;
            
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
            ctx.font = '13px Inter, sans-serif';
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
        window.__drawSkillRadar = drawRadar;

        window.addEventListener('languagechange', () => drawRadar());

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(drawRadar, 100);
            });
        }
    }

    // Custom Local Analytics
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (target) {
            const action = target.innerText.trim() || target.id || target.href || 'unknown_click';
            let analytics = JSON.parse(localStorage.getItem('agy_analytics') || '{"clicks":[]}');
            if(!analytics.clicks) analytics.clicks = [];
            analytics.clicks.push({ action: action, time: Date.now() });
            localStorage.setItem('agy_analytics', JSON.stringify(analytics));
        }
    });

    // Task 9: Web Share API Integration
    const shareBtn = document.getElementById('project-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const title = document.getElementById('project-modal-title').textContent || "Project";
            const desc = document.getElementById('project-modal-desc').textContent || "Check this out!";
            const url = window.location.href; 
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `Portfolio: ${title}`,
                        text: desc,
                        url: url
                    });
                } catch (err) {
                    console.log('Share canceled or failed', err);
                }
            } else {
                navigator.clipboard.writeText(`${title} - ${url}`);
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = "Copied!";
                setTimeout(() => shareBtn.innerHTML = originalText, 2000);
            }
        });
    }
    
    // Task 1: Advanced Project Search Engine (Fuzzy Search)
    const searchInput = document.getElementById('project-search-input');
    const searchCards = document.querySelectorAll('.project-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchCards.forEach(card => {
                const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Task 4: Custom Client-Side Router (SPA Engine)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            if (!targetId) return;
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                history.pushState(null, '', `#${targetId}`);
                if (window.lenis) {
                    window.lenis.scrollTo(targetElement);
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Track page view for Analytics
                let analytics = JSON.parse(localStorage.getItem('agy_analytics') || '{"views":[]}');
                if(!analytics.views) analytics.views = [];
                analytics.views.push({ route: targetId, time: Date.now() });
                localStorage.setItem('agy_analytics', JSON.stringify(analytics));
            } else {
                // Feature 20: Custom 404 Fallback
                const errorDialog = document.getElementById('error-404-dialog');
                if (errorDialog) {
                    errorDialog.showModal();
                    
                    const homeBtn = document.getElementById('error-404-home');
                    if (homeBtn) {
                        homeBtn.onclick = () => {
                            errorDialog.close();
                            if (window.lenis) {
                                window.lenis.scrollTo(0);
                            } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            history.pushState(null, '', ' ');
                        };
                    }
                }
            }
        }
    });

    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                if (window.lenis) {
                    window.lenis.scrollTo(targetElement);
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            if (window.lenis) {
                window.lenis.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Feature 13: Auto 'Last Updated' Status from GitHub API
    const lastUpdatedText = document.getElementById('last-updated-text');
    if (lastUpdatedText) {
        fetch('https://api.github.com/repos/thannnajah-ai/portofolio/commits?per_page=1')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch commits');
                return res.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const date = new Date(data[0].commit.author.date);
                    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    lastUpdatedText.textContent = `Last updated on ${formattedDate}`;
                } else {
                    lastUpdatedText.textContent = 'Last updated recently';
                }
            })
            .catch(() => {
                lastUpdatedText.textContent = 'Actively maintained';
            });
    }

    // Feature 14: Conversational Contact Form Logic
    const contactNextBtn = document.querySelector('.contact-next-btn');
    const contactPrevBtn = document.querySelector('.contact-prev-btn');
    const contactSubmitBtn = document.getElementById('contact-submit');
    const contactResetBtn = document.getElementById('contact-reset');
    
    if (contactNextBtn && contactPrevBtn && contactSubmitBtn) {
        contactNextBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('contact-name');
            if (nameInput.value.trim() === '') {
                nameInput.style.borderColor = 'red';
                setTimeout(() => nameInput.style.borderColor = 'var(--border-color)', 1000);
                return;
            }
            document.getElementById('contact-step-1').classList.remove('active');
            setTimeout(() => {
                document.getElementById('contact-step-1').style.display = 'none';
                document.getElementById('contact-step-2').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('contact-step-2').classList.add('active');
                    document.getElementById('contact-message').focus();
                }, 50);
            }, 400);
        });

        contactPrevBtn.addEventListener('click', () => {
            document.getElementById('contact-step-2').classList.remove('active');
            setTimeout(() => {
                document.getElementById('contact-step-2').style.display = 'none';
                document.getElementById('contact-step-1').style.display = 'block';
                setTimeout(() => document.getElementById('contact-step-1').classList.add('active'), 50);
            }, 400);
        });

        contactSubmitBtn.addEventListener('click', async () => {
            const msgInput = document.getElementById('contact-message');
            if (msgInput.value.trim() === '') {
                msgInput.style.borderColor = 'red';
                setTimeout(() => msgInput.style.borderColor = 'var(--border-color)', 1000);
                return;
            }
            
            const name = document.getElementById('contact-name').value.trim();
            const message = msgInput.value.trim();
            
            // Show loading state
            const curLang = currentLang || localStorage.getItem('lang') || 'en';
            const t = (i18nData && i18nData[curLang]) ? i18nData[curLang] : (i18nData ? i18nData.en : {});
            const originalText = contactSubmitBtn.textContent;
            contactSubmitBtn.textContent = t.contactSendingBtn || 'Sending...';
            contactSubmitBtn.style.opacity = '0.7';
            contactSubmitBtn.style.pointerEvents = 'none';

            try {
                const response = await fetch('https://formspree.io/f/xqpabzjl', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, message })
                });

                if (response.ok) {
                    document.getElementById('contact-success-title').textContent = t.contactSuccessTitle || 'Message Sent!';
                    document.getElementById('contact-success-desc').textContent = t.contactSuccessDesc || "Thank you for reaching out. I'll get back to you as soon as possible.";
                    document.getElementById('contact-success-icon').innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
                    document.getElementById('contact-success-icon').setAttribute('stroke', 'var(--primary-color)');
                } else {
                    throw new Error('Formspree returned an error');
                }
            } catch (error) {
                document.getElementById('contact-success-title').textContent = t.contactErrorTitle || 'Oops!';
                document.getElementById('contact-success-desc').textContent = t.contactErrorDesc || 'Something went wrong while sending your message. Please try again later.';
                document.getElementById('contact-success-icon').innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
                document.getElementById('contact-success-icon').setAttribute('stroke', '#ff4757');
            }

            contactSubmitBtn.textContent = originalText;
            contactSubmitBtn.style.opacity = '1';
            contactSubmitBtn.style.pointerEvents = 'auto';
            
            document.getElementById('contact-step-2').classList.remove('active');
            setTimeout(() => {
                document.getElementById('contact-step-2').style.display = 'none';
                document.getElementById('contact-step-3').style.display = 'block';
                setTimeout(() => document.getElementById('contact-step-3').classList.add('active'), 50);
            }, 400);
        });

        contactResetBtn.addEventListener('click', () => {
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-message').value = '';
            document.getElementById('contact-step-3').classList.remove('active');
            setTimeout(() => {
                document.getElementById('contact-step-3').style.display = 'none';
                document.getElementById('contact-step-1').style.display = 'block';
                setTimeout(() => document.getElementById('contact-step-1').classList.add('active'), 50);
            }, 400);
        });
    }



    // Task 7: Web Worker Threading
    if (window.Worker) {
        const worker = new Worker('worker.js');
        worker.postMessage('start_heavy_task');
        worker.onmessage = function(e) {
            console.log('[Web Worker] Heavy task completed in background:', e.data.result);
        };
    }

});
