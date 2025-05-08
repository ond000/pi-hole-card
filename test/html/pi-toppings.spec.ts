import type { PiHoleDevice, SectionConfig } from '@/types';
import type { HomeAssistant } from '@hass/types';
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
    let mockHass: HomeAssistant;
    let mockConfig: SectionConfig;
    let createAdditionalStatStub: sinon.SinonStub;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockHass = {} as HomeAssistant;
      mockConfig = {
        tap_action: { action: 'more-info' },
      };

      // Create stub for createAdditionalStat
      createAdditionalStatStub = stub(
        createAdditionalStatModule,
        'createAdditionalStat',
      );

      // Mock return value with minimal data for testing
      createAdditionalStatStub.callsFake((hass, element, config, sensor) => {
        return html`<div class="mocked-additional-stat">
          ${sensor.entity_id}
        </div>`;
      });

      // Create mock device with minimal sensors array
      const createSensor = (entity_id: string) => ({
        entity_id,
        state: '42',
        attributes: {},
        translation_key: 'test_key',
      });

      mockDevice = {
        device_id: 'pi_hole_device',
        sensors: [
          createSensor('sensor.seen_clients'),
          createSensor('sensor.dns_unique_domains'),
          createSensor('sensor.dns_queries_cached'),
        ],
      } as PiHoleDevice;
    });

    afterEach(() => {
      createAdditionalStatStub.restore();
    });

    it('should call createAdditionalStat for each sensor in the device', async () => {
      const result = createAdditionalStats(
        mockHass,
        mockElement,
        mockDevice,
        mockConfig,
      );
      await fixture(result as TemplateResult);

      expect(createAdditionalStatStub.callCount).to.equal(
        mockDevice.sensors.length,
      );

      // Verify each sensor was passed correctly
      mockDevice.sensors.forEach((sensor, index) => {
        const call = createAdditionalStatStub.getCall(index);
        expect(call.args[0]).to.equal(mockHass);
        expect(call.args[1]).to.equal(mockElement);
        expect(call.args[2]).to.equal(mockConfig);
        expect(call.args[3]).to.equal(sensor);
      });
    });

    it('should render container with all sensor items', async () => {
      const result = createAdditionalStats(
        mockHass,
        mockElement,
        mockDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('additional-stats')).to.be.true;
      expect(el.querySelectorAll('.mocked-additional-stat').length).to.equal(3);
    });

    it('should handle empty sensors array', async () => {
      mockDevice.sensors = [];

      const result = createAdditionalStats(
        mockHass,
        mockElement,
        mockDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      expect(createAdditionalStatStub.callCount).to.equal(0);
      expect(el.querySelectorAll('.mocked-additional-stat').length).to.equal(0);
    });

    it('should use default empty config when none provided', async () => {
      const result = createAdditionalStats(mockHass, mockElement, mockDevice);
      await fixture(result as TemplateResult);

      expect(createAdditionalStatStub.firstCall.args[2]).to.deep.equal({});
    });
  });
};
