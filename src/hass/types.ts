/**
 * https://github.com/home-assistant/frontend/blob/dev/src/types.ts
 */

import type { DeviceRegistryEntry } from './data/device_registry';
import type { EntityRegistryDisplayEntry } from './data/entity_registry';

export interface HomeAssistant {
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
}
