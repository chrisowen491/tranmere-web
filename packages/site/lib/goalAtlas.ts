import {
  queryGoalAtlasPeriods,
  queryGoalAtlasRows,
  queryGoalAtlasSummary,
  queryGoalAtlasTypes,
  type GoalAtlasQueryOptions,
} from "@tranmere-web/lib/src/d1-queries";
import type {
  GoalAtlasBucketRow,
  GoalAtlasRow,
  GoalAtlasSummaryRow,
} from "@tranmere-web/lib/src/d1-types";
import { createSearchPage, type SearchPage } from "@/lib/searchPagination";

export interface GoalAtlasData {
  results: GoalAtlasRow[];
  summary: GoalAtlasSummaryRow;
  periods: GoalAtlasBucketRow[];
  goalTypes: GoalAtlasBucketRow[];
  pagination: SearchPage;
}

const emptySummary: GoalAtlasSummaryRow = {
  total: 0,
  minute_complete: 0,
  goal_type_complete: 0,
  foot_complete: 0,
  assist_type_complete: 0,
  distance_complete: 0,
  cross_side_complete: 0,
};

export async function searchGoalAtlas(
  db: D1Database,
  options: GoalAtlasQueryOptions,
  pagination: { cursor: number; limit: number },
): Promise<GoalAtlasData> {
  const queryOptions = {
    ...options,
    limit: pagination.limit + 1,
    offset: pagination.cursor,
  };
  const [rows, summary, periods, goalTypes] = await Promise.all([
    queryGoalAtlasRows(db, queryOptions),
    queryGoalAtlasSummary(db, options),
    queryGoalAtlasPeriods(db, options),
    queryGoalAtlasTypes(db, options),
  ]);
  const page = createSearchPage(rows, pagination);
  return {
    results: page.rows,
    summary: summary ?? emptySummary,
    periods,
    goalTypes,
    pagination: page.pagination,
  };
}
