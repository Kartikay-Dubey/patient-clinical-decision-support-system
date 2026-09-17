import urllib.request, json, sys

TESTS = [
    # (input_text, expected_region, expected_x_approx, expected_y_approx)
    ('headache',                          'Head',       0.0,  1.62),
    ('I have a severe headache',          'Head',       0.0,  1.62),
    ('migraine',                          'Head',       0.0,  1.62),
    ('head pain',                         'Head',       0.0,  1.62),
    ('dizziness and nausea',              'Head',       0.0,  1.62),
    ('neck pain and stiffness',           'Head',       0.0,  1.45),
    ('lower back pain',                   'Pelvis',     0.0,  0.90),
    ('back pain',                         'Thorax',     0.0,  1.20),
    ('hip pain left side',                'Pelvis',     None, 0.82),
    ('shoulder',                          'Upper Limb', -0.19, 1.35),
    ('left shoulder pain',                'Upper Limb',  0.19, 1.35),
    ('right shoulder pain',               'Upper Limb', -0.19, 1.35),
    ('right knee pain',                   'Lower Limb', -0.08, 0.45),
    ('left knee swelling',                'Lower Limb',  0.08, 0.45),
    ('wrist pain',                        'Upper Limb',  None, 0.85),
    ('ankle sprain',                      'Lower Limb',  None, 0.08),
    ('sore throat',                       'Head',       0.0,  1.42),
    ('I have severe chest pain and shortness of breath', 'Thorax', None, None),
    ('chest pain radiating to left shoulder', 'Thorax', None, None),  # chest dominates
]

passed = failed = 0
for prompt, expected_region, exp_x, exp_y in TESTS:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/analyze',
        data=json.dumps({'rawSymptoms': prompt}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode())
        bl = res['bodyLocalization']
        region = bl['primaryRegion']
        x = bl['spatialCoordinates']['x']
        y = bl['spatialCoordinates']['y']
        region_ok = region == expected_region
        x_ok = (exp_x is None) or (abs(x - exp_x) < 0.02)
        y_ok = (exp_y is None) or (abs(y - exp_y) < 0.05)
        ok = region_ok and x_ok and y_ok
        status = 'PASS' if ok else 'FAIL'
        if ok:
            passed += 1
        else:
            failed += 1
        cond = res['possibleConditions'][0]['name']
        note = f'(region={region}'
        if not region_ok: note += f' expected={expected_region}'
        if not x_ok: note += f' x={x:.2f} expected={exp_x}'
        if not y_ok: note += f' y={y:.2f} expected={exp_y}'
        note += f', cond={cond})'
        print(f'[{status}] {prompt!r:50s} {note}')
    except Exception as e:
        print(f'[ERR] {prompt!r}: {e}')
        failed += 1

print(f'\n{passed}/{len(TESTS)} passed  |  {failed} failed')
sys.exit(0 if failed == 0 else 1)
