import type { PiHoleDevice, SectionConfig } from '@/types';
import { createCardActions } from '@html/pi-flavors';
import * as piToppingsModule from '@html/pi-toppings';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-flavors.ts', () => {
    let mockDevice: PiHoleDevice;
    let mockElement: HTMLElement;
    let mockConfig: SectionConfig;
    let createActionButtonStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element
      mockElement = document.createElement('div');
      mockConfig = {
        tap_action: {
          action: 'more-info',
        },
      };

      // Create stub for createActionButton
      createActionButtonStub = stub(piToppingsModule, 'createActionButton');
      // Configure the stub to return a simple button template
      createActionButtonStub.callsFake(
        (element, entity, icon, label, buttonClass) => {
          return html`<mwc-button class="mocked-button ${buttonClass || ''}">
            ${icon} - ${label}
          </mwc-button>`;
        },
      );

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
      createActionButtonStub.restore();
    });

    it('should call createActionButton with switch_pi_hole entity and appropriate parameters', async () => {
      const result = createCardActions(mockElement, mockDevice, mockConfig);
      await fixture(result as TemplateResult);

      // Verify that createActionButton was called for the switch entity
      expect(
        createActionButtonStub.calledWith(
          mockElement,
          mockConfig,
          mockDevice.switch_pi_hole,
          'mdi:pause',
          'Disable',
          'warning',
        ),
      ).to.be.true;
    });

    it('should render appropriate button labels and icons based on device state', async () => {
      // Change device state to off
      mockDevice.switch_pi_hole!.state = 'off';

      const result = createCardActions(mockElement, mockDevice, mockConfig);
      await fixture(result as TemplateResult);

      // Verify that createActionButton was called with the correct parameters for "off" state
      expect(
        createActionButtonStub.calledWith(
          mockElement,
          mockConfig,
          mockDevice.switch_pi_hole,
          'mdi:play',
          'Enable',
          'primary',
        ),
      ).to.be.true;
    });

    it('should call createActionButton for all available action entities', async () => {
      const result = createCardActions(mockElement, mockDevice, mockConfig);
      await fixture(result as TemplateResult);

      // Verify that createActionButton was called for each entity
      expect(createActionButtonStub.callCount).to.equal(4); // One for each entity

      // Verify calls for optional action buttons
      expect(
        createActionButtonStub.calledWith(
          mockElement,
          mockConfig,
          mockDevice.action_refresh_data,
          'mdi:refresh',
          'Refresh',
          '',
        ),
      ).to.be.true;

      expect(
        createActionButtonStub.calledWith(
          mockElement,
          mockConfig,
          mockDevice.action_restartdns,
          'mdi:restart',
          'Restart DNS',
          '',
        ),
      ).to.be.true;

      expect(
        createActionButtonStub.calledWith(
          mockElement,
          mockConfig,
          mockDevice.action_gravity,
          'mdi:earth',
          'Update Gravity',
          '',
        ),
      ).to.be.true;
    });

    it('should not call createActionButton for missing action entities', async () => {
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

      const result = createCardActions(mockElement, minimalDevice, mockConfig);
      await fixture(result as TemplateResult);

      // Verify that createActionButton was called only once (for the switch)
      expect(createActionButtonStub.callCount).to.equal(1);
    });

    it('should render a div with class card-actions', async () => {
      const result = createCardActions(mockElement, mockDevice, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check that the card-actions container is rendered
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('card-actions')).to.be.true;
    });
  });
};
