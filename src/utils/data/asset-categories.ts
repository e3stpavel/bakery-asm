import type { Asset } from '~/utils/domain/asset'
import { z } from 'astro/zod'
import { db } from '~/utils/db'
import { classificatorSchema, type Category } from '~/utils/domain/classificator'
import type { User } from '~/utils/domain/user'

export async function getAllCategoriesAndAssetRelation(assetId: Asset['id']) {
  const result = await db.execute({
    sql: `
      SELECT c.category_code AS code,
            c.name,
            CASE
                WHEN ac.asset_code IS NOT NULL THEN 1
                ELSE 0
                END         AS belongs_to_asset
      FROM asset_categories c
              LEFT JOIN assets_asset_categories_join ac on ac.category_code = c.category_code
          AND ac.asset_code = (:assetId);
    `,
    args: { assetId },
  })

  return result.rows.map((row) => {
    return classificatorSchema.extend({
      belongs_to_asset: z.coerce.boolean(),
    }).parse(row)
  })
}

export async function updateAssetCategoriesByAssetId(assetId: Asset['id'], categoryCodes: Array<Category['code']>,  updatedById: User['id']) {
  const deletePlaceholders = categoryCodes.map(() => '?').join(',')
  const insertPlaceholders = categoryCodes.map(() => '(?, ?)').join(',')
  
  const result = await db.batch([
    {
      sql: `
        DELETE FROM assets_asset_categories_join
        WHERE asset_code = ?
        AND category_code NOT IN (${deletePlaceholders})
      `,
      args: [
        assetId,
        ...categoryCodes
      ]
    },
    {
      sql: `
        INSERT INTO assets_asset_categories_join (asset_code, category_code)
        VALUES ${insertPlaceholders}
        ON CONFLICT DO NOTHING;
      `,
      args: categoryCodes.flatMap(code => [assetId, code])
    },
    {
      sql: `
        UPDATE assets SET updated_at = strftime('%s', 'now'), updated_by_id = (:updatedById)
        WHERE asset_code = (:assetId)
      `,
      args: {
        assetId,
        updatedById
      }
    }
  ], 'write')

  return result.some(mutation => mutation.rowsAffected > 0)
}
