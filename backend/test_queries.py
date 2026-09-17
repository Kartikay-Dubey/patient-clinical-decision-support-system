import urllib.request
import json

cases = ['headache', 'back spinal cord pain', 'severe spinal pain', 'shoulder', 'knee pain']
for c in cases:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/analyze',
        data=json.dumps({'rawSymptoms': c}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode())
            loc = d.get('bodyLocalization', {})
            print(f"=== Query: {c} ===")
            print(f"Top Condition: {d.get('possibleConditions', [{}])[0].get('name')}")
            print(f"Primary Region: {loc.get('primaryRegion')}")
            print(f"Body System: {loc.get('bodySystem')}")
            print(f"Target Organ: {loc.get('targetOrgan')}")
            print(f"Coords: {loc.get('spatialCoordinates')}\n")
    except urllib.error.HTTPError as e:
        print(f"=== Query: {c} === ERROR {e.code}: {e.read().decode()}\n")
