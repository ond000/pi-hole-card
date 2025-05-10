import type { Config, PiHoleDevice } from '@/types';
import * as showSectionModule from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import * as createStatBoxModule from '@html/components/stat-box';
import { createDashboardStats } from '@html/pi-fillings';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { restore, stub } from 'sinon';

export default () => {
  describe('pi-fillings.ts', () => {
    let mockElement: HTMLElement;
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let mockConfig: Config;
    let createStatBoxStub: sinon.SinonStub;
    let showSectionStub: sinon.SinonStub;
    let localizeStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element
      mockElement = document.createElement('div');

      // Create mock HomeAssistant
      mockHass = {
        language: 'en',
      } as HomeAssistant;

      // Create stub for show function
      showSectionStub = stub(showSectionModule, 'show');
      showSectionStub.returns(true); // Default to showing sections

      // Create stub for localize
      localizeStub = stub(localizeModule, 'localize');
      localizeStub.callsFake((hass, key, search, replace) => {
        // If this is the active clients translation with replaceable parameter
        if (
          key === 'card.stats.active_clients' &&
          search === '{number}' &&
          replace
        ) {
          return `${replace} active clients`;
        }

        // Return a predictable translation for each key
        const translations: Record<string, string> = {
          'card.stats.total_queries': 'Total Queries',
          'card.stats.queries_blocked': 'Queries Blocked',
          'card.stats.list_blocked_queries': 'List Blocked Queries',
          'card.stats.percentage_blocked': 'Percentage Blocked',
          'card.stats.list_all_queries': 'List All Queries',
          'card.stats.domains_on_lists': 'Domains on Lists',
          'card.stats.manage_lists': 'Manage Lists',
        };

        return translations[key as string] || `Localized: ${key}`;
      });

      // Create stub for createStatBox
      createStatBoxStub = stub(createStatBoxModule, 'createStatBox');
      // Configure the stub to return a simple template with identifiable class
      createStatBoxStub.callsFake(
        (
          element,
          hass,
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
      restore();
    });

    it('should return nothing when show returns false for statistics section', async () => {
      // Configure show to return false for statistics section
      showSectionStub.withArgs(mockConfig, 'statistics').returns(false);

      // Call createDashboardStats with the new signature including hass
      const result = createDashboardStats(
        mockElement,
        mockHass,
        mockDevice,
        mockConfig,
      );

      // Assert that nothing is returned
      expect(result).to.equal(nothing);

      // Verify that createStatBox was not called
      expect(createStatBoxStub.called).to.be.false;
    });

    it('should render dashboard stats container with stat groups', async () => {
      // Ensure show returns true for statistics section
      showSectionStub.withArgs(mockConfig, 'statistics').returns(true);

      const result = createDashboardStats(
        mockElement,
        mockHass,
        mockDevice,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      // Check that the dashboard-stats container is rendered
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('dashboard-stats')).to.be.true;

      // Check that it contains two stat-group divs
      const statGroups = el.querySelectorAll('.stat-group');
      expect(statGroups.length).to.equal(2);
    });

    it('should call createStatBox with correct parameters for each stat', async () => {
      createDashboardStats(mockElement, mockHass, mockDevice, mockConfig);

      // Verify createStatBox was called 4 times (once for each stat box)
      expect(createStatBoxStub.callCount).to.equal(4);

      // Verify calls for each stat box with correct parameters

      // Total queries
      expect(createStatBoxStub.firstCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.firstCall.args[1]).to.equal(mockHass);
      expect(createStatBoxStub.firstCall.args[2]).to.equal(
        mockDevice.dns_queries_today,
      );
      expect(createStatBoxStub.firstCall.args[3]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.firstCall.args[4]).to.equal(
        'card.stats.total_queries',
      );
      // Verify that localize was called for the active clients footer
      expect(
        localizeStub.calledWith(
          mockHass,
          'card.stats.active_clients',
          '{number}',
          '42',
        ),
      ).to.be.true;
      expect(createStatBoxStub.firstCall.args[6]).to.equal('queries-box');
      expect(createStatBoxStub.firstCall.args[7]).to.equal('mdi:earth');

      // Queries Blocked
      expect(createStatBoxStub.secondCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.secondCall.args[1]).to.equal(mockHass);
      expect(createStatBoxStub.secondCall.args[2]).to.equal(
        mockDevice.ads_blocked_today,
      );
      expect(createStatBoxStub.secondCall.args[3]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.secondCall.args[4]).to.equal(
        'card.stats.queries_blocked',
      );
      expect(createStatBoxStub.secondCall.args[5]).to.equal(
        'card.stats.list_blocked_queries',
      );
      expect(createStatBoxStub.secondCall.args[6]).to.equal('blocked-box');
      expect(createStatBoxStub.secondCall.args[7]).to.equal(
        'mdi:hand-back-right',
      );

      // Percentage Blocked
      expect(createStatBoxStub.thirdCall.args[0]).to.equal(mockElement);
      expect(createStatBoxStub.thirdCall.args[1]).to.equal(mockHass);
      expect(createStatBoxStub.thirdCall.args[2]).to.equal(
        mockDevice.ads_percentage_blocked_today,
      );
      expect(createStatBoxStub.thirdCall.args[3]).to.equal(mockConfig.stats);
      expect(createStatBoxStub.thirdCall.args[4]).to.equal(
        'card.stats.percentage_blocked',
      );
      expect(createStatBoxStub.thirdCall.args[5]).to.equal(
        'card.stats.list_all_queries',
      );
      expect(createStatBoxStub.thirdCall.args[6]).to.equal('percentage-box');
      expect(createStatBoxStub.thirdCall.args[7]).to.equal('mdi:chart-pie');

      // Domains on Lists
      const fourthCall = createStatBoxStub.getCall(3);
      expect(fourthCall.args[0]).to.equal(mockElement);
      expect(fourthCall.args[1]).to.equal(mockHass);
      expect(fourthCall.args[2]).to.equal(mockDevice.domains_blocked);
      expect(fourthCall.args[3]).to.equal(mockConfig.stats);
      expect(fourthCall.args[4]).to.equal('card.stats.domains_on_lists');
      expect(fourthCall.args[5]).to.equal('card.stats.manage_lists');
      expect(fourthCall.args[6]).to.equal('domains-box');
      expect(fourthCall.args[7]).to.equal('mdi:format-list-bulleted');
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

      createDashboardStats(mockElement, mockHass, incompleteDevice, mockConfig);

      // Verify createStatBox was still called 4 times
      expect(createStatBoxStub.callCount).to.equal(4);

      // Check that undefined was passed for missing entities
      expect(createStatBoxStub.secondCall.args[2]).to.be.undefined; // ads_blocked_today
      expect(createStatBoxStub.thirdCall.args[2]).to.be.undefined; // ads_percentage_blocked_today
      expect(createStatBoxStub.getCall(3).args[2]).to.be.undefined; // domains_blocked

      // Check that the first call used the defined entity
      expect(createStatBoxStub.firstCall.args[2]).to.equal(
        incompleteDevice.dns_queries_today,
      );

      // Check that the active clients localization was called with '0'
      expect(
        localizeStub.calledWith(
          mockHass,
          'card.stats.active_clients',
          '{number}',
          '0',
        ),
      ).to.be.true;
    });

    it('should localize active clients text with client count', async () => {
      createDashboardStats(mockElement, mockHass, mockDevice, mockConfig);

      // Verify localize was called for active clients with correct parameters
      expect(
        localizeStub.calledWith(
          mockHass,
          'card.stats.active_clients',
          '{number}',
          '42',
        ),
      ).to.be.true;

      // Now test with a different number of clients
      const updatedDevice = {
        ...mockDevice,
        dns_unique_clients: {
          ...mockDevice.dns_unique_clients,
          state: '123',
        },
      } as any as PiHoleDevice;

      // Reset the stub call history
      localizeStub.resetHistory();

      createDashboardStats(mockElement, mockHass, updatedDevice, mockConfig);

      // Verify localize was called with the updated number
      expect(
        localizeStub.calledWith(
          mockHass,
          'card.stats.active_clients',
          '{number}',
          '123',
        ),
      ).to.be.true;
    });
  });
};
