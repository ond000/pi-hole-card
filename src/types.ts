/**
 * Configuration settings for the pi-hole card
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** URL of the instance */
  url?: string;
}

export interface PiHoleDevice {
  /** Unique identifier for the device */
  device_id: string;

  /**
   * Sensors for Pi-hole
   */
  /** Total DNS Queries */
  dns_queries_today?: EntityInformation;

  /** Total Domains Blocked */
  domains_blocked?: EntityInformation;

  /** Percentage of Ads Blocked Today */
  ads_percentage_blocked_today?: EntityInformation;

  /** Total Ads Blocked Today */
  ads_blocked_today?: EntityInformation;

  /** Total Seen Clients */
  seen_clients?: EntityInformation;

  /** Total Unique Domains Queried */
  dns_unique_domains?: EntityInformation;

  /** Total DNS Queries Cached */
  dns_queries_cached?: EntityInformation;

  /** Total DNS Queries Forwarded */
  dns_queries_forwarded?: EntityInformation;

  /** Total Unique Clients Queried */
  dns_unique_clients?: EntityInformation;

  /** Remaining Time Until Blocking Mode */
  remaining_until_blocking_mode?: EntityInformation;

  /**
   * Button for Pi-hole
   */
  /** Button to flush arp */
  action_flush_arp?: EntityInformation;

  /** Button to Flush Logs */
  action_flush_logs?: EntityInformation;

  /** Button to Update Gravity */
  action_gravity?: EntityInformation;

  /** Button to Refresh DNS */
  action_restartdns?: EntityInformation;

  /** Button to Refresh data */
  action_refresh_data?: EntityInformation;

  /**
   * Updates for Pi-hole
   */
  /** Core Update Available */
  core_update_available?: EntityInformation;

  /** Web Update Available */
  web_update_available?: EntityInformation;

  /** Pi-hole FTL Update Available */
  ftl_update_available?: EntityInformation;

  /** Integration Update Available */
  integration_update_available?: EntityInformation;

  /**
   * Switches for Pi-hole
   */
  /** Switch for group default */
  group_default?: EntityInformation;

  /** Switch for Pi-hole blocking */
  switch_pi_hole?: EntityInformation;

  /**
   * Binary Sensors for Pi-hole
   */
  /** Status of Pi-hole */
  status?: EntityInformation;
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
