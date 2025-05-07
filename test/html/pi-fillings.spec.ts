import type { Config, PiHoleDevice } from '@/types';
import * as createStatBoxModule from '@html/components/stat-box';
import { createDashboardStats } from '@html/pi-fillings';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-fillings.ts', () => {
    let mockElement: HTMLElement;
    let mockDevice: PiHoleDevice;
    let mockConfig: Config;
    let createStatBoxStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element
      mockElement = document.createElement('div');

      // Create stub for createStatBox
      createStatBoxStub = stub(createStatBoxModule, 'createStatBox');
      // Configure the stub to return a simple template with identifiable class
      createStatBoxStub.callsFake(
        (
          element,
          entity,
          sectionConfig,
          title,
          footerText,
          boxClass,
          iconName,
        ) => {
          return html`<div class="mocked-stat-box ${boxClass}">
            <div class="title">${title}</div>
            <div class="footer">${footerText}</div>
          </div>`;
        },
      );

      // Mock device with required stats
      mockDevice = {
        device_id: 'pi_hole_device',
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
        dns_unique_clients: {
          entity_id: 'sensor.dns_unique_clients',
          state: '42',
          attributes: {},
          translation_key: 'dns_unique_clients',
        },
      } as PiHoleDevice;

      // Mock config
      mockConfig = {
        device_id: 'pi_hole_device',
        stats: {
          tap_action: { action: 'more-info' },
        },
      };
    });

    afterEach(() => {
      // Restore all stubs
      createStatBoxStub.restore();
    });

    it('should render dashboard stats container with stat groups', async () => {
      const result = createDashboardStats(mockElement, mockDevice, mockConfig);
      const el = await fixture(result as TemplateResult);

      // Check that the dashboard-stats container is rendered
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('dashboard-stats')).to.be.true;

      // Check that it contains two stat-group divs
      const statGroups = el.querySelectorAll('.stat-group');
      expect(statGroups.length).to.equal(2);
    });

    it('should call createStatBox with correct parameters for each stat', async () => {
      createDashboardStats(mockElement, mockDevice, mockConfig);

      // Verify createStatBox was called 4 times (once for each stat box)
      expect(createStatBoxStub.callCount).to.equal(4);

      // Verify calls for each stat box with correct parameters

      // Total queries
      expect(createStatBoxStub.firstCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.firstCall.args[1]).to.equal(
        mockDevice.dns_queries_today,
      );
      expect(createStatBoxStub.firstCall.args[2]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.firstCall.args[3]).to.equal('Total queries');
      expect(createStatBoxStub.firstCall.args[4]).to.equal('42 active clients');
      expect(createStatBoxStub.firstCall.args[5]).to.equal('queries-box');
      expect(createStatBoxStub.firstCall.args[6]).to.equal('mdi:earth');

      // Queries Blocked
      expect(createStatBoxStub.secondCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.secondCall.args[1]).to.equal(
        mockDevice.ads_blocked_today,
      );
      expect(createStatBoxStub.secondCall.args[2]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.secondCall.args[3]).to.equal('Queries Blocked');
      expect(createStatBoxStub.secondCall.args[4]).to.equal(
        'List blocked queries',
      );
      expect(createStatBoxStub.secondCall.args[5]).to.equal('blocked-box');
      expect(createStatBoxStub.secondCall.args[6]).to.equal(
        'mdi:hand-back-right',
      );

      // Percentage Blocked
      expect(createStatBoxStub.thirdCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.thirdCall.args[1]).to.equal(
        mockDevice.ads_percentage_blocked_today,
      );
      expect(createStatBoxStub.thirdCall.args[2]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.thirdCall.args[3]).to.equal(
        'Percentage Blocked',
      );
      expect(createStatBoxStub.thirdCall.args[4]).to.equal('List all queries');
      expect(createStatBoxStub.thirdCall.args[5]).to.equal('percentage-box');
      expect(createStatBoxStub.thirdCall.args[6]).to.equal('mdi:chart-pie');

      // Domains on Lists
      const fourthCall = createStatBoxStub.getCall(3);
      expect(fourthCall.args[0]).to.equal(mockElement);
      expect(fourthCall.args[1]).to.equal(mockDevice.domains_blocked);
      expect(fourthCall.args[2]).to.equal(mockConfig.stats);
      expect(fourthCall.args[3]).to.equal('Domains on Lists');
      expect(fourthCall.args[4]).to.equal('Manage lists');
      expect(fourthCall.args[5]).to.equal('domains-box');
      expect(fourthCall.args[6]).to.equal('mdi:format-list-bulleted');
    });

    it('should handle missing entity data', async () => {
      // Create a device with missing entity data
      const incompleteDevice = {
        device_id: 'pi_hole_device',
        // Only include dns_queries_today
        dns_queries_today: {
          entity_id: 'sensor.dns_queries_today',
          state: '12345',
          attributes: {},
          translation_key: 'dns_queries_today',
        },
      } as PiHoleDevice;

      createDashboardStats(mockElement, incompleteDevice, mockConfig);

      // Verify createStatBox was still called 4 times
      expect(createStatBoxStub.callCount).to.equal(4);

      // Check that undefined was passed for missing entities
      expect(createStatBoxStub.secondCall.args[1]).to.be.undefined; // ads_blocked_today
      expect(createStatBoxStub.thirdCall.args[1]).to.be.undefined; // ads_percentage_blocked_today
      expect(createStatBoxStub.getCall(3).args[1]).to.be.undefined; // domains_blocked

      // Check that the first call used the defined entity
      expect(createStatBoxStub.firstCall.args[1]).to.equal(
        incompleteDevice.dns_queries_today,
      );

      // Check that active clients shows '0' when missing
      expect(createStatBoxStub.firstCall.args[4]).to.equal('0 active clients');
    });
  });
};
