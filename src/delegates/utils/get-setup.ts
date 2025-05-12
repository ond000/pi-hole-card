import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { PiHoleSetup } from '@type/types';
import { getPiHole } from './get-pihole';

/**
 * Gets the Pi-hole setup information from Home Assistant
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @returns The Pi-hole setup object or undefined if no devices are found
 */
export const getPiSetup = (
  hass: HomeAssistant,
  config: Config,
): PiHoleSetup | undefined => {
  // Handle both string and array device IDs
  const deviceIds = Array.isArray(config.device_id)
    ? config.device_id
    : [config.device_id];

  if (deviceIds.length === 0) {
    return undefined;
  }

  const holes = deviceIds
    .map((deviceId) => getPiHole(hass, config, deviceId))
    .filter((device) => device !== undefined);

  return {
    holes,
  };
};
