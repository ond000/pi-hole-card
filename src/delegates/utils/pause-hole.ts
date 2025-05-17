import { formatSecondsToHHMMSS } from '@common/convert-time';
import type { HomeAssistant } from '@hass/types';
import type { PiHoleDevice } from '@type/types';

/**
 * Returns a function that, when invoked, pauses the specified Pi-hole device for a given duration.
 *
 * @param hass - The Home Assistant instance used to call services.
 * @param device - The Pi-hole device to be paused.
 * @param seconds - The duration to pause the device, in seconds.
 * @returns A function that triggers the pause action when called.
 */
export const handlePauseClick = (
  hass: HomeAssistant,
  device: PiHoleDevice,
  seconds: number,
) => {
  return () => {
    const domain = 'pi_hole_v6';
    const service = 'disable';
    hass.callService(domain, service, {
      device_id: device.device_id,
      duration: formatSecondsToHHMMSS(seconds),
    });
  };
};
