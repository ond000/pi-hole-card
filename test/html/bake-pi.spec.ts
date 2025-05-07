import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { renderPiHoleCard } from '@html/bake-pi';
import * as piCrustModule from '@html/pi-crust';
import * as piFillingsModule from '@html/pi-fillings';
import * as piFlavorsModule from '@html/pi-flavors';
import * as piToppingsModule from '@html/pi-toppings';
import * as createVersionItemModule from '@html/version-item';
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

      // Mock device - now we only need minimal data for the main test
      mockDevice = {
        device_id: 'pi_hole_device',
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

    it('should call createVersionItem for all version entities', async () => {
      // Render the Pi-hole card
      renderPiHoleCard(element, mockDevice, mockHass, mockConfig);

      // Verify createVersionItem was called the correct number of times
      expect(createVersionItemStub.callCount).to.equal(4); // Core, FTL, Web, Integration

      // Verify specific calls
      expect(
        createVersionItemStub.calledWith(
          'Core',
          mockDevice.core_update_available?.attributes?.installed_version,
          'pi-hole/pi-hole',
        ),
      ).to.be.true;

      expect(
        createVersionItemStub.calledWith(
          'FTL',
          mockDevice.ftl_update_available?.attributes?.installed_version,
          'pi-hole/FTL',
        ),
      ).to.be.true;

      expect(
        createVersionItemStub.calledWith(
          'Web interface',
          mockDevice.web_update_available?.attributes?.installed_version,
          'pi-hole/web',
        ),
      ).to.be.true;

      expect(
        createVersionItemStub.calledWith(
          'HA integration',
          mockDevice.integration_update_available?.attributes
            ?.installed_version,
          'bastgau/ha-pi-hole-v6',
        ),
      ).to.be.true;
    });
  });
};
