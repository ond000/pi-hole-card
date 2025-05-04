/**
 * Configuration settings for the pi-hole card
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;
}

export interface PiHoleDevice {
  /** Unique identifier for the device */
  device_id: string;
  /** Name of the device */
  name: string;
  /** IP address of the device */
  ip_address: string;
  /** MAC address of the device */
  mac_address: string;
  /** Status of the device (e.g., online, offline) */
  status: string;
  /** Type of the device (e.g., router, switch) */
  type: string;
}

export interface EntityInformation extends EntityState {}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;
}
