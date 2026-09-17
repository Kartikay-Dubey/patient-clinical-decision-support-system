from backend.app.services.clinical_adapter import get_clinical_service

svc = get_clinical_service()
for prompt in ['headache', 'I have a severe headache', 'head pain', 'back pain']:
    res = svc.diagnose_free_text(text=prompt, age=30, sex='M', top_k=3)
    evs = res.get('nlp_extraction', {}).get('matched_evidences', [])
    print(f"INPUT: {prompt!r}")
    for ev in evs:
        print(f"  EV: code={ev.get('code')} | finding={ev.get('finding_en')}")
    top = res['differential_diagnosis'][0]['condition'] if res['differential_diagnosis'] else 'N/A'
    print(f"  TOP COND: {top}")
    print()
