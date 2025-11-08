#!/usr/bin/env python3
"""
Simple diagnostic for DHT11 using pigpio.
Triggers the sensor and logs GPIO edge timings so you can see if the sensor responds.

Usage on Pi (ensure pigpiod is running):
  python3 dht11_debug.py

This will print a short sequence of edge events (level and microsecond ticks) after a trigger.
If you see no edges after the trigger, the sensor didn't respond.
"""
import time
import pigpio
import sys

PIN = 18
RECORD_TIME = 1.0  # seconds to record after trigger


def main():
    pi = pigpio.pi()
    if not pi.connected:
        print('Cannot connect to pigpiod. Start pigpiod and retry.', file=sys.stderr)
        return 1

    events = []

    def cb(gpio, level, tick):
        # tick is microseconds
        events.append((level, tick))

    cb_h = pi.callback(PIN, pigpio.EITHER_EDGE, cb)

    try:
        # Ensure pin is output low for 18ms to trigger DHT11
        pi.set_mode(PIN, pigpio.OUTPUT)
        pi.write(PIN, 0)
        time.sleep(0.018)

        # Release line and set to input
        pi.set_mode(PIN, pigpio.INPUT)

        # record edges for RECORD_TIME seconds
        start = time.time()
        while time.time() - start < RECORD_TIME:
            time.sleep(0.01)

    finally:
        cb_h.cancel()
        pi.stop()

    if not events:
        print('No edges recorded — sensor did not respond.')
        return 0

    # Convert ticks to relative times
    base = events[0][1]
    print('Level, tick(us), delta(us)')
    prev = base
    for level, tick in events:
        print(f"{level}, {tick}, {tick - prev}")
        prev = tick

    return 0


if __name__ == '__main__':
    sys.exit(main())
