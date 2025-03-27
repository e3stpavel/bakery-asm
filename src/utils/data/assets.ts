import {
  and,
  Asset,
  AssetCategory,
  Category,
  Condition,
  count,
  db,
  eq,
  isNull,
  Location,
  Ownership,
  sql,
  Status,
  User,
} from 'astro:db'

export async function findAssets(page: number = 1, pageSize: number = 10) {
  return await db
    .select()
    .from(Asset)
    .innerJoin(Status, eq(Asset.statusId, Status.id))
    .innerJoin(User, eq(Asset.createdById, User.id))
    .where(isNull(Asset.deletedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize) // consider cursor if needed
    .orderBy(Asset.id)
}

export async function findAssetById(assetId: number) {
  const result = await db
    .select()
    .from(Asset)
    .innerJoin(Status, eq(Asset.statusId, Status.id))
    .innerJoin(Condition, eq(Asset.conditionId, Condition.id))
    .innerJoin(Location, eq(Asset.locationId, Location.id))
    .innerJoin(Ownership, eq(Asset.ownershipId, Ownership.id))
    .innerJoin(User, eq(Asset.createdById, User.id))
    .where(and(
      eq(Asset.id, assetId),
      isNull(Asset.deletedAt),
    ))
    .limit(1)

  return result.at(0)
}

export async function getAssetCategories(assetId: number) {
  const result = await db
    .select()
    .from(AssetCategory)
    .leftJoin(Asset, eq(Asset.id, AssetCategory.assetId))
    .leftJoin(Category, eq(Category.id, AssetCategory.categoryId))
    .where(eq(Asset.id, assetId))

  return result
    .map(row => row.Category)
    .filter(category => category !== null)
}

export async function getAssetReport() {
  const [result] = await db
    .select({
      assetsInUseCount: sql`sum(case when Status.name = 'In-use' then 1 else 0 end)`.mapWith(Number),
      assetsStoredCount: sql`sum(case when Status.name = 'Stored' then 1 else 0 end)`.mapWith(Number),
      assetsInServiceCount: sql`sum(case when Status.name = 'Service' or Status.name = 'Maintenance' then 1 else 0 end)`.mapWith(Number),
    })
    .from(Asset)
    .innerJoin(Status, eq(Asset.statusId, Status.id))

  return result
}

export async function countAssets() {
  const [result] = await db
    .select({ value: count() })
    .from(Asset)
    .where(isNull(Asset.deletedAt))

  return result.value
}

export async function removeAssetById(assetId: number) {
  await db
    .update(Asset)
    .set({
      deletedAt: new Date(),
      // TODO: updated at
    })
    .where(eq(Asset.id, assetId))
}
