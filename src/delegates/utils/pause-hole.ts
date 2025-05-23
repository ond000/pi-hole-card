import { formatSecondsToHHMMSS } from '@common/convert-time';
import type { HomeAssistant } from '@hass/types';
import type { PiHoleSetup } from '@type/types';

/**
 * Returns a function that, when invoked, pauses the specified Pi-hole device for a given duration.
 *
 * @param hass - The Home Assistant instance used to call services.
 * @param setup - The Pi-hole setup to be paused.
 * @param seconds - The duration to pause the device, in seconds.
 * @returns A function that triggers the pause action when called.
 */
export const handlePauseClick = (
  hass: HomeAssistant,
  setup: PiHoleSetup,
  seconds: number,
) => {
  return () => {
    const domain = 'pi_hole_v6';
    const service = 'disable';
    setup.holes.forEach((hole) => {
      hass.callService(domain, service, {
        device_id: hole.device_id,
        duration: formatSecondsToHHMMSS(seconds),
      });
    });
  };
};
