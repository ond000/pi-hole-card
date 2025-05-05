/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/device_registry.ts
 */

import type { RegistryEntry } from './registry';

export interface DeviceRegistryEntry extends RegistryEntry {
  id: string;
  config_entries: string[];
}
