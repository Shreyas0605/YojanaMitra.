import glob

refined_mobile_css = '''
    @media (max-width: 768px) {
      /* Kill all media and images as requested */
      img, video, canvas, iframe, picture, figure, .hero-image, .story-image, .scrolly-container, .wb-wedge, .glow-orb, .aurora-container { 
        display: none !important; 
        background-image: none !important;
      }
      
      /* Flatten backgrounds to solid colors */
      .hero, .global-patriotic-bg, section, body, html { 
        background-image: none !important; 
        background-color: #0b1a16 !important;
      }
      
      body, html {
        color: #f8fafc !important;
        overflow-x: hidden !important;
        width: 100% !important;
        max-width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
        padding-bottom: 80px !important; /* Space for Bottom Nav */
        font-size: 14px !important; 
      }

      /* Core Spacing Reductions */
      section, .hero, .container, .page-body, .main {
        padding: 24px 16px !important;
        margin: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Typography Restyling for Mobile */
      h1, .hero h1 { font-size: 28px !important; line-height: 1.2 !important; margin-bottom: 12px !important; letter-spacing: -0.5px !important; }
      h2, .section-title h2 { font-size: 22px !important; line-height: 1.3 !important; margin-bottom: 12px !important; }
      h3 { font-size: 18px !important; margin-bottom: 8px !important; }
      h4, h5, h6 { font-size: 16px !important; }
      p, .hero-sub, .text-muted { font-size: 14px !important; line-height: 1.5 !important; margin-bottom: 16px !important; color: #94a3b8 !important;}

      /* Force 1-column layouts */
      .grid-2, .grid-3, .row, .doc-grid, .stat-row, .dashboard-grid, .dash-grid, .scheme-grid, #scheme-grid, .feature-grid, .how-it-works-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important; 
        width: 100% !important;
      }

      /* Card Redesign - Sleek & Compact matching mockups */
      .scheme-card, .dash-card, .feature-card, .doc-card, .stat-card, .glass-filter-bar, .panel-card, .upload-zone {
        padding: 16px !important;
        border-radius: 12px !important;
        margin-bottom: 0 !important;
        box-shadow: none !important;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .scheme-card h5, .doc-card .doc-name { font-size: 16px !important; margin-bottom: 6px !important; font-weight: 700 !important; }
      .scheme-card p, .doc-card .doc-sub { font-size: 13px !important; color: #94a3b8 !important;}
      
      /* Scheme Match Badge styling matching mockup */
      .match-score, .score, .match-badge { color: #22c55e !important; font-size: 13px !important; font-weight: 600 !important; margin-bottom: 12px !important; display: block !important; }
      
      /* Buttons & Interactive Elements Redesign */
      button, .btn, .btn-primary, .btn-secondary, .nav-cta, .apply-btn {
        width: 100% !important;
        justify-content: center !important;
        text-align: center !important;
        padding: 12px 16px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        border-radius: 8px !important; 
        min-height: 44px !important; 
        margin-bottom: 8px !important;
        display: flex !important;
        align-items: center !important;
      }
      
      /* Secondary transparent buttons with orange border (View Details & Apply) */
      .scheme-card .btn, .scheme-card button, .scheme-actions a {
         background: transparent !important;
         border: 1px solid #f97316 !important;
         color: #f97316 !important;
      }

      /* Primary buttons */
      .hero .btn, .upload-zone .btn {
          background: #f97316 !important;
          color: white !important;
          border: none !important;
      }
      
      /* Inputs and Search */
      input, select, .glass-search-input {
        width: 100% !important;
        padding: 12px 16px !important;
        font-size: 15px !important;
        border-radius: 8px !important;
        min-height: 44px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }

      /* Header Restyling */
      #global-header {
        padding: 12px 16px !important;
        height: 60px !important;
        background: #0b1a16 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        display: flex !important;
        align-items: center !important;
      }
      #global-header nav, #global-header .header-actions, .hamburger-btn, .mobile-nav-overlay, .mobile-nav-drawer { display: none !important; }
      
      /* --- Native App Bottom Navigation --- */
      .mobile-bottom-nav {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 64px !important;
          background: #0b1a16 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          display: flex !important;
          justify-content: space-around !important;
          align-items: center !important;
          z-index: 99999 !important;
          padding-bottom: env(safe-area-inset-bottom) !important; /* iPhone Notch */
      }
      .mobile-bottom-nav .nav-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          color: #64748b !important;
          text-decoration: none !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          gap: 4px !important;
          width: 25% !important;
      }
      .mobile-bottom-nav .nav-item.active { color: #f97316 !important; }
      
      /* --- Native App Floating Action Button (FAB) --- */
      .mobile-fab {
          position: fixed !important;
          bottom: 80px !important; /* Above bottom nav */
          right: 20px !important;
          width: 56px !important;
          height: 56px !important;
          border-radius: 50% !important;
          background: #f97316 !important;
          color: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4) !important;
          z-index: 99999 !important;
      }

      /* Specific fixes */
      .welcome-banner { flex-direction: column !important; padding: 20px 16px !important; border-radius: 12px !important; }
      .dash-scheme-item { flex-direction: column !important; align-items: flex-start !important; padding: 12px 0 !important; }
      
      /* Modals */
      .modal, .modal-dialog, .modal-content {
        width: 95vw !important;
        margin: 10px auto !important;
        padding: 16px !important;
        border-radius: 12px !important;
        background: #11221c !important;
      }
    }
'''

for file_path in ['static/index.html', 'static/all_schemes.html', 'static/dashboard.html', 'static/vault.html']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '/* Kill all media and images as requested */' in content:
        start_idx = content.rfind('@media (max-width: 768px)', 0, content.find('/* Kill all media and images as requested */'))
        end_idx = content.find('</style>', start_idx)
        
        if start_idx != -1 and end_idx != -1:
            content = content[:start_idx] + refined_mobile_css + '\n' + content[end_idx:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Replaced mobile CSS in {file_path}')
