import { css } from 'lit';

/**
 * Static CSS styles for the Device Card
 * Defines the grid layout and styling for all card elements
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

  /* Dashboard-style layout */
  /* Using container queries for card-based responsiveness */
  :host {
    container-type: inline-size;
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 12px;
    margin-bottom: 16px;
  }

  /* Use 4 columns when card is wide enough */
  @container (min-width: 600px) {
    .dashboard-stats {
      grid-template-columns: repeat(4, 1fr);
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
    background-color: #1e88e5; /* Muted blue */
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

  /* Additional stats styling */
  .additional-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
  }

  /* Use 4 columns when card is wide enough */
  @container (min-width: 600px) {
    .additional-stats {
      grid-template-columns: repeat(4, 1fr);
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
`;
