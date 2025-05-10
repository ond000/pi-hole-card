/**
 * Translation keys for the application.
 */
export type TranslationKey =
  | 'card.stats.total_queries'
  | 'card.stats.active_clients'
  | 'card.stats.queries_blocked'
  | 'card.stats.list_blocked_queries'
  | 'card.stats.percentage_blocked'
  | 'card.stats.list_all_queries'
  | 'card.stats.domains_on_lists'
  | 'card.stats.manage_lists';

export interface Translation {
  /** The translation key */
  key: TranslationKey;

  /** The translation string */
  search: string;

  /** The string to replace the search string with */
  replace: string;
}
