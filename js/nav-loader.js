(() => {
    // Two languages: English at the root paths, Brazilian Portuguese under /pt/ (the same paths after /pt).
    const PT_PREFIX = '/pt';
    const isPt = window.location.pathname === PT_PREFIX || window.location.pathname.indexOf(PT_PREFIX + '/') === 0;
    document.documentElement.lang = isPt ? 'pt-BR' : 'en';

    // The site keeps five things in the browser, nothing else:
    //   bonzi_theme    light or dark (set here)
    //   flock-motion   animations paused or running (flock-motion.js)
    //   flock-sound    sound on or off (flock-sound.js)
    //   flock-bonked   the duck game score, one number shared by every page (flock-game.js)
    //   flock-lang     the language the visitor chose: en or pt (set here)
    // Anything older (the old theme key, a private-access flag, a cockpit key) is cleared on load.
    const THEME_KEY = 'bonzi_theme';
    const LANG_KEY = 'flock-lang';
    ['bonzi_lang', 'bonzi-lang', 'bonzi_site_lang', 'bonzi-theme', 'bonzi_private_access', 'bonzi_cockpit_key'].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
        try { sessionStorage.removeItem(k); } catch (e) {}
    });

    // Language choice: a visitor who picked Portuguese keeps it; a Portuguese browser gets it once, on first visit.
    // Picking English from the header saves "en" and stays on English.
    function savedLang() {
        try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
    }
    function saveLang(lang) {
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }
    function otherLangUrl(lang) {
        const path = window.location.pathname;
        const base = (path === PT_PREFIX || path.indexOf(PT_PREFIX + '/') === 0) ? (path.slice(PT_PREFIX.length) || '/') : path;
        if (lang === 'pt') return PT_PREFIX + (base === '/' ? '/' : base) + window.location.search + window.location.hash;
        return base + window.location.search + window.location.hash;
    }
    if (!isPt) {
        const saved = savedLang();
        const browserPt = (navigator.language || '').toLowerCase().indexOf('pt') === 0;
        const fromPt = (document.referrer || '').indexOf(window.location.origin + PT_PREFIX + '/') === 0;
        if (!fromPt && (saved === 'pt' || (!saved && browserPt))) {
            saveLang('pt');
            window.location.replace(otherLangUrl('pt'));
        }
    }

    // The menu, the active link, the theme switch and the phone menu. The animation and sound buttons
    // are built by flock-motion.js and flock-sound.js, which wait for the "nav:loaded" event sent below.
    const navReady = loadNav();
    window.navReady = navReady;

    async function loadNav() {
        const navContainer = document.getElementById('nav-container');
        const menuContainer = document.getElementById('mobile-menu-container');
        if (!navContainer || !menuContainer) return;

        try {
            const _v = '20261110lang1';
            const dir = isPt ? '/includes/pt/' : '/includes/';
            const [navRes, menuRes] = await Promise.all([
                fetch(dir + 'nav.html?v=' + _v),
                fetch(dir + 'mobile-menu.html?v=' + _v)
            ]);

            navContainer.innerHTML = await navRes.text();
            menuContainer.innerHTML = await menuRes.text();

            wireLanguageFlags();
            applyActiveState();
            initTheme();
            initMobileMenu();

            document.dispatchEvent(new CustomEvent('nav:loaded'));
        } catch (err) {
            console.error('[nav-loader] Failed to load navigation:', err);
        }
    }

    // Each flag points to the same page in its language, and remembers the choice when clicked.
    function wireLanguageFlags() {
        document.querySelectorAll('a.nav-flag[data-lang]').forEach((a) => {
            const lang = a.getAttribute('data-lang');
            a.setAttribute('href', otherLangUrl(lang));
            const current = (lang === 'pt') === isPt;
            a.classList.toggle('is-current', current);
            if (current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
            a.addEventListener('click', () => saveLang(lang));
        });
    }

    function applyActiveState() {
        const path = window.location.pathname;
        const activeKey = getActiveKey(isPt ? (path.slice(PT_PREFIX.length) || '/') : path);
        if (!activeKey) return;
        document.querySelectorAll(`[data-nav="${activeKey}"]`).forEach((el) => {
            el.classList.add('active');
        });
    }

    // The old page_N and why/faq/manual addresses are redirect pages; they keep the link of the page they point to.
    function getActiveKey(pathname) {
        const path = pathname.split('?')[0].split('#')[0].replace(/\.html$/, '').replace(/\/+$/, '') || '/';
        const keys = [
            ['/now', 'now'], ['/page_4', 'now'],
            ['/how', 'how'], ['/page_1', 'how'], ['/faq', 'how'], ['/manual', 'how'],
            ['/about', 'about'], ['/why', 'about'], ['/page_2', 'about']
        ];
        const hit = keys.find(([base]) => path === base || path.startsWith(base + '/'));
        if (hit) return hit[1];
        return path === '/' || path === '/index' ? 'intro' : null;
    }

    function initTheme() {
        let saved = null;
        try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
        const defaultSetting = document.body.dataset.themeDefault || 'light';
        const defaultTheme = defaultSetting === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : defaultSetting;
        const theme = saved || defaultTheme;
        setTheme(theme);

        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark-mode');
            setTheme(isDark ? 'dark' : 'light');
        });
    }

    function setTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        try { localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light'); } catch (e) {}
    }

    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!hamburger || !mobileMenu) return;

        const setMenuState = (open) => {
            hamburger.classList.toggle('active', open);
            mobileMenu.classList.toggle('open', open);
            mobileMenu.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
            mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
            document.body.style.overflow = open ? 'hidden' : '';
        };

        const toggleMenu = () => {
            const isOpen = mobileMenu.classList.contains('open') || mobileMenu.classList.contains('active');
            setMenuState(!isOpen);
        };

        const closeMenu = () => setMenuState(false);

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }
})();
