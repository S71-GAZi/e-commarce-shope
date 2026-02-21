import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    const config = {
      host: "sql.freedb.tech",
      port: 3306,
      user: "freedb_dbroot1",
      password: "k5CEfrR?Mns6BuU",
      database: "freedb_eCom_Db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    // const config = {
    //   host: "localhost",
    //   port: 3306,
    //   user: "tayeenfa_eCom_DbUser",
    //   password: "Root123@eComDb2026?Mns6BuU",
    //   database: "tayeenfa_eCom_Db",
    //   waitForConnections: true,
    //   connectionLimit: 10,
    //   queueLimit: 0,
    // }
    pool = mysql.createPool(config)
  }

  return pool
}

export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  const connection = await getMySQLPool().getConnection()
  try {
    const [rows] = await connection.execute(query, params || [])
    return rows as T[]
  } finally {
    connection.release()
  }
}

export async function executeQuerySingle<T = any>(query: string, params?: any[]): Promise<T | undefined> {
  const results = await executeQuery<T>(query, params)
  return results[0]
}
