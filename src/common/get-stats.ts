import type { DashboardStatConfig } from '@type/config';

/**
 * Creates the dashboard stats configuration
 * @param uniqueClientsCount - The number of unique clients
 * @returns The dashboard stats configuration
 */
export const getDashboardStats = (
  uniqueClientsCount: string,
): DashboardStatConfig[][] => [
  [
    {
      sensorKey: 'dns_queries_today',
      title: 'card.stats.total_queries',
      footer: {
        key: 'card.stats.active_clients',
        search: '{number}',
        replace: uniqueClientsCount,
      },
      className: 'queries-box',
      icon: 'mdi:earth',
    },
    {
      sensorKey: 'ads_blocked_today',
      title: 'card.stats.queries_blocked',
      footer: 'card.stats.list_blocked_queries',
      className: 'blocked-box',
      icon: 'mdi:hand-back-right',
    },
  ],
  [
    {
      sensorKey: 'ads_percentage_blocked_today',
      title: 'card.stats.percentage_blocked',
      footer: 'card.stats.list_all_queries',
      className: 'percentage-box',
      icon: 'mdi:chart-pie',
    },
    {
      sensorKey: 'domains_blocked',
      title: 'card.stats.domains_on_lists',
      footer: 'card.stats.manage_lists',
      className: 'domains-box',
      icon: 'mdi:format-list-bulleted',
    },
  ],
];
