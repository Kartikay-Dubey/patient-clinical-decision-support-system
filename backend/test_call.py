import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/analyze',
    data=json.dumps({'rawSymptoms': 'I have severe right shoulder pain and stiffness'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("STATUS:", resp.status)
        print("EXTRACTED SYMPTOMS:", res.get("extractedSymptoms"))
        print("TOP CONDITION:", res.get("possibleConditions", [{}])[0].get("name"))
        print("BODY LOCALIZATION:", json.dumps(res.get("bodyLocalization"), indent=2))
except urllib.error.HTTPError as e:
    print("ERR:", e.code, e.read().decode('utf-8'))
