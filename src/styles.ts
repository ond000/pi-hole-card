import { css } from 'lit';

/**
 * Static CSS styles for the Pi-hole Card
 * Modified to support grouped pairs of elements
 */
export const styles = css`
  ha-card {
    padding: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;
  }

  .name {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .name ha-icon {
    margin-right: 8px;
  }

  .status {
    display: flex;
    align-items: center;
    font-weight: 500;
  }

  .status ha-icon {
    margin-right: 4px;
  }

  .card-content {
    padding: 16px;
  }

  /* Dashboard-style layout with grouped stat boxes */
  .dashboard-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  /* Stat groups - will appear side by side on larger screens */
  .stat-group {
    display: flex;
    gap: 12px;
    flex: 1;
  }

  /* On smaller screens, groups stack but pairs stay together */
  @media (min-width: 900px) {
    .dashboard-stats {
      flex-direction: row;
    }
  }

  .stat-box {
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    color: white;
    cursor: pointer;
    transition: transform 0.2s;
    min-height: 120px;
    min-width: 120px;
    flex: 1;
  }

  .stat-box:hover {
    transform: scale(1.02);
  }

  .stat-header {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin: auto 0;
  }

  .stat-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 0.8rem;
  }

  /* Dashboard boxes - muted versions of Pi-hole colors */
  .queries-box {
    background-color: rgba(0, 115, 179, 0.85); /* Muted Pi-hole blue */
  }

  .blocked-box {
    background-color: rgba(196, 60, 60, 0.85); /* Muted Pi-hole red */
  }

  .percentage-box {
    background-color: rgba(249, 177, 57, 0.85); /* Muted Pi-hole amber/orange */
  }

  .domains-box {
    background-color: rgba(38, 164, 43, 0.85); /* Muted Pi-hole green */
  }

  /* Additional stats styling - specialized responsive grid */
  .additional-stats {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
    justify-content: center;
    /* Start with 1 column at small widths */
    grid-template-columns: minmax(120px, 1fr);
  }

  /* Switch to 2 columns at slightly wider screens */
  @media (min-width: 480px) {
    .additional-stats {
      grid-template-columns: repeat(2, minmax(120px, 1fr));
    }
  }

  /* Medium screens - 3 columns */
  @media (min-width: 600px) {
    .additional-stats {
      grid-template-columns: repeat(3, minmax(120px, 170px));
    }
  }

  /* Wide screens - 6 columns */
  @media (min-width: 1100px) {
    .additional-stats {
      grid-template-columns: repeat(6, minmax(120px, 160px));
    }
  }

  .additional-stat {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--secondary-text-color);
    background-color: var(--card-background-color, #f0f0f0);
    padding: 8px;
    border-radius: 4px;
    min-width: 120px;
    /* Allow text to wrap if needed */
    white-space: normal;
    overflow: hidden;
  }

  .additional-stat ha-icon {
    margin-right: 8px;
    color: var(--secondary-text-color);
  }

  .card-actions {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding: 0 8px 8px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  mwc-button {
    margin: 4px;
  }

  mwc-button.primary {
    --mdc-theme-primary: var(--success-color);
  }

  mwc-button.warning {
    --mdc-theme-primary: var(--warning-color);
  }

  /* Version information styles */
  .version-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 8px 16px 16px;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background-color: var(--card-background-color);
    margin-top: 8px;
    gap: 12px;
  }

  .version-item {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .version-label {
    margin-right: 4px;
  }

  .version-value {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* Very small screen adjustments */
  @media (max-width: 400px) {
    .stat-group {
      flex-direction: column;
    }
  }
`;
