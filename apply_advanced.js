const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('style.css', 'utf8');
let js = fs.readFileSync('script.js', 'utf8');

// --- 1. HTML INJECTIONS ---

const localTimeHTML = `<div class="local-time-widget" id="local-time-widget"><span id="time-text">--:--</span><span class="status-dot-time" id="time-status-dot"></span></div>`;
html = html.replace('<button id="lang-toggle"', localTimeHTML + '\n          <button id="lang-toggle"');

const bodyInjections = `
    <!-- Scroll-Spy Nav -->
    <nav class="scroll-spy-nav">
        <ul>
            <li><a href="#hero" class="spy-link active" data-target="hero"></a></li>
            <li><a href="#about" class="spy-link" data-target="about"></a></li>
            <li><a href="#projects" class="spy-link" data-target="projects"></a></li>
            <li><a href="#contact" class="spy-link" data-target="contact"></a></li>
        </ul>
    </nav>

    <!-- Selection Tooltip -->
    <div id="selection-tooltip" class="selection-tooltip">
        <button id="btn-copy-text" data-i18n="copyText">Copy</button>
    </div>

    <!-- Timeline Resume Dialog -->
    <dialog id="resume-dialog" class="resume-dialog">
        <div class="resume-window">
            <div class="resume-header">
                <h2>Interactive Resume</h2>
                <button class="resume-close-btn" id="resume-close" aria-label="Close Resume">&times;</button>
            </div>
            <div class="resume-body">
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h3>Frontend Developer</h3>
                            <span>2024 - Present</span>
                            <p>Building high-performance, aesthetically pleasing web applications using modern stacks.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h3>UI/UX Enthusiast</h3>
                            <span>2023 - 2024</span>
                            <p>Studying human-computer interaction, wireframing, and creating design systems.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h3>Self-Taught Programmer</h3>
                            <span>2021 - 2023</span>
                            <p>Learned algorithms, data structures, and the fundamentals of software engineering.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </dialog>
`;
html = html.replace('<body>', '<body>\n' + bodyInjections);

const cvBtnHTML = `<button id="btn-view-cv" class="btn btn-secondary magnetic" style="margin-top: 1rem;">View Interactive CV</button>`;
html = html.replace('<div class="about-text">', '<div class="about-text">\n' + cvBtnHTML);

const webglImports = `
    <!-- WebGL Liquid Hover Dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js"></script>
    <script src="https://unpkg.com/hover-effect"></script>
`;
html = html.replace('</body>', webglImports + '\n</body>');


// --- 2. CSS INJECTIONS ---

const advancedCSS = `
/* Local Time Widget */
.local-time-widget {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    background: rgba(255,255,255,0.05);
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    margin-right: 1rem;
    border: 1px solid rgba(255,255,255,0.1);
}
.light-theme .local-time-widget {
    background: rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.1);
}
.status-dot-time {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34d399; /* default awake */
    box-shadow: 0 0 8px #34d399;
}
.status-dot-time.sleeping {
    background: #60a5fa;
    box-shadow: 0 0 8px #60a5fa;
}

/* Scroll-Spy Side Nav */
.scroll-spy-nav {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 999;
    display: none;
}
@media (min-width: 1024px) {
    .scroll-spy-nav { display: block; }
}
.scroll-spy-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.spy-link {
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: all 0.3s ease;
    border: 2px solid transparent;
}
.light-theme .spy-link { background: rgba(0,0,0,0.2); }
.spy-link:hover, .spy-link.active {
    background: var(--text-primary);
    transform: scale(1.5);
}

/* Custom Text-Select Tooltip */
::selection {
    background: rgba(96, 165, 250, 0.3);
    color: inherit;
}
.selection-tooltip {
    position: fixed;
    background: var(--text-primary);
    color: var(--bg-color);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, 10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 99999;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.selection-tooltip.show {
    opacity: 1;
    transform: translate(-50%, -10px);
    pointer-events: auto;
}
.selection-tooltip button {
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-weight: inherit;
    font-size: inherit;
}

/* Interactive Timeline Resume Modal */
.resume-dialog {
    border: none;
    background: transparent;
    padding: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    position: fixed;
    top: 0; left: 0;
    z-index: 100000;
}
.resume-dialog::backdrop {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
}
.resume-window {
    width: 90%;
    max-width: 800px;
    margin: 5vh auto;
    background: var(--card-bg);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
    transform: translateY(50px);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.resume-dialog[open] .resume-window {
    transform: translateY(0);
    opacity: 1;
}
.resume-header {
    padding: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.resume-close-btn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 2rem;
    cursor: pointer;
}
.resume-body {
    padding: 2rem;
    overflow-y: auto;
}
.timeline {
    position: relative;
    padding-left: 2rem;
}
.timeline::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 2px;
    background: rgba(255,255,255,0.1);
}
.light-theme .timeline::before { background: rgba(0,0,0,0.1); }
.timeline-item {
    position: relative;
    margin-bottom: 3rem;
}
.timeline-dot {
    position: absolute;
    left: -2.35rem;
    top: 0.2rem;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #60a5fa;
    border: 4px solid var(--card-bg);
}
.timeline-content h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; }
.timeline-content span { font-size: 0.85rem; color: #60a5fa; font-weight: 600; display: block; margin-bottom: 1rem; }
.timeline-content p { color: var(--text-secondary); margin: 0; line-height: 1.6; }

/* WebGL Liquid Container overrides */
.project-image {
    position: relative;
    overflow: hidden;
    height: 250px; 
}
.project-image canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
}
.project-image img.preview-img {
    display: none; 
}
`;

css += advancedCSS;


// --- 3. JS INJECTIONS ---

const advancedJS = `

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
            timeStatusDot.classList.add('sleeping');
            timeText.title = 'Probably Sleeping 😴';
        } else {
            timeStatusDot.classList.remove('sleeping');
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
    btnCopyText.addEventListener('click', () => {
        const text = window.getSelection().toString();
        navigator.clipboard.writeText(text).then(() => {
            btnCopyText.textContent = 'Copied!';
            setTimeout(() => {
                btnCopyText.textContent = 'Copy';
                window.getSelection().removeAllRanges();
            }, 1500);
        });
    });
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
                const activeLink = document.querySelector(\`.spy-link[data-target="\${id}"]\`);
                if(activeLink) activeLink.classList.add('active');
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
    resumeClose.addEventListener('click', () => {
        resumeDialog.close();
    });
    resumeDialog.addEventListener('click', (e) => {
        if (e.target === resumeDialog) resumeDialog.close();
    });
}

// 5. WebGL Liquid Hover Distortion
setTimeout(() => {
    if (typeof hoverEffect !== 'undefined') {
        const projectImages = document.querySelectorAll('.project-image');
        projectImages.forEach((container) => {
            const imgEl = container.querySelector('img.preview-img');
            if (imgEl) {
                let imgSrc = imgEl.src;
                const displacementUrl = 'https://raw.githubusercontent.com/robin-dela/hover-effect/master/images/fluid.jpg';
                
                new hoverEffect({
                    parent: container,
                    intensity: 0.3,
                    image1: imgSrc,
                    image2: imgSrc,
                    displacementImage: displacementUrl,
                    hover: true
                });
            }
        });
    }
}, 1000);
`;

js = js.replace('});', advancedJS + '\n});');

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('style.css', css, 'utf8');
fs.writeFileSync('script.js', js, 'utf8');

console.log("All advanced features applied successfully");
