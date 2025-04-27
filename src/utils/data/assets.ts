import type { User } from '~/utils/domain/user'
import { z } from 'astro/zod'
import { db } from '~/utils/db'
import { assetSchema } from '~/utils/domain/asset'
import { classificatorSchema } from '~/utils/domain/classificator'
import { partialUserSchema } from '~/utils/domain/user'

export async function findAssets(page: number = 1, pageSize: number = 10) {
  // consider cursor if needed
  const result = await db.execute({
    sql: `
      SELECT
        a.*,
        s.name AS status,
        u.id AS user_id,
        u.firstname,
        u.lastname,
        u.email
      FROM Assets a
      INNER JOIN Statuses s on a.status_id = s.id
      INNER JOIN Users u on a.updated_by_id = u.id
      WHERE a.deleted_at IS NULL AND a.deleted_by_id IS NULL
      ORDER BY a.id
      LIMIT (:limit)
      OFFSET (:offset)
    `,
    args: {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  })

  return result.rows.map((row) => {
    const asset = assetSchema.parse(row)
    const status = z.string().parse(row.status)
    const updatedBy = partialUserSchema.parse({ ...row, id: row.user_id })

    return {
      asset,
      status,
      updatedBy,
    }
  })
}

export async function findAssetById(assetId: number) {
  const result = await db.execute({
    sql: `
      SELECT
        a.*,
        s.name AS status,
        c.name AS condition,
        o.name AS ownership,
        uc.id AS uc_id,
        uc.firstname AS uc_firstname,
        uc.lastname AS uc_lastname,
        uc.email AS uc_email,
        uu.id AS uu_id,
        uu.firstname AS uu_firstname,
        uu.lastname AS uu_lastname,
        uu.email AS uu_email
      FROM Assets a
      INNER JOIN Statuses s on a.status_id = s.id
      INNER JOIN Conditions c on a.condition_id = c.id
      INNER JOIN Ownerships o on a.ownership_id = o.id
      INNER JOIN Users uc on a.created_by_id = uc.id
      INNER JOIN Users uu on a.updated_by_id = uu.id
      WHERE a.id = (:assetId) AND a.deleted_at IS NULL AND a.deleted_by_id IS NULL
      LIMIT 1
    `,
    args: { assetId },
  })

  const [row] = result.rows
  if (!row)
    return null

  const asset = assetSchema.parse(row)
  const classificators = z.object({
    status: classificatorSchema.shape.name,
    condition: classificatorSchema.shape.name,
    ownership: classificatorSchema.shape.name,
  }).parse(row)

  const createdBy = partialUserSchema.parse({
    id: row.uc_id,
    firstname: row.uc_firstname,
    lastname: row.uc_lastname,
    email: row.uc_email,
  })
  const updatedBy = partialUserSchema.parse({
    id: row.uu_id,
    firstname: row.uu_firstname,
    lastname: row.uu_lastname,
    email: row.uu_email,
  })

  return {
    asset,
    ...classificators,
    createdBy,
    updatedBy,
  }
}

export async function getAssetCategories(assetId: number) {
  const result = await db.execute({
    sql: `
      SELECT c.* FROM AssetCategories ac
      LEFT JOIN Assets a on a.id = ac.asset_id
      LEFT JOIN Categories c on c.id = ac.category_id
      WHERE a.id = (:assetId)
    `,
    args: { assetId },
  })

  return result.rows.map((row) => {
    return classificatorSchema.parse(row)
  })
}

export async function getAssetReport() {
  const result = await db.execute({
    sql: `
      SELECT
        SUM(CASE WHEN s.name = 'In use' THEN 1 ELSE 0 END),
        SUM(CASE WHEN s.name = 'In storage' THEN 1 ELSE 0 END),
        SUM(CASE WHEN s.name = 'Under maintenance' THEN 1 ELSE 0 END)
      FROM Assets a
      INNER JOIN Statuses s on a.status_id = s.id
      WHERE a.deleted_at IS NULL AND a.deleted_by_id IS NULL
    `,
  })

  const [row] = result.rows
  const [assetsInUseCount, assetsStoredCount, assetsInServiceCount] = z.number()
    .nonnegative()
    .array()
    .length(3)
    .parse(Object.values(row))

  return {
    assetsInUseCount,
    assetsStoredCount,
    assetsInServiceCount,
  }
}

export async function countAssets() {
  const result = await db.execute({
    sql: 'SELECT COUNT(id) FROM Assets WHERE deleted_at IS NULL AND deleted_by_id IS NULL',
  })

  const [row] = result.rows
  return z.number().nonnegative().parse(row[0])
}

export async function removeAssetById(assetId: number, deletedById: User['id']) {
  const result = await db.execute({
    sql: `
      UPDATE Assets
      SET deleted_at = CURRENT_TIMESTAMP, deleted_by_id = (:deletedById)
      WHERE id = (:assetId)
      AND status_id = (
        SELECT id FROM Statuses WHERE name = 'In storage'
      )
    `,
    args: {
      assetId,
      deletedById,
    },
  })

  return result.rowsAffected > 0
}
