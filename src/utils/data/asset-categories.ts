import type { Asset } from '~/utils/domain/asset'
import { z } from 'astro/zod'
import { db } from '~/utils/db'
import { classificatorSchema } from '~/utils/domain/classificator'

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
