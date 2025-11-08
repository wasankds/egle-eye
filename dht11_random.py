#!/usr/bin/env python3
"""
Simple DHT11 Sensor Reader - Windows Compatible
"""

import time
import json
import random

# การตั้งค่า
GPIO_PIN = 18
INTERVAL = 3
# USE_SIMULATION = True


def read_dht11():
    """จำลองการอ่านข้อมูลจาก DHT11"""
    temperature = round(20 + random.uniform(-5, 15), 1)  # 15-35°C
    humidity = round(40 + random.uniform(-10, 30), 1)    # 30-70%
    return temperature, humidity


def main():
    # === ส่งไป stdout ===#
    print("Simple DHT11 Reader Starting...")
    print(f"GPIO Pin: {GPIO_PIN}")
    print(f"Interval: {INTERVAL} seconds")
    print("Using simulation data (not real sensor)")

    # if USE_SIMULATION:
    # print("Using simulation data (not real sensor)")

    while True:
        try:
            # อ่านข้อมูล
            temp, humid = read_dht11()

            # สร้าง JSON output
            data = {
                "temperature": temp,
                "humidity": humid,
                "timestamp": int(time.time())
            }

            # ข้อมูลจริงไป stdout (ส่งไป Node.js)
            # print ใช้ส่งข้อมูลออกไป stdout ได้ด้วย
            # - ส่งข้อมูลออกไป stdout
            """ 
            Python Process (sensor.py)      Node.js Process (server.js)
                ↓                              ↑
            print() ────────────────→ sensorProcess.stdout
            """
            print(json.dumps(data), flush=True)

        except Exception as e:
            print(f"Error: {e}")

        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
