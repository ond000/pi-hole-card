import type { EntityInformation, SectionConfig } from '@/types';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import { createActionButton } from '@html/pi-toppings';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pi-toppings.ts', () => {
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let mockElement: HTMLElement;
    let mockEntity: EntityInformation;
    let mockConfig: SectionConfig;

    beforeEach(() => {
      // Create stubs for action handler functions
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {}, // Mock the bind method
        handleAction: () => {}, // Add any other methods that might be called
      });

      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
        // @ts-ignore
      ).returns(() => {});

      // Mock HTML element
      mockElement = document.createElement('div');

      mockConfig = {
        tap_action: {
          action: 'toggle',
        },
      };

      // Create a mock entity for testing
      mockEntity = {
        entity_id: 'switch.test_switch',
        state: 'on',
        translation_key: undefined,
        attributes: {
          friendly_name: 'Test Switch',
        },
      };
    });

    afterEach(() => {
      // Restore all stubs
      actionHandlerStub.restore();
      handleClickActionStub.restore();
    });

    describe('createActionButton', () => {
      it('should return nothing when entity is undefined', async () => {
        const result = createActionButton(
          mockElement,
          mockConfig,
          undefined,
          'mdi:power',
          'Power',
          'primary',
        );

        // Check that nothing is returned when entity is undefined
        expect(result).to.equal(nothing);
      });

      it('should render a button with the provided icon and label', async () => {
        const result = createActionButton(
          mockElement,
          mockConfig,
          mockEntity,
          'mdi:power',
          'Power',
          'primary',
        );

        const el = await fixture(result as TemplateResult);

        // Check that a mwc-button element is rendered
        expect(el.tagName.toLowerCase()).to.equal('mwc-button');

        // Check that the button has the correct CSS class
        expect(el.classList.contains('primary')).to.be.true;

        // Check that the button contains an icon
        const icon = el.querySelector('ha-icon');
        expect(icon).to.exist;
        expect(icon?.getAttribute('icon')).to.equal('mdi:power');

        // Check that the button has the correct label text
        expect(el.textContent?.trim()).to.equal('Power');
      });

      it('should use default class when buttonClass is not provided', async () => {
        const result = createActionButton(
          mockElement,
          mockConfig,
          mockEntity,
          'mdi:power',
          'Power',
        );

        const el = await fixture(result as TemplateResult);

        // Check that the button has an empty class attribute
        expect(el.className).to.equal('');
      });

      it('should attach action handlers to the button', async () => {
        const result = createActionButton(
          mockElement,
          mockConfig,
          mockEntity,
          'mdi:power',
          'Power',
        );

        const el = await fixture(result as TemplateResult);

        // Check that actionHandler was called
        expect(actionHandlerStub.calledOnce).to.be.true;

        // Check that handleClickAction was called with the correct arguments
        expect(handleClickActionStub.calledOnce).to.be.true;
        expect(handleClickActionStub.firstCall.args[0]).to.equal(mockElement);
        expect(handleClickActionStub.firstCall.args[1]).to.equal(mockConfig);
        expect(handleClickActionStub.firstCall.args[2]).to.equal(mockEntity);

        // Verify action handler was attached to the button
        expect((el as any).actionHandler).to.exist;
      });
    });
  });
};
