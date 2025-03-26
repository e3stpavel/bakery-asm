import { Asset, AssetCategory, Category, Condition, Country, db, Location, Ownership, Status, User } from 'astro:db'

// https://astro.build/db/seed
export default async function seed() {
  const countries = await db
    .insert(Country)
    .values([
      { name: 'Estonia' },
      { name: 'Finland' },
      { name: 'Norway' },
      { name: 'Sweden' },
    ])
    .returning()

  const [user] = await db
    .insert(User)
    .values({
      email: 'pamayo@taltech.ee',
      firstName: 'Pavel',
      lastName: 'Mayorov',
    })
    .returning()

  const [equipment, furniture, vehicle] = await db
    .insert(Category)
    .values([
      { name: 'Kitchen Equipment' },
      { name: 'Furniture' },
      { name: 'Vehicle' },
    ])
    .returning()

  const [_, normalCondition, goodCondition] = await db
    .insert(Condition)
    .values([
      { name: 'Bad' },
      { name: 'Normal' },
      { name: 'Good' },
      { name: 'Excellent' },
    ])
    .returning()

  const [_warehouseEstonia, bakery, warehouse] = await db
    .insert(Location)
    .values([
      { name: 'Warehouse', countryId: countries[0].id },
      { name: 'Main Bakery', countryId: countries[0].id },
      { name: 'Warehouse', countryId: countries[3].id },
    ])
    .returning()

  const [leased, owned] = await db
    .insert(Ownership)
    .values([
      { name: 'Leased' },
      { name: 'Owned' },
      { name: 'Rented' },
    ])
    .returning()

  const [statusInUse] = await db
    .insert(Status)
    .values([
      { name: 'In-use' },
      { name: 'Stored' },
      { name: 'Maintenance' },
      { name: 'Service' },
    ])
    .returning()

  const assets = [
    {
      name: 'Oven',
      description: 'Electrolux HW9393287A',
      statusId: statusInUse.id,
      ownershipId: owned.id,
      conditionId: goodCondition.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: user.id,
      updatedById: user.id,
      locationId: bakery.id,
      purchasedAt: new Date(2022, 0, 28, 10, 12, 38),
      purchasePrice: 1_700,
      serialNumber: 'HWU029KA920',
      expectedLifespanInMonths: 48,
    },
    {
      name: 'Delivery Van',
      statusId: statusInUse.id,
      ownershipId: leased.id,
      conditionId: normalCondition.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: user.id,
      updatedById: user.id,
      locationId: warehouse.id,
      purchasedAt: new Date(2024, 11, 1, 17, 48, 0),
      purchasePrice: 8_280,
      serialNumber: '282IA20290LAOW02902AKQO2',
    },
  ]
  const [oven, car] = await db
    .insert(Asset)
    .values([
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
      ...assets,
    ])
    .returning()

  await db.insert(AssetCategory).values([
    {
      assetId: oven.id,
      categoryId: equipment.id,
    },
    {
      assetId: car.id,
      categoryId: vehicle.id,
    },
    {
      assetId: oven.id,
      categoryId: furniture.id,
    },
  ])
}
