#!/usr/bin/env python3
"""
DHT11 Sensor Reader using pigpio library
Much more reliable and modern than Adafruit_DHT
Works with all Raspberry Pi models including Pi 4 and Pi 5
"""

import sys
import time
import json
import signal
from datetime import datetime
from typing import Dict, Optional, Tuple

try:
    import pigpio
except ImportError:
    print("Error: pigpio library not installed. Install with: pip3 install pigpio", file=sys.stderr)
    sys.exit(1)

# Global variables
running = True
pi_gpio = None

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    global running, pi_gpio
    running = False
    if pi_gpio:
        pi_gpio.stop()
    send_message({
        "type": "status",
        "message": "Shutting down DHT11 reader",
        "timestamp": get_timestamp()
    })

def get_timestamp() -> int:
    """Get current timestamp in milliseconds"""
    return int(datetime.now().timestamp() * 1000)

def send_message(message: Dict):
    """Send JSON message to stdout"""
    try:
        print(json.dumps(message), flush=True)
    except Exception as e:
        print(f"Error sending message: {e}", file=sys.stderr)

class DHT11_pigpio:
    """DHT11 sensor reader using pigpio library"""
    
    def __init__(self, pi, gpio_pin):
        self.pi = pi
        self.gpio = gpio_pin
        self.high_tick = 0
        self.bit = 40
        self.either_edge_cb = None
        self.data = []
        
    def _edge_callback(self, gpio, level, tick):
        """Callback for GPIO edge detection"""
        if level == 1:
            # Rising edge
            self.high_tick = tick
        else:
            # Falling edge - measure pulse width
            if self.high_tick != 0:
                pulse_len = pigpio.tickDiff(self.high_tick, tick)
                
                if self.bit >= 40:  # Start sequence
                    self.bit = -2
                    self.data = []
                elif self.bit >= 0:  # Data bits
                    if pulse_len > 60:  # High bit (>50μs)
                        self.data.append(1)
                    else:  # Low bit (<50μs)
                        self.data.append(0)
                        
                self.bit += 1
    
    def read(self) -> Tuple[Optional[float], Optional[float]]:
        """Read temperature and humidity from DHT11"""
        try:
            # Reset
            self.bit = 40
            self.data = []
            
            # Setup callback for edge detection
            self.either_edge_cb = self.pi.callback(self.gpio, pigpio.EITHER_EDGE, self._edge_callback)
            
            # Send start signal
            self.pi.write(self.gpio, 0)  # Pull low
            time.sleep(0.02)  # 20ms
            self.pi.set_mode(self.gpio, pigpio.INPUT)  # Set as input
            
            # Wait for reading to complete
            timeout = time.time() + 0.5  # 500ms timeout
            while self.bit < 40 and time.time() < timeout:
                time.sleep(0.001)
            
            # Cleanup callback
            if self.either_edge_cb:
                self.either_edge_cb.cancel()
                self.either_edge_cb = None
            
            # Check if we got all 40 bits
            if len(self.data) != 40:
                return None, None
            
            # Convert bits to bytes
            bytes_data = []
            for i in range(0, 40, 8):
                byte_val = 0
                for j in range(8):
                    byte_val = (byte_val << 1) + self.data[i + j]
                bytes_data.append(byte_val)
            
            # Verify checksum
            checksum = (bytes_data[0] + bytes_data[1] + bytes_data[2] + bytes_data[3]) & 0xFF
            if checksum != bytes_data[4]:
                return None, None
            
            # Extract humidity and temperature
            humidity = bytes_data[0] + bytes_data[1] / 10.0
            temperature = bytes_data[2] + bytes_data[3] / 10.0
            
            # Handle negative temperatures (DHT11 doesn't support, but just in case)
            if bytes_data[2] & 0x80:
                temperature = -(temperature & 0x7F)
            
            return humidity, temperature
            
        except Exception as e:
            if self.either_edge_cb:
                self.either_edge_cb.cancel()
                self.either_edge_cb = None
            return None, None

def setup_pigpio(gpio_pin=18) -> Tuple[Optional[object], Optional[DHT11_pigpio]]:
    """Initialize pigpio and DHT11 sensor"""
    try:
        # Connect to pigpio daemon
        pi = pigpio.pi()
        if not pi.connected:
            send_message({
                "type": "error",
                "message": "Could not connect to pigpio daemon. Is it running?",
                "timestamp": get_timestamp()
            })
            return None, None
        
        # Setup GPIO pin
        pi.set_mode(gpio_pin, pigpio.INPUT)
        pi.set_pull_up_down(gpio_pin, pigpio.PUD_UP)
        
        # Create DHT11 sensor object
        dht11 = DHT11_pigpio(pi, gpio_pin)
        
        send_message({
            "type": "status",
            "message": f"pigpio DHT11 initialized on GPIO {gpio_pin}",
            "timestamp": get_timestamp()
        })
        
        return pi, dht11
        
    except Exception as e:
        send_message({
            "type": "error",
            "message": f"pigpio setup error: {e}",
            "timestamp": get_timestamp()
        })
        return None, None

def read_dht11_sensor(dht11_sensor, gpio_pin=18, max_retries=3) -> Dict:
    """Read DHT11 sensor with error handling"""
    timestamp = get_timestamp()
    
    for attempt in range(max_retries):
        try:
            humidity, temperature = dht11_sensor.read()
            
            if humidity is not None and temperature is not None:
                # Validate readings
                if 0 <= humidity <= 100 and -40 <= temperature <= 80:
                    # Calculate heat index
                    heat_index = calculate_heat_index(temperature, humidity)
                    
                    return {
                        "type": "reading",
                        "timestamp": timestamp,
                        "temperature": round(temperature, 1),
                        "humidity": round(humidity, 1),
                        "heat_index": round(heat_index, 1) if heat_index else None,
                        "gpio_pin": gpio_pin,
                        "library": "pigpio",
                        "status": "success"
                    }
                else:
                    if attempt == max_retries - 1:
                        return {
                            "type": "error",
                            "timestamp": timestamp,
                            "status": "error",
                            "error": f"Invalid readings: T={temperature}, H={humidity}"
                        }
            else:
                if attempt == max_retries - 1:
                    return {
                        "type": "error", 
                        "timestamp": timestamp,
                        "status": "error",
                        "error": f"No data received after {max_retries} attempts"
                    }
            
            # Wait before retry
            time.sleep(1)
            
        except Exception as e:
            if attempt == max_retries - 1:
                return {
                    "type": "error",
                    "timestamp": timestamp,
                    "status": "error",
                    "error": f"Sensor read error: {str(e)}"
                }
            time.sleep(1)
    
    return {
        "type": "error",
        "timestamp": timestamp,
        "status": "error", 
        "error": "Unknown sensor reading error"
    }

def calculate_heat_index(temp_c: float, humidity: float) -> Optional[float]:
    """Calculate heat index (feels like temperature)"""
    try:
        if temp_c >= 27 and humidity >= 40:
            temp_f = (temp_c * 9/5) + 32
            hi = (-42.379 + 2.04901523 * temp_f + 10.14333127 * humidity
                  - 0.22475541 * temp_f * humidity - 6.83783e-3 * temp_f**2
                  - 5.481717e-2 * humidity**2 + 1.22874e-3 * temp_f**2 * humidity
                  + 8.5282e-4 * temp_f * humidity**2 - 1.99e-6 * temp_f**2 * humidity**2)
            return (hi - 32) * 5/9
        else:
            return temp_c
    except:
        return None

def main():
    """Main DHT11 reader loop using pigpio"""
    global running, pi_gpio
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Configuration
    GPIO_PIN = 18
    READING_INTERVAL = 3.0  # Slightly longer for DHT11
    
    send_message({
        "type": "status",
        "message": f"Starting DHT11 reader (pigpio) on GPIO {GPIO_PIN}",
        "timestamp": get_timestamp()
    })
    
    # Setup pigpio and DHT11
    pi_gpio, dht11_sensor = setup_pigpio(GPIO_PIN)
    if not pi_gpio or not dht11_sensor:
        send_message({
            "type": "error",
            "message": "Failed to setup pigpio DHT11 sensor",
            "timestamp": get_timestamp()
        })
        sys.exit(1)
    
    # Main reading loop
    while running:
        try:
            # Read sensor
            reading = read_dht11_sensor(dht11_sensor, GPIO_PIN)
            send_message(reading)
            
            # Wait for next reading
            time.sleep(READING_INTERVAL)
            
        except KeyboardInterrupt:
            running = False
            break
        except Exception as e:
            send_message({
                "type": "error",
                "timestamp": get_timestamp(),
                "status": "error",
                "error": f"Unexpected error: {str(e)}"
            })
            time.sleep(READING_INTERVAL)
    
    # Cleanup
    if pi_gpio:
        pi_gpio.stop()
    
    send_message({
        "type": "status",
        "message": "DHT11 reader (pigpio) stopped",
        "timestamp": get_timestamp()
    })

if __name__ == "__main__":
    main()