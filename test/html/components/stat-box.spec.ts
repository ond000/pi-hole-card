import type { EntityInformation, SectionConfig } from '@/types';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as formatNumberModule from '@hass/common/number/format_number';
import type { HomeAssistant } from '@hass/types';
import { createStatBox } from '@html/components/stat-box';
import * as localizeModule from '@localize/localize';
import type { TranslationKey } from '@localize/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { restore, stub } from 'sinon';

export default () => {
  describe('stat-box.ts', () => {
    let mockElement: HTMLElement;
    let mockHass: HomeAssistant;
    let mockEntity: EntityInformation;
    let mockSectionConfig: SectionConfig;
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let formatNumberStub: sinon.SinonStub;
    let localizeStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and configs
      mockElement = document.createElement('div');
      mockHass = {
        language: 'en',
      } as HomeAssistant;
      mockSectionConfig = {
        tap_action: { action: 'more-info' },
        hold_action: { action: 'toggle' },
      };
      mockEntity = {
        entity_id: 'sensor.test_entity',
        state: '123',
        attributes: { friendly_name: 'Test Entity' },
        translation_key: 'test_key',
      };

      // Create stubs for action handlers
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns(
        {},
      );
      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: () => {},
      });

      // Create stub for formatNumber
      formatNumberStub = stub(formatNumberModule, 'formatNumber');
      formatNumberStub.callsFake((value) => {
        // Simple mock implementation for test cases
        if (value === '1234') return '1,234';
        if (value === '1234.56') return '1,234.6';
        if (value === '0.123') return '0.1';
        if (value === '1000000') return '1,000,000';
        return value; // Default return the input value
      });

      // Create stub for localize
      localizeStub = stub(localizeModule, 'localize');
      localizeStub.callsFake((hass, key, search, replace) => {
        // Simple mock implementation - return a predictable string based on key
        if (key === 'card.stats.total_queries') return 'Total Queries';
        if (key === 'card.stats.active_clients') return 'Active Clients';
        if (key === 'card.stats.list_blocked_queries')
          return 'List Blocked Queries';
        // For footer texts
        if (key === 'card.stats.manage_lists') return 'Manage Lists';

        // Default fallback for other keys
        return `Localized: ${key}`;
      });
    });

    afterEach(() => {
      // Restore all stubs
      restore();
    });

    it('should handle string footer text without translation', async () => {
      // Create test data with a direct string for footer (not a translation key)
      const title: TranslationKey = 'card.stats.total_queries';
      const footerText = 'Direct string footer'; // Not a TranslationKey
      const boxClass = 'test-box';
      const iconName = 'mdi:test-icon';

      // Call createStatBox function
      const result = createStatBox(
        mockElement,
        mockHass,
        mockEntity,
        mockSectionConfig,
        title,
        footerText,
        boxClass,
        iconName,
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Title should be localized
      expect(localizeStub.calledWith(mockHass, title)).to.be.true;

      // Footer text should NOT be passed to localize since it's a direct string
      expect(localizeStub.calledWith(mockHass, footerText)).to.be.false;

      // Footer section should have the direct string
      const footerEl = el.querySelector('.stat-footer span');
      expect(footerEl).to.exist;
      expect(footerEl?.textContent?.trim()).to.equal(footerText);
    });

    it('should handle missing entity data', async () => {
      const title: TranslationKey = 'card.stats.total_queries';
      const footerText: TranslationKey = 'card.stats.manage_lists';

      const result = createStatBox(
        mockElement,
        mockHass,
        undefined,
        mockSectionConfig,
        title,
        footerText,
        'class',
        'mdi:icon',
      );

      expect(result).to.equal(nothing);
    });

    it('should format numeric values properly', async () => {
      const title: TranslationKey = 'card.stats.total_queries';
      const footerText: TranslationKey = 'card.stats.manage_lists';

      // Test with various numeric values
      const testCases = [
        { state: '1234', expected: '1,234' },
        { state: '1234.56', expected: '1,234.6' },
        { state: '0.123', expected: '0.1' },
        { state: '1000000', expected: '1,000,000' },
      ];

      for (const testCase of testCases) {
        // Create entity with test state
        const entity = {
          ...mockEntity,
          state: testCase.state,
        };

        const result = createStatBox(
          mockElement,
          mockHass,
          entity,
          mockSectionConfig,
          title,
          footerText,
          'class',
          'mdi:icon',
        );

        // Render the template
        const el = await fixture(result as TemplateResult);

        // Check that the value is properly formatted
        const valueEl = el.querySelector('.stat-value');
        expect(valueEl?.textContent?.trim()).to.equal(testCase.expected);
      }
    });

    it('should handle missing section config', async () => {
      const title: TranslationKey = 'card.stats.total_queries';
      const footerText: TranslationKey = 'card.stats.manage_lists';

      // Call with undefined section config
      const result = createStatBox(
        mockElement,
        mockHass,
        mockEntity,
        undefined,
        title,
        footerText,
        'class',
        'mdi:icon',
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Should still render, but action handlers should be called with undefined
      expect(actionHandlerStub.calledWith(undefined)).to.be.true;
      expect(
        handleClickActionStub.calledWith(mockElement, undefined, mockEntity),
      ).to.be.true;
    });

    it('should add percentage symbol when unit_of_measurement is %', async () => {
      const title: TranslationKey = 'card.stats.percentage_blocked';
      const footerText: TranslationKey = 'card.stats.list_all_queries';

      // Create entity with percent unit
      const percentEntity = {
        ...mockEntity,
        state: '45.6',
        attributes: {
          ...mockEntity.attributes,
          unit_of_measurement: '%',
        },
      };

      const result = createStatBox(
        mockElement,
        mockHass,
        percentEntity,
        mockSectionConfig,
        title,
        footerText,
        'percentage-box',
        'mdi:chart-pie',
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Check that the value includes the percentage symbol
      const valueEl = el.querySelector('.stat-value');
      expect(valueEl).to.exist;
      expect(valueEl?.textContent?.trim()).to.equal('45.6%');
    });
  });
};
