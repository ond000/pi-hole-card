import { getPiHole } from '@delegates/utils/get-pihole';
import type { HomeAssistant } from '@hass/types';
import { CSSResult, LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from '../styles';
import type { Config, PiHoleDevice } from '../types';
const equal = require('fast-deep-equal');

/**
 * Todo list
 * - Add configuration options for Pi-hole URL
 * - README.md
 * - reusable html for blocks
 * - tests
 * - get entities from integration
 */

export class PiHoleCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Pi-hole information
   */
  @state()
  protected _device!: PiHoleDevice;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const device = getPiHole(hass, this._config);

    if (device && !equal(device, this._device)) {
      this._device = device;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('pi-hole-editor');
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    return {
      device_id: '',
    };
  }

  override render() {
    if (!this._hass || !this._config) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    // Get entities
    const entityId = this._config.entity;

    const piholeEntities = Object.keys(this._hass.states)
      .filter((eid) => eid.includes(`pi_hole`) || eid.includes(`pi_hole_`))
      .reduce((acc, eid) => {
        // @ts-ignore
        acc[eid] = this._hass.states[eid];
        return acc;
      }, {}) as Record<string, any>;

    // Extract specific entities
    const statusEntity = piholeEntities['binary_sensor.pi_hole_status']! || {};
    const switchEntity = piholeEntities['switch.pi_hole'] || {};
    const adsBlockedEntity =
      piholeEntities['sensor.pi_hole_ads_blocked_today'] || {};
    const percentageBlockedEntity =
      piholeEntities['sensor.pi_hole_ads_percentage_blocked_today'] || {};
    const queriesEntity =
      piholeEntities['sensor.pi_hole_dns_queries_today'] || {};
    const domainsBlockedEntity =
      piholeEntities['sensor.pi_hole_domains_blocked'] || {};
    const clientsEntity = piholeEntities['sensor.pi_hole_seen_clients'] || {};
    const uniqueDomainsEntity =
      piholeEntities['sensor.pi_hole_dns_unique_domains'] || {};
    const uniqueClientsEntity =
      piholeEntities['sensor.pi_hole_dns_unique_clients'] || {};
    const queriesCachedEntity =
      piholeEntities['sensor.pi_hole_dns_queries_cached'] || {};
    const queriesForwardedEntity =
      piholeEntities['sensor.pi_hole_dns_queries_forwarded'] || {};

    // Get button entities
    const refreshButton =
      piholeEntities['button.pi_hole_action_refresh_data'] || {};
    const restartDNSButton =
      piholeEntities['button.pi_hole_action_restartdns'] || {};
    const gravityButton = piholeEntities['button.pi_hole_action_gravity'] || {};

    // Get status
    const isActive = switchEntity.state === 'on';
    const statusColor = isActive
      ? 'var(--success-color, green)'
      : 'var(--error-color, red)';
    const statusIcon = isActive ? 'mdi:check-circle' : 'mdi:close-circle';

    // Format percentage with one decimal place
    const percentageBlocked = percentageBlockedEntity.state
      ? parseFloat(percentageBlockedEntity.state).toFixed(1) + '%'
      : '0%';

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">
            <ha-icon icon="mdi:pi-hole"></ha-icon>
            Pi-hole
          </div>
          <div class="status" style="color: ${statusColor}">
            <ha-icon icon="${statusIcon}"></ha-icon>
            ${isActive ? 'Active' : 'Disabled'}
          </div>
        </div>

        <div class="card-content">
          <!-- Main dashboard-style stats row -->
          <div class="dashboard-stats">
            <!-- Total Queries - Blue background -->
            <div
              class="stat-box queries-box"
              @click=${() => this._openPihole('/admin/queries.php')}
            >
              <div class="stat-header">Total queries</div>
              <div class="stat-value">${queriesEntity.state || '0'}</div>
              <div class="stat-footer">
                <span>${uniqueClientsEntity.state || '0'} active clients</span>
                <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
              </div>
            </div>

            <!-- Queries Blocked - Red background -->
            <div
              class="stat-box blocked-box"
              @click=${() => this._openPihole('/admin/queries.php?blocked')}
            >
              <div class="stat-header">Queries Blocked</div>
              <div class="stat-value">${adsBlockedEntity.state || '0'}</div>
              <div class="stat-footer">
                <span>List blocked queries</span>
                <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
              </div>
            </div>

            <!-- Percentage Blocked - Orange/Amber background -->
            <div
              class="stat-box percentage-box"
              @click=${() => this._openPihole('/admin/queries.php')}
            >
              <div class="stat-header">Percentage Blocked</div>
              <div class="stat-value">${percentageBlocked}</div>
              <div class="stat-footer">
                <span>List all queries</span>
                <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
              </div>
            </div>

            <!-- Domains on Lists - Green background -->
            <div
              class="stat-box domains-box"
              @click=${() => this._openPihole('/admin/groups-domains.php')}
            >
              <div class="stat-header">Domains on Lists</div>
              <div class="stat-value">${domainsBlockedEntity.state || '0'}</div>
              <div class="stat-footer">
                <span>Manage lists</span>
                <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
              </div>
            </div>
          </div>

          <!-- Additional Stats Row -->
          <div class="additional-stats">
            <div class="additional-stat">
              <ha-icon icon="mdi:account-multiple"></ha-icon>
              <span>${clientsEntity.state || '0'} clients</span>
            </div>
            <div class="additional-stat">
              <ha-icon icon="mdi:web"></ha-icon>
              <span>${uniqueDomainsEntity.state || '0'} unique domains</span>
            </div>
            <div class="additional-stat">
              <ha-icon icon="mdi:server-network"></ha-icon>
              <span>${queriesCachedEntity.state || '0'} cached</span>
            </div>
            <div class="additional-stat">
              <ha-icon icon="mdi:dns"></ha-icon>
              <span>${queriesForwardedEntity.state || '0'} forwarded</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <mwc-button
            @click=${() => this._toggleEntity(switchEntity.entity_id)}
            class="${isActive ? 'warning' : 'primary'}"
          >
            <ha-icon icon="${isActive ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
            ${isActive ? 'Disable' : 'Enable'}
          </mwc-button>

          <mwc-button
            @click=${() => this._callService(refreshButton.entity_id)}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
            Refresh
          </mwc-button>

          <mwc-button
            @click=${() => this._callService(restartDNSButton.entity_id)}
          >
            <ha-icon icon="mdi:restart"></ha-icon>
            Restart DNS
          </mwc-button>

          <mwc-button
            @click=${() => this._callService(gravityButton.entity_id)}
          >
            <ha-icon icon="mdi:earth"></ha-icon>
            Update Gravity
          </mwc-button>
        </div>
      </ha-card>
    `;
  }

  _toggleEntity(entityId: string) {
    const currentState = this._hass.states[entityId].state;
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    const [domain] = entityId.split('.');

    this._hass.callService(domain, service, {
      entity_id: entityId,
    });
  }

  _callService(entityId: { split: (arg0: string) => [any, any] }) {
    if (!entityId) return;
    const [domain, service] = entityId.split('.');
    this._hass.callService('button', 'press', {
      entity_id: entityId,
    });
  }

  _openPihole(path: string) {
    // Detect if pihole address is known (could be added as a config option)
    // This is a placeholder - you'll need to add a configuration option for the Pi-hole URL
    const piholeUrl = this._config.pihole_url || 'http://pi.hole';
    window.open(`${piholeUrl}${path}`, '_blank');
  }
}
