export type D1Value = string | number | null;

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  all<T>(): Promise<D1Result<T>>;
  first<T>(): Promise<T | null>;
}

export interface D1DatabaseReader {
  prepare(query: string): D1PreparedStatement;
}

export function withLimit(
  sql: string,
  values: D1Value[],
  limit?: number,
  offset?: number
) {
  if (limit === undefined) return sql;
  values.push(limit);
  if (offset === undefined) return `${sql}\nLIMIT ?`;
  values.push(offset);
  return `${sql}\nLIMIT ? OFFSET ?`;
}

export async function all<T>(
  db: D1DatabaseReader,
  sql: string,
  values: D1Value[]
) {
  const statement = db.prepare(sql);
  return (values.length ? statement.bind(...values) : statement).all<T>();
}
