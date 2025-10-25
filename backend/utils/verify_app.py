"""Verify app can start without errors"""
try:
    print("Loading app_new...")
    from app_new import app, logger, detector
    print("[OK] App loaded successfully")
    print(f"[OK] Detector: {type(detector).__name__ if detector else 'None'}")
    print("[OK] Ready to start!")
    print("\nRun: py app.py")
except Exception as e:
    print(f"[FAIL] {e}")
    import traceback
    traceback.print_exc()
