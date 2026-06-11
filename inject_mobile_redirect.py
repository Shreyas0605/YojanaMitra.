"""
Inject mobile redirect scripts into desktop HTML pages.
When a mobile user visits index.html, all_schemes.html, dashboard.html, or vault.html,
they get redirected to the corresponding mobile_*.html page.
"""

redirects = {
    'static/index.html': 'mobile_home.html',
    'static/all_schemes.html': 'mobile_schemes.html',
    'static/dashboard.html': 'mobile_dashboard.html',
    'static/vault.html': 'mobile_vault.html',
}

redirect_template = """
<script>
(function() {
    if (window.innerWidth <= 768) {
        window.location.replace('%s');
    }
})();
</script>
"""

for filepath, mobile_page in redirects.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Don't inject twice
    if mobile_page in content:
        print(f'Skipping {filepath} - redirect already present')
        continue
    
    script = redirect_template % mobile_page
    content = content.replace('<head>', '<head>' + script, 1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Injected redirect to {mobile_page} in {filepath}')
