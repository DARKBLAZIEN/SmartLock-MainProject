import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Optional: Import GPIO if running on actual Raspberry Pi
try:
    import RPi.GPIO as GPIO
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    IS_PI = True
except (ImportError, RuntimeError):
    IS_PI = False
    print("Warning: RPi.GPIO not found. Running in Virtual Simulation mode.")

app = Flask(__name__)
# Enable CORS for internal requests
CORS(app)

# --- CONFIGURATION (Match this to backend/.env) ---
# For production, set this as an environment variable on the Pi
HARDWARE_SECRET_KEY = os.environ.get("HARDWARE_SECRET_KEY", "SmartLock_X_Secret_2026_CUSAT")
LOCK_PIN = 12  # GPIO 12/BCM

# --- GPIO SETUP ---
if IS_PI:
    GPIO.setup(LOCK_PIN, GPIO.OUT)
    GPIO.output(LOCK_PIN, GPIO.LOW)  # Starts locked

@app.route('/api/hardware/unlock', methods=['POST'])
def unlock_locker():
    # 1. SECURITY: Verify X-API-KEY from header
    client_key = request.headers.get('X-API-KEY')
    
    if client_key != HARDWARE_SECRET_KEY:
        print(f"[SECURITY ALERT] Unauthorized access from {request.remote_addr}!")
        return jsonify({"success": False, "message": "Access Denied"}), 401
    
    # 2. Extract Data
    data = request.get_json()
    locker_id = data.get('lockerId', 'Unknown')
    print(f"[Hardware Agent] Secure unlock request verified for unit: {locker_id}")

    # 3. TRIGGER RELAY / SOLENOID
    if IS_PI:
        try:
            # Simple pulse: 2 seconds to unlock
            GPIO.output(LOCK_PIN, GPIO.HIGH)
            import time
            time.sleep(2)                    
            GPIO.output(LOCK_PIN, GPIO.LOW)
        except Exception as e:
            print(f"GPIO Error: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    else:
        print(f"[VIRTUAL PI] Simulating Solenoid Pulse for {locker_id}...")

    return jsonify({
        "success": True, 
        "message": f"Units {locker_id} latch triggered securely."
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Hardware Agent Online", "is_pi": IS_PI})

if __name__ == '__main__':
    print(f"SmartLock Secure Hardware Bridge starting...")
    print(f"Listening on port 5001. Secret Required: YES")
    # Bind to 0.0.0.0 so the Node.js backend can reach it
    app.run(host='0.0.0.0', port=5001)
