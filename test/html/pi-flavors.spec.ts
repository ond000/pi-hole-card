import * as showSectionModule from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import * as actionControlModule from '@html/components/action-control';
import * as stateContentModule from '@html/components/state-content';
import { createCardActions } from '@html/pi-flavors';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { EntityInformation, PiHoleDevice } from '@type/types';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-flavors.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockElement: HTMLElement;
    let mockConfig: Config;
    let createActionButtonStub: sinon.SinonStub;
    let stateContentStub: sinon.SinonStub;
    let showSectionStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and hass
      mockElement = document.createElement('div');
      mockHass = {} as HomeAssistant;

      // Create stub for show function
      showSectionStub = stub(showSectionModule, 'show');
      showSectionStub.returns(true); // Default to showing sections

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

      // Mock config
      mockConfig = {
        device_id: 'pi_hole_device',
        controls: {
          tap_action: {
            action: 'more-info',
          },
        },
      };
    });

    afterEach(() => {
      createActionButtonStub.restore();
      stateContentStub.restore();
      showSectionStub.restore();
    });

    it('should return nothing when show returns false for controls section', async () => {
      // Configure show to return false for controls section
      showSectionStub.withArgs(mockConfig, 'controls').returns(false);

      // Call createCardActions
      const result = createCardActions(
        mockElement,
        mockHass,
        mockDevice,
        mockConfig,
      );

      // Assert that nothing is returned
      expect(result).to.equal(nothing);

      // Verify that helper functions were not called
      expect(createActionButtonStub.called).to.be.false;
      expect(stateContentStub.called).to.be.false;
    });

    it('should render separate divs for switches and actions', async () => {
      // Ensure show returns true for controls section
      showSectionStub.withArgs(mockConfig, 'controls').returns(true);

      const result = createCardActions(
        mockElement,
        mockHass,
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
      createCardActions(mockElement, mockHass, mockDevice, mockConfig);

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
      createCardActions(mockElement, mockHass, mockDevice, mockConfig);

      // Verify that createActionButton was called for each control
      expect(createActionButtonStub.callCount).to.equal(2);
      expect(createActionButtonStub.firstCall.args[0]).to.equal(mockElement);
      expect(createActionButtonStub.firstCall.args[1]).to.equal(
        mockConfig.controls,
      );
      expect(createActionButtonStub.firstCall.args[2]).to.equal(
        mockDevice.controls[0],
      );

      expect(createActionButtonStub.secondCall.args[0]).to.equal(mockElement);
      expect(createActionButtonStub.secondCall.args[1]).to.equal(
        mockConfig.controls,
      );
      expect(createActionButtonStub.secondCall.args[2]).to.equal(
        mockDevice.controls[1],
      );
    });

    it('should use default config when controls config is missing', async () => {
      // Remove controls config
      delete mockConfig.controls;

      createCardActions(mockElement, mockHass, mockDevice, mockConfig);

      // Verify that createActionButton was called with default config
      expect(createActionButtonStub.firstCall.args[1]).to.deep.equal({
        tap_action: {
          action: 'toggle',
        },
        hold_action: {
          action: 'more-info',
        },
        double_tap_action: {
          action: 'more-info',
        },
      });
    });

    it('should handle empty arrays gracefully', async () => {
      // Create a device with empty switches and controls arrays
      const emptyDevice = {
        device_id: 'pi_hole_device',
        switches: [],
        controls: [],
      } as any as PiHoleDevice;

      const result = createCardActions(
        mockElement,
        mockHass,
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
