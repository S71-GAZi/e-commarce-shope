// Re-export MySQL queries and utilities as the single source of truth
export { executeQuery, executeQuerySingle, getMySQLPool } from "./mysql"
export * from "./queries"
