import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import * as stateDisplayModule from '@html/components/state-display';
import { createCardHeader } from '@html/pi-crust';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-crust.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockConfig: Config;
    let stateDisplayStub: sinon.SinonStub;

    beforeEach(() => {
      // Create stub for stateDisplay
      stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');
      stateDisplayStub.returns(
        html`<div class="mocked-state-display">On</div>`,
      );

      // Mock HomeAssistant instance
      mockHass = {
        states: {
          'binary_sensor.pi_hole_status': {
            state: 'on',
            entity_id: 'binary_sensor.pi_hole_status',
            attributes: {
              friendly_name: 'Pi-hole Status',
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
      } as any as PiHoleDevice;

      // Default mock config
      mockConfig = {
        device_id: 'pi_hole_device',
      };
    });

    afterEach(() => {
      // Restore all stubs
      stateDisplayStub.restore();
    });

    it('should render card header with default title and icon', async () => {
      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Test header exists
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('card-header')).to.be.true;

      // Check default title
      const nameEl = el.querySelector('.name');
      expect(nameEl?.textContent?.trim()).to.equal('Pi-Hole');

      // Check default icon
      const iconEl = nameEl?.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal('mdi:pi-hole');
    });

    it('should render card header with custom title and icon', async () => {
      // Set custom title and icon in config
      mockConfig.title = 'My Custom Pi-hole';
      mockConfig.icon = 'mdi:custom-icon';

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check custom title
      const nameEl = el.querySelector('.name');
      expect(nameEl?.textContent?.trim()).to.equal('My Custom Pi-hole');

      // Check custom icon
      const iconEl = nameEl?.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal('mdi:custom-icon');
    });

    it('should display green status when Pi-hole is active', async () => {
      // Ensure status is 'on'
      mockDevice.status!.state = 'on';

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check status color is green
      const statusEl = el.querySelector('.status');
      expect(statusEl?.getAttribute('style')).to.contain(
        'var(--success-color, green)',
      );

      // Check for correct icon
      const iconEl = statusEl?.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal('mdi:check-circle');
    });

    it('should display red status when Pi-hole is inactive', async () => {
      // Set status to 'off'
      mockDevice.status!.state = 'off';

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check status color is red
      const statusEl = el.querySelector('.status');
      expect(statusEl?.getAttribute('style')).to.contain(
        'var(--error-color, red)',
      );

      // Check for correct icon
      const iconEl = statusEl?.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal('mdi:close-circle');
    });

    it('should call stateDisplay with the status entity', async () => {
      // Render the card header
      createCardHeader(mockDevice, mockHass, mockConfig);

      // Verify stateDisplay was called with the correct parameters
      expect(stateDisplayStub.calledWith(mockHass, mockDevice.status)).to.be
        .true;
    });

    it('should display remaining time when Pi-hole is inactive and remaining time exists', async () => {
      // Set status to 'off' and add remaining time
      mockDevice.status!.state = 'off';
      mockDevice.remaining_until_blocking_mode = {
        entity_id: 'sensor.pi_hole_remaining_until_blocking_mode',
        state: '300', // 5 minutes
        attributes: { friendly_name: 'Remaining Time' },
        translation_key: 'remaining_until_blocking_mode',
      };

      // Configure mock response for remaining time
      stateDisplayStub
        .withArgs(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        )
        .returns(html`<div class="mocked-remaining-time">5 minutes</div>`);

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Verify stateDisplay was called for both status and remaining time
      expect(stateDisplayStub.calledWith(mockHass, mockDevice.status)).to.be
        .true;
      expect(
        stateDisplayStub.calledWith(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        ),
      ).to.be.true;

      // Check that remaining time is rendered
      const remainingTimeEl = el.querySelector('.mocked-remaining-time');
      expect(remainingTimeEl).to.exist;
      expect(remainingTimeEl?.textContent).to.equal('5 minutes');
    });

    it('should not display remaining time when Pi-hole is active', async () => {
      // Set status to 'on' and add remaining time
      mockDevice.status!.state = 'on';
      mockDevice.remaining_until_blocking_mode = {
        entity_id: 'sensor.pi_hole_remaining_until_blocking_mode',
        state: '300', // 5 minutes
        attributes: { friendly_name: 'Remaining Time' },
        translation_key: 'remaining_until_blocking_mode',
      };

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      await fixture(result as TemplateResult);

      // Verify stateDisplay was called for status but not for remaining time
      expect(stateDisplayStub.calledWith(mockHass, mockDevice.status)).to.be
        .true;
      expect(
        stateDisplayStub.calledWith(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        ),
      ).to.be.false;
    });

    it('should not display remaining time when value is 0', async () => {
      // Set status to 'off' and add remaining time with value 0
      mockDevice.status!.state = 'off';
      mockDevice.remaining_until_blocking_mode = {
        entity_id: 'sensor.pi_hole_remaining_until_blocking_mode',
        state: '0',
        attributes: { friendly_name: 'Remaining Time' },
        translation_key: 'remaining_until_blocking_mode',
      };

      // Render the card header
      const result = createCardHeader(mockDevice, mockHass, mockConfig);
      await fixture(result as TemplateResult);

      // Verify stateDisplay was called for status but not for remaining time
      expect(stateDisplayStub.calledWith(mockHass, mockDevice.status)).to.be
        .true;
      expect(
        stateDisplayStub.calledWith(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        ),
      ).to.be.false;
    });

    it('should not display remaining time when value is unavailable or unknown', async () => {
      // Test with 'unavailable' state
      mockDevice.status!.state = 'off';
      mockDevice.remaining_until_blocking_mode = {
        entity_id: 'sensor.pi_hole_remaining_until_blocking_mode',
        state: 'unavailable',
        attributes: { friendly_name: 'Remaining Time' },
        translation_key: 'remaining_until_blocking_mode',
      };

      let result = createCardHeader(mockDevice, mockHass, mockConfig);
      await fixture(result as TemplateResult);

      expect(
        stateDisplayStub.calledWith(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        ),
      ).to.be.false;

      // Reset stub call history
      stateDisplayStub.resetHistory();

      // Test with 'unknown' state
      mockDevice.remaining_until_blocking_mode.state = 'unknown';
      result = createCardHeader(mockDevice, mockHass, mockConfig);
      await fixture(result as TemplateResult);

      expect(
        stateDisplayStub.calledWith(
          mockHass,
          mockDevice.remaining_until_blocking_mode,
          'remaining-time',
        ),
      ).to.be.false;
    });
  });
};
