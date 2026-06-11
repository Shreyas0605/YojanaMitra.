/**
 * YojanaMitra Mobile Native App-like Navigation
 * Replaces the header nav with a Bottom Tab Bar on mobile
 */

(function() {
    function initMobileNav() {
        if (window.innerWidth > 768) return; // Only run on mobile
        
        // Ensure we don't duplicate
        if (document.getElementById('mobile-bottom-nav')) return;

        // 1. Create Bottom Navigation Bar
        const bottomNav = document.createElement('nav');
        bottomNav.id = 'mobile-bottom-nav';
        bottomNav.className = 'mobile-bottom-nav';
        
        // Define Tabs based on our main pages
        const currentPath = window.location.pathname;
        const isSchemes = currentPath.includes('schemes');
        const isVault = currentPath.includes('vault');
        const isDashboard = currentPath.includes('dashboard');
        const isHome = !isSchemes && !isVault && !isDashboard;

        bottomNav.innerHTML = `
            <a href="index.html" class="nav-item ${isHome ? 'active' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Home</span>
            </a>
            <a href="all_schemes.html" class="nav-item ${isSchemes ? 'active' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Schemes</span>
            </a>
            <a href="vault.html" class="nav-item ${isVault ? 'active' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>Vault</span>
            </a>
            <a href="dashboard.html" class="nav-item ${isDashboard ? 'active' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
            </a>
        `;
        document.body.appendChild(bottomNav);

        // 2. Create Floating Action Button (Ask AI)
        const fab = document.createElement('button');
        fab.id = 'mobile-fab';
        fab.className = 'mobile-fab';
        fab.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        `;
        
        // Attempt to hook FAB into existing Ask AI functionality if available
        fab.addEventListener('click', () => {
            const contextualBtn = document.getElementById('ai-trigger-btn');
            if (contextualBtn) {
                contextualBtn.click();
            } else {
                alert("YojanaMitra AI is ready to help!");
            }
        });
        document.body.appendChild(fab);
        
        // Hide standard header nav elements on mobile
        const globalHeaderNav = document.querySelector('#global-header nav');
        const headerActions = document.querySelector('#global-header .header-actions');
        if (globalHeaderNav) globalHeaderNav.style.display = 'none';
        if (headerActions) headerActions.style.display = 'none';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();
