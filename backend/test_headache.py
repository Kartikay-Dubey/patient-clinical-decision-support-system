import urllib.request, json

for prompt in ['headache', 'I have a severe headache', 'migraine', 'head pain', 'headache and fever', 'back pain']:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/analyze',
        data=json.dumps({'rawSymptoms': prompt}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
    bl = res['bodyLocalization']
    top_cond = res['possibleConditions'][0]['name']
    print(f"INPUT: {prompt!r}")
    print(f"  TOP COND: {top_cond}")
    print(f"  REGION:   {bl['primaryRegion']}")
    print(f"  ORGAN:    {bl['targetOrgan']}")
    print(f"  SYSTEM:   {bl['bodySystem']}")
    print(f"  COORDS:   x={bl['spatialCoordinates']['x']}, y={bl['spatialCoordinates']['y']}")
    print()
