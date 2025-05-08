import type { ActionConfig } from '@hass/data/lovelace/config/action';

/**
 * Configuration settings for the pi-hole card
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** Card title */
  title?: string;

  /** Card icon */
  icon?: string;

  /** actions for stats boxes */
  stats?: SectionConfig;

  /** actions for info section */
  info?: SectionConfig;

  /** actions for controls */
  controls?: SectionConfig;
}

export interface SectionConfig {
  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}

export interface PiHoleDevice {
  /** Unique identifier for the device */
  device_id: string;

  /** Total DNS Queries */
  dns_queries_today?: EntityInformation;

  /** Total Domains Blocked */
  domains_blocked?: EntityInformation;

  /** Percentage of Ads Blocked Today */
  ads_percentage_blocked_today?: EntityInformation;

  /** Total Ads Blocked Today */
  ads_blocked_today?: EntityInformation;

  /** Total Unique Clients Queried */
  dns_unique_clients?: EntityInformation;

  /** Remaining Time Until Blocking Mode */
  remaining_until_blocking_mode?: EntityInformation;

  /** Status of Pi-hole */
  status?: EntityInformation;

  /** Sensors for the Pi-hole */
  sensors: EntityInformation[];

  /** Switches for Pi-hole */
  switches: EntityInformation[];

  /** Control entities for the device */
  controls: EntityInformation[];

  /** Update entities for the device */
  updates: EntityInformation[];
}

export interface EntityInformation extends EntityState {
  /** Translation key */
  translation_key: string | undefined;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;
}
