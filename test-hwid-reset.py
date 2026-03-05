import requests

def test_hwid_reset():
    """Test HWID reset functionality"""
    url = "http://localhost:9002/api/keys/reset-hwid"
    
    # Test with valid API key
    payload = {
        "keyValue": "KG-3S8O-ND83"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        result = response.json()
        
        print(f"\n{'='*60}")
        print(f"HWID Reset Test Results")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        print(f"Success: {result.get('success')}")
        print(f"Message: {result.get('message')}")
        if result.get('debug'):
            print(f"Debug: {result.get('debug')}")
        if result.get('hoursRemaining'):
            print(f"Hours Remaining: {result.get('hoursRemaining')}")
        if result.get('nextResetAvailable'):
            print(f"Next Reset Available: {result.get('nextResetAvailable')}")
        print(f"{'='*60}\n")
        
        return result.get('success', False)
            
    except requests.exceptions.RequestException as e:
        print(f"[✗] Connection error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_hwid_reset()
    if success:
        print("✓ HWID reset test passed")
    else:
        print("✗ HWID reset test result received (may be cooldown or permission issue)")
