/**
 * YojanaMitra Shared Mobile Menu Controller
 * Dynamically builds and controls a sliding drawer menu for mobile screens
 */

(function() {
    function initMobileMenu() {
        const header = document.getElementById('global-header');
        if (!header) return;

        // 1. Create Hamburger Button
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-btn';
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.innerHTML = `
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        `;
        header.appendChild(hamburger);

        // 2. Create Drawer Overlay and Container
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        
        const drawer = document.createElement('div');
        drawer.className = 'mobile-nav-drawer';
        drawer.innerHTML = `
            <div class="drawer-header">
                <div class="drawer-logo">
                    <div class="logo-mark">YM</div>
                    <span>YojanaMitra</span>
                </div>
                <button class="drawer-close" aria-label="Close menu">&times;</button>
            </div>
            <div class="drawer-body"></div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        const drawerBody = drawer.querySelector('.drawer-body');
        
        // 3. Dynamic Link Discovery & Insertion
        // Clone desktop nav links
        const desktopNav = header.querySelector('nav');
        if (desktopNav) {
            const navGroup = document.createElement('div');
            navGroup.className = 'drawer-nav-group';
            desktopNav.querySelectorAll('a').forEach(link => {
                const clone = link.cloneNode(true);
                clone.className = 'drawer-link' + (link.classList.contains('active') ? ' active' : '');
                navGroup.appendChild(clone);
            });
            drawerBody.appendChild(navGroup);
        }

        // Clone desktop header actions (Admin, Login, Dashboard)
        const desktopActions = header.querySelector('.header-actions');
        if (desktopActions) {
            const actionGroup = document.createElement('div');
            actionGroup.className = 'drawer-action-group';
            desktopActions.querySelectorAll('a, button').forEach(item => {
                if (item.tagName === 'A' || item.tagName === 'BUTTON') {
                    const clone = item.cloneNode(true);
                    // Standardize classes for drawer layout
                    if (clone.classList.contains('btn-dashboard')) {
                        clone.className = 'drawer-btn btn-primary';
                    } else if (clone.classList.contains('btn-login')) {
                        clone.className = 'drawer-btn btn-secondary';
                    } else if (clone.classList.contains('admin-link')) {
                        clone.className = 'drawer-btn btn-outline';
                    } else {
                        clone.className = 'drawer-link';
                    }
                    actionGroup.appendChild(clone);
                }
            });
            drawerBody.appendChild(actionGroup);
        }

        // 4. Event Binding for Slide Transitions
        function toggleMenu(forceClose = false) {
            const isOpen = drawer.classList.contains('open');
            if (isOpen || forceClose) {
                drawer.classList.remove('open');
                overlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                hamburger.classList.remove('active');
            } else {
                drawer.classList.add('open');
                overlay.classList.add('active');
                document.body.classList.add('menu-open');
                hamburger.classList.add('active');
            }
        }

        hamburger.addEventListener('click', () => toggleMenu());
        drawer.querySelector('.drawer-close').addEventListener('click', () => toggleMenu(true));
        overlay.addEventListener('click', () => toggleMenu(true));

        // Close drawer if a navigation link inside is clicked
        drawerBody.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();
