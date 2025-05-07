import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { renderPiHoleCard } from '@html/bake-pi';
import * as createVersionItemModule from '@html/components/version-item';
import * as piCrustModule from '@html/pi-crust';
import * as piFillingsModule from '@html/pi-fillings';
import * as piFlavorsModule from '@html/pi-flavors';
import * as piToppingsModule from '@html/pi-toppings';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('bake-pi.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockConfig: Config;
    let openStub: sinon.SinonStub;
    let createCardHeaderStub: sinon.SinonStub;
    let createDashboardStatsStub: sinon.SinonStub;
    let createAdditionalStatsStub: sinon.SinonStub;
    let createCardActionsStub: sinon.SinonStub;
    let createVersionItemStub: sinon.SinonStub;
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');

      // Create stubs for all imported functions
      openStub = stub(window, 'open');

      createCardHeaderStub = stub(piCrustModule, 'createCardHeader');
      createCardHeaderStub.returns(
        html`<div class="mocked-card-header">Mocked Card Header</div>`,
      );

      createDashboardStatsStub = stub(piFillingsModule, 'createDashboardStats');
      createDashboardStatsStub.returns(
        html`<div class="mocked-dashboard-stats">Mocked Dashboard Stats</div>`,
      );

      createAdditionalStatsStub = stub(
        piToppingsModule,
        'createAdditionalStats',
      );
      createAdditionalStatsStub.returns(
        html`<div class="mocked-additional-stats">
          Mocked Additional Stats
        </div>`,
      );

      createCardActionsStub = stub(piFlavorsModule, 'createCardActions');
      createCardActionsStub.returns(
        html`<div class="mocked-card-actions">Mocked Card Actions</div>`,
      );

      createVersionItemStub = stub(
        createVersionItemModule,
        'createVersionItem',
      );
      createVersionItemStub.returns(
        html`<div class="mocked-version-item">Version Item</div>`,
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

      // Mock device with updates array
      mockDevice = {
        device_id: 'pi_hole_device',
        updates: [
          {
            entity_id: 'update.pi_hole_core',
            state: 'off',
            translation_key: undefined,
            attributes: {
              friendly_name: 'Pi-hole Core Update',
              title: 'Core',
              installed_version: 'v5.14.2',
              release_url:
                'https://github.com/pi-hole/pi-hole/releases/tag/v5.14.2',
            },
          },
          {
            entity_id: 'update.pi_hole_ftl',
            state: 'off',
            translation_key: undefined,
            attributes: {
              friendly_name: 'Pi-hole FTL Update',
              title: 'FTL',
              installed_version: 'v5.21',
              release_url: 'https://github.com/pi-hole/FTL/releases/tag/v5.21',
            },
          },
          {
            entity_id: 'update.pi_hole_web',
            state: 'off',
            translation_key: undefined,
            attributes: {
              friendly_name: 'Pi-hole Web Update',
              title: 'Web Interface',
              installed_version: 'v5.17',
              release_url: 'https://github.com/pi-hole/web/releases/tag/v5.17',
            },
          },
          {
            entity_id: 'update.pi_hole_v6_integration',
            state: 'off',
            translation_key: undefined,
            attributes: {
              friendly_name: 'Pi-hole Integration Update',
              installed_version: 'v2.0.0',
              release_url:
                'https://github.com/bastgau/ha-pi-hole-v6/releases/tag/v2.0.0',
            },
          },
        ],
      } as PiHoleDevice;

      // Mock config
      mockConfig = {
        device_id: 'pi_hole_device',
        info: {
          tap_action: { action: 'more-info' },
        },
        stats: {
          tap_action: { action: 'none' },
        },
        controls: {
          tap_action: { action: 'toggle' },
        },
      };
    });

    afterEach(() => {
      // Restore all stubs
      openStub.restore();
      createCardHeaderStub.restore();
      createDashboardStatsStub.restore();
      createAdditionalStatsStub.restore();
      createCardActionsStub.restore();
      createVersionItemStub.restore();
    });

    it('should render a Pi-hole card with all main sections', async () => {
      // Render the Pi-hole card
      const result = renderPiHoleCard(
        element,
        mockDevice,
        mockHass,
        mockConfig,
      );
      const el = await fixture(result);

      // Test main sections exist
      expect(el.querySelector('.mocked-card-header')).to.exist;
      expect(el.querySelector('.card-content')).to.exist;
      expect(el.querySelector('.mocked-dashboard-stats')).to.exist;
      expect(el.querySelector('.mocked-additional-stats')).to.exist;
      expect(el.querySelector('.mocked-card-actions')).to.exist;
      expect(el.querySelector('.version-info')).to.exist;
    });

    it('should call createCardHeader with the correct parameters', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createCardHeader was called with the correct parameters
      expect(createCardHeaderStub.calledOnce).to.be.true;
      expect(createCardHeaderStub.firstCall.args[0]).to.equal(mockDevice);
      expect(createCardHeaderStub.firstCall.args[1]).to.equal(mockHass);
      expect(createCardHeaderStub.firstCall.args[2]).to.equal(mockConfig);
    });

    it('should call createDashboardStats with the correct parameters', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createDashboardStats was called with the correct parameters
      expect(createDashboardStatsStub.calledOnce).to.be.true;
      expect(createDashboardStatsStub.firstCall.args[0]).to.equal(element);
      expect(createDashboardStatsStub.firstCall.args[1]).to.equal(mockDevice);
      expect(createDashboardStatsStub.firstCall.args[2]).to.equal(mockConfig);
    });

    it('should call createAdditionalStats with the correct parameters', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createAdditionalStats was called with the correct parameters
      expect(createAdditionalStatsStub.calledOnce).to.be.true;
      expect(createAdditionalStatsStub.firstCall.args[0]).to.equal(element);
      expect(createAdditionalStatsStub.firstCall.args[1]).to.equal(mockDevice);
      expect(createAdditionalStatsStub.firstCall.args[2]).to.equal(
        mockConfig.info,
      );
    });

    it('should call createCardActions with the correct parameters', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createCardActions was called with the correct parameters
      expect(createCardActionsStub.calledOnce).to.be.true;
      expect(createCardActionsStub.firstCall.args[0]).to.equal(element);
      expect(createCardActionsStub.firstCall.args[1]).to.equal(mockDevice);
      expect(createCardActionsStub.firstCall.args[2]).to.equal(
        mockConfig.controls,
      );
    });

    it('should call createVersionItem for each update entity', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createVersionItem was called for each update entity
      expect(createVersionItemStub.callCount).to.equal(4); // One for each update entity

      // Verify calls for each update entity
      expect(createVersionItemStub.firstCall.args[0]).to.equal(
        mockDevice.updates[0],
      );
      expect(createVersionItemStub.secondCall.args[0]).to.equal(
        mockDevice.updates[1],
      );
      expect(createVersionItemStub.thirdCall.args[0]).to.equal(
        mockDevice.updates[2],
      );
      expect(createVersionItemStub.getCall(3).args[0]).to.equal(
        mockDevice.updates[3],
      );
    });

    it('should handle empty updates array gracefully', async () => {
      // Create a device with empty updates array
      const deviceWithEmptyUpdates = {
        ...mockDevice,
        updates: [],
      };

      // Render the Pi-hole card
      renderPiHoleCard(element, deviceWithEmptyUpdates, mockHass, mockConfig);

      // Verify createVersionItem was not called
      expect(createVersionItemStub.callCount).to.equal(0);
    });
  });
};
