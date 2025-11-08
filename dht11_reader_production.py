#!/usr/bin/env python3
"""
Production DHT11 Sensor Reader using pigpio library in virtual environment
Safe, stable, and production-ready implementation
"""

import sys
import json
import time
import signal
import logging
from datetime import datetime
from typing import Dict, Optional, Tuple
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

try:
    import pigpio
except ImportError:
    logger.error(
        "pigpio library not found. Make sure virtual environment is activated.")
    logger.error("Run: source /home/wasankds/dht11_env/bin/activate")
    sys.exit(1)

# Global variables
running = True
pi_gpio = None
dht11_sensor = None


class DHT11ProductionReader:
    """Production-grade DHT11 sensor reader using pigpio"""

    def __init__(self, pi, gpio_pin=18):
        self.pi = pi
        self.gpio = gpio_pin
        self.high_tick = 0
        self.bit = 40
        self.temperature = 0
        self.humidity = 0
        self.checksum = 0
        self.either_edge_cb = None
        self.last_reading_time = 0
        self.reading_count = 0
        self.error_count = 0

        # Setup GPIO
        self.setup_gpio()

    def setup_gpio(self):
        """Initialize GPIO settings"""
        try:
            self.pi.set_pull_up_down(self.gpio, pigpio.PUD_OFF)
            self.pi.set_watchdog(self.gpio, 0)
            self.register_callbacks()
            logger.info(f"DHT11 initialized on GPIO {self.gpio}")
        except Exception as e:
            logger.error(f"GPIO setup failed: {e}")
            raise

    def register_callbacks(self):
        """Setup edge detection callbacks"""
        self.either_edge_cb = self.pi.callback(
            self.gpio,
            pigpio.EITHER_EDGE,
            self.edge_callback
        )

    def edge_callback(self, gpio, level, tick):
        """Handle GPIO edge changes"""
        try:
            if level == pigpio.RISING_EDGE:
                self._handle_rising_edge(tick)
            elif level == pigpio.FALLING_EDGE:
                self._handle_falling_edge(tick)
        except Exception as e:
            logger.debug(f"Edge callback error: {e}")
            # Reset on error
            self.bit = 40

    def _handle_rising_edge(self, tick):
        """Handle rising edge - data bit processing"""
        if self.high_tick == 0:
            return

        diff = pigpio.tickDiff(self.high_tick, tick)

        # Determine bit value based on pulse width
        bit_value = 1 if diff >= 50 else 0

        if diff >= 200:  # Invalid pulse
            self.checksum = 256  # Force bad checksum
            return

        if self.bit >= 40:  # Message complete
            self.bit = 40
        elif self.bit >= 32:  # Checksum byte
            self.checksum = (self.checksum << 1) + bit_value
            if self.bit == 39:  # Last bit
                self.pi.set_watchdog(self.gpio, 0)
                self._validate_reading()
        elif 16 <= self.bit < 24:  # Temperature byte
            self.temperature = (self.temperature << 1) + bit_value
        elif 0 <= self.bit < 8:  # Humidity byte
            self.humidity = (self.humidity << 1) + bit_value

        self.bit += 1

    def _handle_falling_edge(self, tick):
        """Handle falling edge - pulse start"""
        self.high_tick = tick
        diff = pigpio.tickDiff(self.last_reading_time, tick)

        if diff <= 250000:  # Too soon
            return

        # Start new reading
        self.bit = -2
        self.checksum = 0
        self.temperature = 0
        self.humidity = 0
        self.last_reading_time = tick

    def _validate_reading(self):
        """Validate checksum and reading"""
        try:
            total = (self.humidity + self.temperature) & 255
            if total == self.checksum:
                self.reading_count += 1
                logger.debug(
                    f"Valid reading: T={self.temperature}°C, H={self.humidity}%")
            else:
                self.error_count += 1
                logger.debug(
                    f"Checksum error: expected {total}, got {self.checksum}")
        except Exception as e:
            logger.debug(f"Validation error: {e}")
            self.error_count += 1

    def read_sensor(self) -> Tuple[Optional[float], Optional[float]]:
        """Trigger sensor reading and return data"""
        try:
            # Reset values
            old_temp = self.temperature
            old_humid = self.humidity

            # Trigger reading
            self.pi.write(self.gpio, pigpio.LOW)
            time.sleep(0.018)  # 18ms trigger pulse
            self.pi.set_mode(self.gpio, pigpio.INPUT)
            self.pi.set_watchdog(self.gpio, 200)  # 200ms timeout

            # Wait for reading
            time.sleep(0.3)

            # Check if we got new data
            if (self.temperature != old_temp or self.humidity != old_humid) and \
               (0 < self.humidity <= 100) and (-40 <= self.temperature <= 80):
                return float(self.humidity), float(self.temperature)
            else:
                return None, None

        except Exception as e:
            logger.debug(f"Read sensor error: {e}")
            return None, None

    def get_statistics(self) -> Dict:
        """Get reading statistics"""
        total_attempts = self.reading_count + self.error_count
        success_rate = (self.reading_count / total_attempts *
                        100) if total_attempts > 0 else 0

        return {
            "total_readings": self.reading_count,
            "total_errors": self.error_count,
            "success_rate_percent": round(success_rate, 1)
        }

    def close(self):
        """Cleanup resources"""
        try:
            self.pi.set_watchdog(self.gpio, 0)
            if self.either_edge_cb:
                self.either_edge_cb.cancel()
                self.either_edge_cb = None
            logger.info("DHT11 sensor closed")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global running, pi_gpio, dht11_sensor
    running = False
    logger.info("Shutdown signal received")

    if dht11_sensor:
        dht11_sensor.close()
    if pi_gpio:
        pi_gpio.stop()


def get_timestamp() -> int:
    """Get current timestamp in milliseconds"""
    return int(datetime.now().timestamp() * 1000)


def send_message(message: Dict):
    """Send JSON message to stdout"""
    try:
        print(json.dumps(message), flush=True)
    except Exception as e:
        logger.error(f"Error sending message: {e}")


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


def setup_production_environment():
    """Setup production environment and pigpio connection"""
    global pi_gpio, dht11_sensor

    # Check if pigpiod is running
    pi_gpio = pigpio.pi()
    if not pi_gpio.connected:
        logger.error("Cannot connect to pigpiod daemon")
        logger.error("Start pigpiod with: sudo pigpiod")
        return False

    logger.info("Connected to pigpiod daemon successfully")

    # Create DHT11 sensor
    try:
        dht11_sensor = DHT11ProductionReader(pi_gpio, gpio_pin=18)
        logger.info("DHT11 production reader initialized")
        return True
    except Exception as e:
        logger.error(f"DHT11 initialization failed: {e}")
        return False


def main():
    """Main production sensor loop"""
    global running

    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Configuration
    GPIO_PIN = 18
    READING_INTERVAL = 5.0  # 5 seconds for production stability
    MAX_RETRIES = 3

    logger.info(f"Starting DHT11 Production Reader on GPIO {GPIO_PIN}")

    send_message({
        "type": "status",
        "message": f"DHT11 Production Reader starting on GPIO {GPIO_PIN}",
        "library": "pigpio",
        "environment": "venv",
        "timestamp": get_timestamp()
    })

    # Setup production environment
    if not setup_production_environment():
        send_message({
            "type": "error",
            "message": "Failed to setup production environment",
            "timestamp": get_timestamp()
        })
        sys.exit(1)

    consecutive_errors = 0
    reading_count = 0

    # Main production loop
    while running:
        try:
            reading_count += 1

            # Try reading sensor with retries
            humidity, temperature = None, None
            for attempt in range(MAX_RETRIES):
                humidity, temperature = dht11_sensor.read_sensor()
                if humidity is not None and temperature is not None:
                    break
                time.sleep(1)  # Wait between retries

            timestamp = get_timestamp()

            if humidity is not None and temperature is not None:
                # Successful reading
                consecutive_errors = 0
                heat_index = calculate_heat_index(temperature, humidity)
                stats = dht11_sensor.get_statistics()

                send_message({
                    "type": "reading",
                    "timestamp": timestamp,
                    "temperature": round(temperature, 1),
                    "humidity": round(humidity, 1),
                    "heat_index": round(heat_index, 1) if heat_index else None,
                    "gpio_pin": GPIO_PIN,
                    "library": "pigpio",
                    "environment": "venv",
                    "reading_number": reading_count,
                    "statistics": stats,
                    "status": "success"
                })

            else:
                # Failed reading
                consecutive_errors += 1
                send_message({
                    "type": "error",
                    "timestamp": timestamp,
                    "status": "error",
                    "error": f"Sensor read failed (attempt {consecutive_errors})",
                    "reading_number": reading_count
                })

                # If too many consecutive errors, restart sensor
                if consecutive_errors >= 10:
                    logger.warning(
                        "Too many consecutive errors, restarting sensor")
                    dht11_sensor.close()
                    if setup_production_environment():
                        consecutive_errors = 0
                        logger.info("Sensor restarted successfully")
                    else:
                        logger.error("Sensor restart failed")
                        break

            # Wait for next reading
            time.sleep(READING_INTERVAL)

        except KeyboardInterrupt:
            running = False
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            send_message({
                "type": "error",
                "timestamp": get_timestamp(),
                "status": "error",
                "error": f"Unexpected error: {str(e)}"
            })
            time.sleep(READING_INTERVAL)

    # Cleanup
    logger.info("Shutting down DHT11 Production Reader")
    send_message({
        "type": "status",
        "message": "DHT11 Production Reader stopped",
        "timestamp": get_timestamp()
    })


if __name__ == "__main__":
    main()
