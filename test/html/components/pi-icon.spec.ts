import { icon } from '@html/components/pi-icon';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { PiHoleDevice, PiHoleSetup } from '@type/types';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('icon.ts', () => {
    let mockConfig: Config;
    let mockSetup: PiHoleSetup;

    beforeEach(() => {
      // Create basic mock config
      mockConfig = {
        device_id: 'pi_hole_device',
      };

      // Create basic mock setup with no info messages
      mockSetup = {
        holes: [
          {
            device_id: 'pi_hole_device_1',
            sensors: [],
            switches: [],
            controls: [],
            updates: [],
          } as PiHoleDevice,
        ],
      };
    });

    describe('when there are no info messages', () => {
      it('should render default pi-hole icon when no custom icon is configured', async () => {
        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Check that ha-icon element is rendered
        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });

      it('should render custom icon when configured', async () => {
        mockConfig.icon = 'mdi:custom-icon';

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Check that ha-icon element is rendered with custom icon
        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:custom-icon');
      });

      it('should render icon when info_message_count is undefined', async () => {
        // info_message_count is undefined by default in our mock
        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });

      it('should render icon when info_message_count state is "0"', async () => {
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '0',
          attributes: {},
          translation_key: 'info_message_count',
        };

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });
    });

    describe('when there are info messages', () => {
      it('should render warning badge for single device with info messages', async () => {
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '3',
          attributes: {},
          translation_key: 'info_message_count',
        };

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Check that warning badge is rendered
        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('warning-badge')).to.be.true;
        expect(el.textContent?.trim()).to.equal('3');
      });

      it('should sum info messages from multiple devices', async () => {
        // Add a second device to the setup
        const secondDevice: PiHoleDevice = {
          device_id: 'pi_hole_device_2',
          info_message_count: {
            entity_id: 'sensor.pi_hole_2_info_message_count',
            state: '2',
            attributes: {},
            translation_key: 'info_message_count',
          },
          sensors: [],
          switches: [],
          controls: [],
          updates: [],
        };

        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '5',
          attributes: {},
          translation_key: 'info_message_count',
        };

        mockSetup.holes.push(secondDevice);

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Check that warning badge shows the sum (5 + 2 = 7)
        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('warning-badge')).to.be.true;
        expect(el.textContent?.trim()).to.equal('7');
      });

      it('should handle mixed scenarios with some devices having info messages', async () => {
        // First device has info messages
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '4',
          attributes: {},
          translation_key: 'info_message_count',
        };

        // Second device has no info messages (undefined)
        const secondDevice: PiHoleDevice = {
          device_id: 'pi_hole_device_2',
          sensors: [],
          switches: [],
          controls: [],
          updates: [],
        };

        // Third device has zero info messages
        const thirdDevice: PiHoleDevice = {
          device_id: 'pi_hole_device_3',
          info_message_count: {
            entity_id: 'sensor.pi_hole_3_info_message_count',
            state: '0',
            attributes: {},
            translation_key: 'info_message_count',
          },
          sensors: [],
          switches: [],
          controls: [],
          updates: [],
        };

        mockSetup.holes.push(secondDevice, thirdDevice);

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Should show warning badge with count of 4 (4 + 0 + 0)
        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('warning-badge')).to.be.true;
        expect(el.textContent?.trim()).to.equal('4');
      });
    });

    describe('edge cases', () => {
      it('should handle non-numeric state values gracefully', async () => {
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: 'unavailable',
          attributes: {},
          translation_key: 'info_message_count',
        };

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Should render icon since NaN check will exclude this value
        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });

      it('should handle empty string state values', async () => {
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '',
          attributes: {},
          translation_key: 'info_message_count',
        };

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Should render icon since empty string converts to 0, but NaN check should handle it
        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });

      it('should handle floating point numbers correctly', async () => {
        mockSetup.holes[0]!.info_message_count = {
          entity_id: 'sensor.pi_hole_info_message_count',
          state: '2.5',
          attributes: {},
          translation_key: 'info_message_count',
        };

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Should render warning badge with the number (2.5 converts to 2.5)
        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('warning-badge')).to.be.true;
        expect(el.textContent?.trim()).to.equal('2.5');
      });

      it('should handle empty holes array', async () => {
        mockSetup.holes = [];

        const result = icon(mockConfig, mockSetup);
        const el = await fixture(result as TemplateResult);

        // Should render icon since no info messages to count
        expect(el.tagName.toLowerCase()).to.equal('ha-icon');
        expect(el.getAttribute('icon')).to.equal('mdi:pi-hole');
      });
    });
  });
};
