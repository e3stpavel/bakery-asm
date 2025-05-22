import type { Asset } from '~/utils/domain/asset'
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
        a.asset_code AS id,
        a.*,
        s.name AS status,
        u.user_id,
        u.firstname,
        u.lastname,
        u.email
      FROM assets a
      INNER JOIN asset_statuses s on a.status_code = s.status_code
      INNER JOIN users u on a.updated_by_id = u.user_id
      ORDER BY a.asset_code
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

export async function findAssetById(assetId: Asset['id']) {
  const result = await db.execute({
    sql: `
      SELECT
        a.asset_code AS id,
        a.*,
        s.name AS status,
        c.name AS condition,
        o.name AS ownership,
        uc.user_id AS uc_id,
        uc.firstname AS uc_firstname,
        uc.lastname AS uc_lastname,
        uc.email AS uc_email,
        uu.user_id AS uu_id,
        uu.firstname AS uu_firstname,
        uu.lastname AS uu_lastname,
        uu.email AS uu_email
      FROM assets a
      INNER JOIN asset_statuses s on a.status_code = s.status_code
      INNER JOIN asset_conditions c on a.condition_code = c.condition_code
      INNER JOIN asset_ownerships o on a.ownership_code = o.ownership_code
      INNER JOIN users uc on a.created_by_id = uc.user_id
      INNER JOIN users uu on a.updated_by_id = uu.user_id
      WHERE a.asset_code = (:assetId)
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

export async function getAssetCategories(assetId: Asset['id']) {
  const result = await db.execute({
    sql: `
      SELECT c.category_code AS code, c.name
      FROM assets_asset_categories_join ac
              INNER JOIN asset_categories c on c.category_code = ac.category_code
          AND ac.asset_code = (:assetId);
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
        SUM(CASE WHEN s.name = 'Asset in use' THEN 1 ELSE 0 END),
        SUM(CASE WHEN s.name = 'Asset in storage' THEN 1 ELSE 0 END),
        SUM(CASE WHEN s.name = 'Asset under maintenance' THEN 1 ELSE 0 END)
      FROM assets a
      INNER JOIN asset_statuses s on a.status_code = s.status_code
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
    sql: 'SELECT COUNT(asset_code) FROM assets',
  })

  const [row] = result.rows
  return z.number().nonnegative().parse(row[0])
}

export async function restoreAssetById(assetId: Asset['id'], updatedById: User['id']) {
  try {
    const result = await db.execute({
      // TODO: check the query
      sql: `
        UPDATE assets
        SET deleted_at = NULL, deleted_by_id = NULL, updated_at = strftime('%s', 'now'), updated_by_id = (:updatedById)
        WHERE asset_code = (:assetId)
      `,
      args: {
        assetId,
        updatedById,
      },
    })

    return result.rowsAffected > 0
  }
  catch {
    return false
  }
}

export async function removeAssetById(assetId: Asset['id'], deletedById: User['id']) {
  try {
    const result = await db.execute({
      sql: `
        UPDATE assets
        SET deleted_at = strftime('%s', 'now'), deleted_by_id = (:deletedById)
        WHERE asset_code = (:assetId)
      `,
      args: {
        assetId,
        deletedById,
      },
    })

    return result.rowsAffected > 0
  }
  catch {
    return false
  }
}
