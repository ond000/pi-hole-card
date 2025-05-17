import { toggleSection } from '@common/toggle-section';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('toggle-section.ts', () => {
    // Test elements
    let mockParentElement: HTMLElement;
    let mockClickTarget: HTMLElement;
    let mockIcon: HTMLElement;
    let mockSection: HTMLElement;
    let mockEvent: Event;

    beforeEach(() => {
      // Create DOM elements for testing
      mockParentElement = document.createElement('div');
      mockClickTarget = document.createElement('div');
      mockIcon = document.createElement('ha-icon');
      mockSection = document.createElement('div');

      // Set up the DOM structure
      mockParentElement.appendChild(mockClickTarget);
      mockParentElement.appendChild(mockSection);
      mockClickTarget.appendChild(mockIcon);

      // Class to identify the icon
      mockIcon.classList.add('caret-icon');
      mockSection.classList.add('action');

      // Initial icon state
      mockIcon.setAttribute('icon', 'mdi:chevron-down');

      // Create a mock event with currentTarget pointing to our mock element
      mockEvent = {
        currentTarget: mockClickTarget,
      } as unknown as Event;

      // Set up parent relationship manually since we can't rely on actual DOM
      Object.defineProperty(mockClickTarget, 'parentElement', {
        get: () => mockParentElement,
      });
    });

    describe('toggleSection', () => {
      it('should toggle the hidden class on the section', () => {
        // Initial state - section is visible
        expect(mockSection.classList.contains('hidden')).to.be.false;

        // Call toggleSection to hide
        toggleSection(mockEvent, '.action');

        // Section should now be hidden
        expect(mockSection.classList.contains('hidden')).to.be.true;

        // Call toggleSection again to show
        toggleSection(mockEvent, '.action');

        // Section should now be visible again
        expect(mockSection.classList.contains('hidden')).to.be.false;
      });

      it('should update the icon when toggling visibility', () => {
        // Initial state - chevron down
        expect(mockIcon.getAttribute('icon')).to.equal('mdi:chevron-down');

        // Call toggleSection to hide (icon should change to right)
        toggleSection(mockEvent, '.action');

        // Icon should now be chevron right
        expect(mockIcon.getAttribute('icon')).to.equal('mdi:chevron-right');

        // Call toggleSection to show (icon should change to down)
        toggleSection(mockEvent, '.action');

        // Icon should now be chevron down again
        expect(mockIcon.getAttribute('icon')).to.equal('mdi:chevron-down');
      });

      it('should use the correct selector to find the section', () => {
        // Create a spy on querySelector
        const querySelectorStub = stub(mockParentElement, 'querySelector');
        querySelectorStub.returns(mockSection);

        // Call toggleSection with a specific selector
        toggleSection(mockEvent, '.custom-selector');

        // Verify querySelector was called with the correct selector
        expect(querySelectorStub.calledWith('.custom-selector')).to.be.true;

        // Restore the stub
        querySelectorStub.restore();
      });
    });
  });
};
