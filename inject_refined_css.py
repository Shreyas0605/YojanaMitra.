import glob
import re

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
        font-size: 14px !important; /* Base size reduction */
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
      p, .hero-sub, .text-muted { font-size: 14px !important; line-height: 1.5 !important; margin-bottom: 16px !important; }

      /* Force 1-column layouts */
      .grid-2, .grid-3, .row, .doc-grid, .stat-row, .dashboard-grid, .dash-grid, .scheme-grid, #scheme-grid, .feature-grid, .how-it-works-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important; /* Smaller gaps */
        width: 100% !important;
      }

      /* Card Redesign - Sleek & Compact */
      .scheme-card, .dash-card, .feature-card, .doc-card, .stat-card, .glass-filter-bar, .panel-card, .upload-zone {
        padding: 16px !important;
        border-radius: 12px !important; /* Less bulky */
        margin-bottom: 0 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        background: rgba(255,255,255,0.03) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Card specific text tweaks */
      .scheme-card h5, .doc-card .doc-name { font-size: 16px !important; margin-bottom: 6px !important; }
      .scheme-card p, .doc-card .doc-sub { font-size: 13px !important; }
      
      /* Buttons & Interactive Elements Redesign */
      button, .btn, .btn-primary, .btn-secondary, .drawer-btn, .nav-cta {
        width: 100% !important;
        justify-content: center !important;
        text-align: center !important;
        padding: 12px 16px !important;
        font-size: 15px !important;
        border-radius: 8px !important; /* Sleek buttons */
        min-height: 44px !important; /* Apple tap target size */
        margin-bottom: 8px !important;
        display: flex !important;
        align-items: center !important;
      }
      
      /* Inputs and Search */
      input, select, .glass-search-input {
        width: 100% !important;
        padding: 12px 16px !important;
        font-size: 15px !important;
        border-radius: 8px !important;
        min-height: 44px !important;
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        color: white !important;
      }

      /* Header and Menu Button Restyling */
      #global-header {
        padding: 12px 16px !important;
        height: 60px !important;
        background: #0b1a16 !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
      }
      #global-header nav, #global-header .header-actions { display: none !important; }
      .hamburger-btn { 
        display: flex !important; 
        flex-direction: column !important;
        justify-content: space-around !important;
        width: 28px !important;
        height: 24px !important;
        background: transparent !important;
        border: none !important;
        z-index: 100000 !important;
      }
      .hamburger-btn .bar {
        width: 100% !important;
        height: 2px !important;
        background-color: #ffffff !important;
        border-radius: 2px !important;
      }
      
      /* Specific Dashboard fixes */
      .welcome-banner { flex-direction: column !important; padding: 20px 16px !important; border-radius: 12px !important; }
      .dash-scheme-item { flex-direction: column !important; align-items: flex-start !important; padding: 12px 0 !important; }
      .dash-scheme-actions button { width: 100% !important; margin-top: 8px !important; }
      
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
    
    if '/* Kill all media and images */' in content:
        start_idx = content.rfind('@media (max-width: 768px)', 0, content.find('/* Kill all media and images */'))
        end_idx = content.find('</style>', start_idx)
        
        if start_idx != -1 and end_idx != -1:
            content = content[:start_idx] + refined_mobile_css + '\n' + content[end_idx:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Replaced mobile CSS in {file_path}')
