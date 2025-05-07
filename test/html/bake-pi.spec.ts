import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import * as createAdditionalStatModule from '@html/additional-stat';
import { renderPiHoleCard } from '@html/bake-pi';
import * as piCrustModule from '@html/pi-crust';
import * as piFlavorsModule from '@html/pi-flavors';
import * as createStatBoxModule from '@html/stat-box';
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
    let createCardActionsStub: sinon.SinonStub;
    let createAdditionalStatStub: sinon.SinonStub;
    let createStatBoxStub: sinon.SinonStub;
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

      createCardActionsStub = stub(piFlavorsModule, 'createCardActions');
      createCardActionsStub.returns(
        html`<div class="mocked-card-actions">Mocked Card Actions</div>`,
      );

      createAdditionalStatStub = stub(
        createAdditionalStatModule,
        'createAdditionalStat',
      );
      createAdditionalStatStub.returns(
        html`<div class="mocked-additional-stat">Additional Stat</div>`,
      );

      createStatBoxStub = stub(createStatBoxModule, 'createStatBox');
      createStatBoxStub.returns(
        html`<div class="mocked-stat-box">Stat Box</div>`,
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

      // Mock device
      mockDevice = {
        device_id: 'pi_hole_device',
        status: {
          entity_id: 'binary_sensor.pi_hole_status',
          state: 'on',
          attributes: { friendly_name: 'Pi-hole Status' },
          translation_key: undefined,
        },
        dns_queries_today: {
          entity_id: 'sensor.dns_queries_today',
          state: '12345',
          attributes: {},
          translation_key: 'dns_queries_today',
        },
        ads_blocked_today: {
          entity_id: 'sensor.ads_blocked_today',
          state: '5678',
          attributes: {},
          translation_key: 'ads_blocked_today',
        },
        ads_percentage_blocked_today: {
          entity_id: 'sensor.ads_percentage_blocked_today',
          state: '45.6',
          attributes: {},
          translation_key: 'ads_percentage_blocked_today',
        },
        domains_blocked: {
          entity_id: 'sensor.domains_blocked',
          state: '987654',
          attributes: {},
          translation_key: 'domains_blocked',
        },
        seen_clients: {
          entity_id: 'sensor.seen_clients',
          state: '42',
          attributes: {},
          translation_key: 'seen_clients',
        },
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
        url: 'http://pi.hole',
      };
    });

    afterEach(() => {
      // Restore all stubs
      openStub.restore();
      createCardHeaderStub.restore();
      createCardActionsStub.restore();
      createAdditionalStatStub.restore();
      createStatBoxStub.restore();
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
