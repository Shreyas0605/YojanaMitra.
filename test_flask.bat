@echo off
set GEMINI_API_KEY=test
set FLASK_ENV=development
start /B python app.py > flask_log.txt 2>&1
timeout /T 8 /NOBREAK > nul
python -c "import urllib.request, json; d=json.dumps({'questions':[{'field':'annual_income','question':'What is your income?','uid':'Q0'},{'field':'caste','question':'Which category?','uid':'Q1'},{'field':'is_farmer','question':'Are you a farmer?','uid':'Q2'},{'field':'disability','question':'Do you have a disability?','uid':'Q3'}],'current_profile':{'age':25,'gender':'Male'}}).encode(); r=urllib.request.Request('http://127.0.0.1:5000/api/ai/distill-questions', data=d, headers={'Content-Type':'application/json'}, method='POST'); resp=urllib.request.urlopen(r, timeout=30); result=resp.read().decode(); open('flask_test_result.txt','w').write(result)" 2>> flask_test_err.txt
taskkill /F /IM python.exe > nul 2>&1
