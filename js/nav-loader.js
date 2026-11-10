(() => {
    // English only: the page language is always "en".
    document.documentElement.lang = 'en';

    // The site keeps four things in the browser, nothing else:
    //   bonzi_theme    light or dark (set here)
    //   flock-motion   animations paused or running (flock-motion.js)
    //   flock-sound    sound on or off (flock-sound.js)
    //   flock-bonked   the duck game score, one number shared by every page (flock-game.js)
    // Anything older (a language choice, the old theme key, a private-access flag, a cockpit key) is cleared on load.
    const THEME_KEY = 'bonzi_theme';
    ['bonzi_lang', 'bonzi-lang', 'bonzi_site_lang', 'bonzi-theme', 'bonzi_private_access', 'bonzi_cockpit_key'].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
        try { sessionStorage.removeItem(k); } catch (e) {}
    });

    // The menu, the active link, the theme switch and the phone menu. The animation and sound buttons
    // are built by flock-motion.js and flock-sound.js, which wait for the "nav:loaded" event sent below.
    const navReady = loadNav();
    window.navReady = navReady;

    async function loadNav() {
        const navContainer = document.getElementById('nav-container');
        const menuContainer = document.getElementById('mobile-menu-container');
        if (!navContainer || !menuContainer) return;

        try {
            const _v = '20261110hyg3';
            const [navRes, menuRes] = await Promise.all([
                fetch('/includes/nav.html?v=' + _v),
                fetch('/includes/mobile-menu.html?v=' + _v)
            ]);

            navContainer.innerHTML = await navRes.text();
            menuContainer.innerHTML = await menuRes.text();

            applyActiveState();
            initTheme();
            initMobileMenu();

            document.dispatchEvent(new CustomEvent('nav:loaded'));
        } catch (err) {
            console.error('[nav-loader] Failed to load navigation:', err);
        }
    }

    function applyActiveState() {
        const activeKey = getActiveKey(window.location.pathname);
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
