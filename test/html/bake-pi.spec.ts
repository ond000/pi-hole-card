import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { renderPiHoleCard } from '@html/bake-pi';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('bake-pi.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockConfig: Config;
    let openStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a stub for window.open
      openStub = stub(window, 'open');

      // Mock HomeAssistant instance
      mockHass = {
        callService: stub(),
        states: {
          'binary_sensor.pi_hole_status': {
            state: 'on',
            entity_id: 'binary_sensor.pi_hole_status',
            attributes: {
              friendly_name: 'Pi-hole Status',
            },
          },
          'switch.pi_hole': {
            state: 'on',
            entity_id: 'switch.pi_hole',
            attributes: {
              friendly_name: 'Pi-hole',
            },
          },
        },
      } as unknown as HomeAssistant;

      // Mock device
      mockDevice = {
        device_id: 'pi_hole_device',
        status: {
          entity_id: 'binary_sensor.pi_hole_status',
          state: 'on',
          attributes: { friendly_name: 'Pi-hole Status' },
          translation_key: undefined,
        },
        switch_pi_hole: {
          entity_id: 'switch.pi_hole',
          state: 'on',
          attributes: { friendly_name: 'Pi-hole' },
          translation_key: undefined,
        },
        dns_queries_today: {
          entity_id: 'sensor.dns_queries_today',
          state: '12345',
          attributes: {},
          translation_key: 'dns_queries_today',
        },
        ads_blocked_today: {
          entity_id: 'sensor.ads_blocked_today',
          state: '5678',
          attributes: {},
          translation_key: 'ads_blocked_today',
        },
        ads_percentage_blocked_today: {
          entity_id: 'sensor.ads_percentage_blocked_today',
          state: '45.6',
          attributes: {},
          translation_key: 'ads_percentage_blocked_today',
        },
        domains_blocked: {
          entity_id: 'sensor.domains_blocked',
          state: '987654',
          attributes: {},
          translation_key: 'domains_blocked',
        },
        seen_clients: {
          entity_id: 'sensor.seen_clients',
          state: '42',
          attributes: {},
          translation_key: 'seen_clients',
        },
        core_update_available: {
          entity_id: 'sensor.core_update_available',
          state: 'unknown',
          attributes: { installed_version: 'v5.14.2' },
          translation_key: 'core_update_available',
        },
        web_update_available: {
          entity_id: 'sensor.web_update_available',
          state: 'unknown',
          attributes: { installed_version: 'v5.17' },
          translation_key: 'web_update_available',
        },
        ftl_update_available: {
          entity_id: 'sensor.ftl_update_available',
          state: 'unknown',
          attributes: { installed_version: 'v5.21' },
          translation_key: 'ftl_update_available',
        },
        integration_update_available: {
          entity_id: 'update.pi_hole_v6_integration_update',
          state: 'unknown',
          attributes: { installed_version: 'v2.0.0' },
          translation_key: undefined,
        },
      } as PiHoleDevice;

      // Mock config
      mockConfig = {
        device_id: 'pi_hole_device',
        url: 'http://pi.hole',
      };
    });

    afterEach(() => {
      // Restore stubs
      openStub.restore();
    });

    it('should render a Pi-hole card with all sections', async () => {
      // Render the Pi-hole card
      const result = renderPiHoleCard(mockDevice, mockHass, mockConfig);
      const el = await fixture(result);

      // Test main sections exist
      expect(el.querySelector('.card-header')).to.exist;
      expect(el.querySelector('.card-content')).to.exist;
      expect(el.querySelector('.card-actions')).to.exist;
      expect(el.querySelector('.version-info')).to.exist;
    });

    it('should format percentage correctly', async () => {
      // Render the Pi-hole card
      const result = renderPiHoleCard(mockDevice, mockHass, mockConfig);
      const el = await fixture(result);

      // Find the percentage stat box
      const percentageBox = el.querySelector('.percentage-box .stat-value');
      expect(percentageBox).to.exist;
      expect(percentageBox?.textContent?.trim()).to.equal('45.6%');
    });

    it('should handle zero percentage values', async () => {
      // Create a device with zero percentage
      const deviceWithZeroPercentage = {
        ...mockDevice,
        ads_percentage_blocked_today: {
          ...mockDevice.ads_percentage_blocked_today!,
          state: '0',
        },
      };

      // Render the Pi-hole card
      const result = renderPiHoleCard(
        deviceWithZeroPercentage,
        mockHass,
        mockConfig,
      );
      const el = await fixture(result);

      // Find the percentage stat box
      const percentageBox = el.querySelector('.percentage-box .stat-value');
      expect(percentageBox).to.exist;
      expect(percentageBox?.textContent?.trim()).to.equal('0.0%');
    });

    it('should handle missing percentage values', async () => {
      // Create a device without percentage
      const deviceWithoutPercentage = { ...mockDevice };
      deviceWithoutPercentage.ads_percentage_blocked_today = undefined;

      // Render the Pi-hole card
      const result = renderPiHoleCard(
        deviceWithoutPercentage,
        mockHass,
        mockConfig,
      );
      const el = await fixture(result);

      // Find the percentage stat box
      const percentageBox = el.querySelector('.percentage-box .stat-value');
      expect(percentageBox).to.exist;
      expect(percentageBox?.textContent?.trim()).to.equal('0%');
    });

    it('should display version information correctly', async () => {
      // Render the Pi-hole card
      const result = renderPiHoleCard(mockDevice, mockHass, mockConfig);
      const el = await fixture(result);

      // Find all version items
      const versionItems = el.querySelectorAll('.version-item');
      expect(versionItems.length).to.equal(4); // Core, FTL, Web, Integration

      // Check version labels and values
      const expectedVersions = [
        { label: 'Core', value: 'v5.14.2' },
        { label: 'FTL', value: 'v5.21' },
        { label: 'Web interface', value: 'v5.17' },
        { label: 'HA integration', value: 'v2.0.0' },
      ];

      for (let i = 0; i < versionItems.length; i++) {
        const item = versionItems[i];
        const label = item.querySelector('.version-label');
        const value = item.querySelector('a span');

        expect(label?.textContent).to.equal(expectedVersions[i].label);
        expect(value?.textContent).to.equal(expectedVersions[i].value);
      }
    });

    it('should handle different status states correctly', async () => {
      // Test with status off
      const offlineDevice = {
        ...mockDevice,
        status: {
          ...mockDevice.status!,
          state: 'off',
        },
      };

      // Render with offline status
      const offlineResult = renderPiHoleCard(
        offlineDevice,
        mockHass,
        mockConfig,
      );
      const offlineEl = await fixture(offlineResult);

      // Check for red status indicator
      const statusEl = offlineEl.querySelector('.status');
      expect(statusEl?.getAttribute('style')).to.contain(
        'var(--error-color, red)',
      );

      // Check for correct icon
      const iconEl = statusEl?.querySelector('ha-icon');
      expect(iconEl?.getAttribute('icon')).to.equal('mdi:close-circle');
    });
  });
};
