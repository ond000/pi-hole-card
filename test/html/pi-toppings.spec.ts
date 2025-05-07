import type { PiHoleDevice, SectionConfig } from '@/types';
import * as createAdditionalStatModule from '@html/components/additional-stat';
import { createAdditionalStats } from '@html/pi-toppings';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-toppings.ts', () => {
    let mockDevice: PiHoleDevice;
    let mockElement: HTMLElement;
    let mockConfig: SectionConfig;
    let createAdditionalStatStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element
      mockElement = document.createElement('div');
      mockConfig = {
        tap_action: {
          action: 'more-info',
        },
      };

      // Create stub for createAdditionalStat
      createAdditionalStatStub = stub(
        createAdditionalStatModule,
        'createAdditionalStat',
      );
      // Configure the stub to return a simple div template
      createAdditionalStatStub.callsFake(
        (element, config, entity, icon, text) => {
          return html`<div
            class="mocked-additional-stat"
            data-icon="${icon}"
            data-text="${text}"
          >
            ${icon} - ${text}
          </div>`;
        },
      );

      // Mock device
      mockDevice = {
        device_id: 'pi_hole_device',
        seen_clients: {
          entity_id: 'sensor.seen_clients',
          state: '42',
          attributes: {},
          translation_key: 'seen_clients',
        },
        dns_unique_domains: {
          entity_id: 'sensor.dns_unique_domains',
          state: '1500',
          attributes: {},
          translation_key: 'dns_unique_domains',
        },
        dns_queries_cached: {
          entity_id: 'sensor.dns_queries_cached',
          state: '5000',
          attributes: {},
          translation_key: 'dns_queries_cached',
        },
        dns_queries_forwarded: {
          entity_id: 'sensor.dns_queries_forwarded',
          state: '7000',
          attributes: {},
          translation_key: 'dns_queries_forwarded',
        },
        dns_unique_clients: {
          entity_id: 'sensor.dns_unique_clients',
          state: '25',
          attributes: {},
          translation_key: 'dns_unique_clients',
        },
        remaining_until_blocking_mode: {
          entity_id: 'sensor.remaining_until_blocking_mode',
          state: '30',
          attributes: {},
          translation_key: 'remaining_until_blocking_mode',
        },
      } as PiHoleDevice;
    });

    afterEach(() => {
      createAdditionalStatStub.restore();
    });

    it('should call createAdditionalStat for each stat entity', async () => {
      const result = createAdditionalStats(mockElement, mockDevice, mockConfig);
      await fixture(result as TemplateResult);

      // Verify that createAdditionalStat was called for each entity
      expect(createAdditionalStatStub.callCount).to.equal(6); // One for each entity
    });

    it('should render correctly with all entities', async () => {
      const result = createAdditionalStats(mockElement, mockDevice, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check that the container is rendered
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('additional-stats')).to.be.true;

      // Should have 6 items (one for each stat)
      expect(el.querySelectorAll('.mocked-additional-stat').length).to.equal(6);
    });

    it('should format text correctly for each stat entity', async () => {
      const entities = [
        {
          entity: 'seen_clients',
          state: '42',
          icon: 'mdi:account-multiple',
          expectedText: '42 clients',
        },
        {
          entity: 'dns_unique_domains',
          state: '1500',
          icon: 'mdi:web',
          expectedText: '1500 unique domains',
        },
        {
          entity: 'dns_queries_cached',
          state: '5000',
          icon: 'mdi:server-network',
          expectedText: '5000 cached',
        },
        {
          entity: 'dns_queries_forwarded',
          state: '7000',
          icon: 'mdi:dns',
          expectedText: '7000 forwarded',
        },
        {
          entity: 'dns_unique_clients',
          state: '25',
          icon: 'mdi:account',
          expectedText: '25 unique clients',
        },
        {
          entity: 'remaining_until_blocking_mode',
          state: '30',
          icon: 'mdi:timer-outline',
          expectedText: '30 time remaining',
        },
      ];

      const result = createAdditionalStats(mockElement, mockDevice, mockConfig);
      const el = await fixture(result as TemplateResult);

      const stats = el.querySelectorAll('.mocked-additional-stat');

      // Check each stat's format
      entities.forEach((entity, index) => {
        const stat = stats[index];
        expect(stat.getAttribute('data-icon')).to.equal(entity.icon);
        expect(stat.getAttribute('data-text')).to.equal(entity.expectedText);
      });
    });

    it('should handle missing entities gracefully', async () => {
      // Create a device with only some entities
      const partialDevice = {
        device_id: 'pi_hole_device',
        seen_clients: {
          entity_id: 'sensor.seen_clients',
          state: '42',
          attributes: {},
          translation_key: 'seen_clients',
        },
        // No other entities
      } as PiHoleDevice;

      const result = createAdditionalStats(
        mockElement,
        partialDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      // All stats should still render, using default values
      expect(el.querySelectorAll('.mocked-additional-stat').length).to.equal(6);

      // Check that missing entities use "0" as the default value
      const stats = el.querySelectorAll('.mocked-additional-stat');

      // First stat should have real data
      expect(stats[0]!.getAttribute('data-text')).to.equal('42 clients');

      // Second stat should have default value
      expect(stats[1]!.getAttribute('data-text')).to.equal('0 unique domains');
    });
  });
};
