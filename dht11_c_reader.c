// dht11_c_reader.c
#include <stdio.h>
#include <stdlib.h>
#include <pigpio.h>
#include <unistd.h>

#define PIN 18
#define RECORD_MS 1000

int events = 0;
unsigned int first_tick = 0;
unsigned int prev_tick = 0;

void alertFunc(int gpio, int level, uint32_t tick)
{
  if (events == 0)
    first_tick = tick;
  if (level == PI_TIMEOUT)
  {
    // watchdog event (level==2 in your python output)
    printf("WD, %u, %u\n", tick, tick - prev_tick);
  }
  else
  {
    unsigned int delta = (events == 0) ? 0 : tick - prev_tick;
    printf("%d, %u, %u\n", level, tick, delta);
  }
  prev_tick = tick;
  events++;
}

int main(){
  if (gpioInitialise() < 0)
  {
    fprintf(stderr, "pigpio init failed\n");
    return 1;
  }

  gpioSetMode(PIN, PI_OUTPUT);
  gpioWrite(PIN, 0);
  usleep(18000); // 18 ms trigger
  gpioSetMode(PIN, PI_INPUT);

  gpioSetAlertFunc(PIN, alertFunc);
  // Use watchdog to stop after RECORD_MS ms
  gpioSetWatchdog(PIN, RECORD_MS / 10); // watchdog in 0.1s units if needed

  sleep(1); // record time

  gpioSetAlertFunc(PIN, NULL);
  gpioSetWatchdog(PIN, 0);
  gpioTerminate();
  return 0;
}