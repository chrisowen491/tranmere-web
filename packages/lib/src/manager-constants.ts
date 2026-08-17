export const MANAGER_FORMATIONS = ['442', '4-4-2', '4-3-3', '5-3-2', '3-4-2-1', '3-4-1-2', '3-4-3', '3-5-2', '4-2-3-1', '4-1-4-1', '4-4-1-1', '3-5-1-1', '2-3-4-1', '1-4-2-1-2'] as const;

export type ManagerFormation = (typeof MANAGER_FORMATIONS)[number];
