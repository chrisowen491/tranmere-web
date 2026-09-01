/**
 * Compatibility barrel for shared D1 reads.
 *
 * Query implementations live in domain modules so callers can keep importing
 * from `@tranmere-web/lib/src/d1-queries` without depending on that layout.
 */
export * from './d1-queries/catalogue';
export * from './d1-queries/archive-completeness';
export * from './d1-queries/attendance';
export * from './d1-queries/matches';
export * from './d1-queries/player-statistics';
export * from './d1-queries/goal-atlas';
export * from './d1-queries/search';
export type { D1DatabaseReader } from './d1-queries/shared';
