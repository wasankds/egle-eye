import pigpio


def cbf(gpio, level, tick):
    print(gpio, level, tick)


pi = pigpio.pi()
pi.set_mode(27, pigpio.INPUT)
pi.set_pull_up_down(27, pigpio.PUD_UP)
cb = pi.callback(27, pigpio.EITHER_EDGE, cbf)
input("Press Enter to exit\n")
cb.cancel()
pi.stop()
