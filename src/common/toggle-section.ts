/**
 * Toggles the visibility of a section
 * @param e - The click event
 * @param selector - The CSS selector for the section to toggle
 */
export const toggleSection = (e: Event, selector: string) => {
  const icon = (e.currentTarget as HTMLElement).querySelector('.caret-icon');
  const section = (e.currentTarget as HTMLElement).parentElement?.querySelector(
    selector,
  );

  if (section) {
    const isHidden = section.classList.toggle('hidden');
    if (icon) {
      icon.setAttribute(
        'icon',
        isHidden ? 'mdi:chevron-right' : 'mdi:chevron-down',
      );
    }
  }
};
