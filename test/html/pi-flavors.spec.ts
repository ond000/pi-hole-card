import type { PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { createCardActions } from '@html/pi-flavors';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-flavors.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let callServiceStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a mock HomeAssistant instance
      callServiceStub = stub();
      mockHass = {
        callService: callServiceStub,
        states: {
          'switch.pi_hole': {
            state: 'on',
            entity_id: 'switch.pi_hole',
          },
          'button.refresh_data': {
            state: 'off',
            entity_id: 'button.refresh_data',
          },
          'button.restart_dns': {
            state: 'off',
            entity_id: 'button.restart_dns',
          },
          'button.update_gravity': {
            state: 'off',
            entity_id: 'button.update_gravity',
          },
        },
      } as unknown as HomeAssistant;

      // Mock device
      mockDevice = {
        device_id: 'pi_hole_device',
        switch_pi_hole: {
          entity_id: 'switch.pi_hole',
          state: 'on',
          attributes: {},
          translation_key: undefined,
        },
        action_refresh_data: {
          entity_id: 'button.refresh_data',
          state: 'off',
          attributes: {},
          translation_key: undefined,
        },
        action_restartdns: {
          entity_id: 'button.restart_dns',
          state: 'off',
          attributes: {},
          translation_key: undefined,
        },
        action_gravity: {
          entity_id: 'button.update_gravity',
          state: 'off',
          attributes: {},
          translation_key: undefined,
        },
      } as PiHoleDevice;
    });

    afterEach(() => {
      callServiceStub.reset();
    });

    it('should render card actions with all buttons when all entities are available', async () => {
      const result = createCardActions(mockHass, mockDevice);
      const el = await fixture(result as TemplateResult);

      // Check that all buttons are rendered
      const buttons = el.querySelectorAll('mwc-button');
      expect(buttons.length).to.equal(4); // Enable/Disable + Refresh + Restart DNS + Update Gravity
    });

    it('should render warning when Pi-hole switch entity is not available', async () => {
      // Create a device without switch entity
      const incompleteDevice = {
        device_id: 'pi_hole_device',
        // No switch_pi_hole entity
      } as PiHoleDevice;

      const result = createCardActions(mockHass, incompleteDevice);
      const el = await fixture(result as TemplateResult);

      // Check for warning message
      const warning = el.querySelector('.warning');
      expect(warning).to.exist;
      expect(warning?.textContent).to.include(
        'Pi-hole switch entity not available',
      );
    });

    it('should not render optional buttons when entities are not available', async () => {
      // Create a device with only required entities
      const minimalDevice = {
        device_id: 'pi_hole_device',
        switch_pi_hole: {
          entity_id: 'switch.pi_hole',
          state: 'on',
          attributes: {},
          translation_key: undefined,
        },
        // No optional buttons
      } as PiHoleDevice;

      const result = createCardActions(mockHass, minimalDevice);
      const el = await fixture(result as TemplateResult);

      // Check that only the required toggle button is rendered
      const buttons = el.querySelectorAll('mwc-button');
      expect(buttons.length).to.equal(1);
    });
  });
};
