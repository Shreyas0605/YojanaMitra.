import glob
import re

files = glob.glob('static/*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace style.css with style.css?v=2
    if 'style.css"' in content:
        content = content.replace('style.css"', 'style.css?v=2"')
    elif 'style.css?' in content:
        content = re.sub(r'style\.css\?v=[0-9]+', 'style.css?v=3', content)

    # Cache bust mobile_menu.js
    if 'mobile_menu.js"' in content:
        content = content.replace('mobile_menu.js"', 'mobile_menu.js?v=2"')
    elif 'mobile_menu.js?' in content:
        content = re.sub(r'mobile_menu\.js\?v=[0-9]+', 'mobile_menu.js?v=3', content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print('Cache busting query parameters added to HTML files.')
