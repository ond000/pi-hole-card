import type { EntityInformation, PiHoleDevice, SectionConfig } from '@/types';
import type { HomeAssistant } from '@hass/types';
import * as actionControlModule from '@html/components/action-control';
import * as stateContentModule from '@html/components/state-content';
import { createCardActions } from '@html/pi-flavors';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-flavors.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockElement: HTMLElement;
    let mockConfig: SectionConfig;
    let createActionButtonStub: sinon.SinonStub;
    let stateContentStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and hass
      mockElement = document.createElement('div');
      mockHass = {} as HomeAssistant;

      mockConfig = {
        tap_action: {
          action: 'more-info',
        },
      };

      // Create stubs for helper functions
      createActionButtonStub = stub(actionControlModule, 'createActionButton');
      createActionButtonStub.returns(
        html`<mwc-button class="mocked-button"> Mocked Button </mwc-button>`,
      );

      stateContentStub = stub(stateContentModule, 'stateContent');
      stateContentStub.returns(
        html`<div class="mocked-state">Mocked State</div>`,
      );

      // Mock device with switches and controls
      const mockSwitch1: EntityInformation = {
        entity_id: 'switch.pi_hole',
        state: 'on',
        attributes: {},
        translation_key: undefined,
      };

      const mockSwitch2: EntityInformation = {
        entity_id: 'switch.pi_hole_group',
        state: 'off',
        attributes: {},
        translation_key: undefined,
      };

      const mockControl1: EntityInformation = {
        entity_id: 'button.refresh_data',
        state: 'off',
        attributes: {},
        translation_key: undefined,
      };

      const mockControl2: EntityInformation = {
        entity_id: 'button.restart_dns',
        state: 'off',
        attributes: {},
        translation_key: undefined,
      };

      mockDevice = {
        device_id: 'pi_hole_device',
        switches: [mockSwitch1, mockSwitch2],
        controls: [mockControl1, mockControl2],
      } as PiHoleDevice;
    });

    afterEach(() => {
      createActionButtonStub.restore();
      stateContentStub.restore();
    });

    it('should render separate divs for switches and actions', async () => {
      const result = createCardActions(
        mockHass,
        mockElement,
        mockDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      // Check container structure
      const switchesDiv = el.querySelector('.switches');
      const actionsDiv = el.querySelector('.actions');

      expect(switchesDiv).to.exist;
      expect(actionsDiv).to.exist;
    });

    it('should call stateContent for each switch entity', async () => {
      createCardActions(mockHass, mockElement, mockDevice, mockConfig);

      // Verify that stateContent was called for each switch
      expect(stateContentStub.callCount).to.equal(2);
      expect(stateContentStub.firstCall.args[0]).to.equal(mockHass);
      expect(stateContentStub.firstCall.args[1]).to.equal(
        mockDevice.switches[0],
      );
      expect(stateContentStub.secondCall.args[0]).to.equal(mockHass);
      expect(stateContentStub.secondCall.args[1]).to.equal(
        mockDevice.switches[1],
      );
    });

    it('should call createActionButton for each control entity', async () => {
      createCardActions(mockHass, mockElement, mockDevice, mockConfig);

      // Verify that createActionButton was called for each control
      expect(createActionButtonStub.callCount).to.equal(2);
      expect(createActionButtonStub.firstCall.args[0]).to.equal(mockElement);
      expect(createActionButtonStub.firstCall.args[1]).to.equal(mockConfig);
      expect(createActionButtonStub.firstCall.args[2]).to.equal(
        mockDevice.controls[0],
      );

      expect(createActionButtonStub.secondCall.args[0]).to.equal(mockElement);
      expect(createActionButtonStub.secondCall.args[1]).to.equal(mockConfig);
      expect(createActionButtonStub.secondCall.args[2]).to.equal(
        mockDevice.controls[1],
      );
    });

    it('should handle empty arrays gracefully', async () => {
      // Create a device with empty switches and controls arrays
      const emptyDevice = {
        device_id: 'pi_hole_device',
        switches: [],
        controls: [],
      } as any as PiHoleDevice;

      const result = createCardActions(
        mockHass,
        mockElement,
        emptyDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      // Should still render containers but with no content
      const switchesDiv = el.querySelector('.switches');
      const actionsDiv = el.querySelector('.actions');

      expect(switchesDiv).to.exist;
      expect(actionsDiv).to.exist;

      // Should not call the helper functions
      expect(stateContentStub.callCount).to.equal(0);
      expect(createActionButtonStub.callCount).to.equal(0);
    });
  });
};
