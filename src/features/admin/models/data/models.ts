import { faker } from '@faker-js/faker'

faker.seed(32123)

export interface ModelSEO {
  id: string
  slug: string
  make: string
  model: string
  category: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  pageContent: string
  linkedBlogs: string[]
  seoScore: number
  status: 'draft' | 'published'
  vehicleCount: number
  pageViews: number
  createdAt: Date
  updatedAt: Date
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche']
const modelsByMake: Record<string, { model: string; category: string }[]> = {
  'Toyota': [
    { model: 'Camry', category: 'sedan' },
    { model: 'Corolla', category: 'sedan' },
    { model: 'RAV4', category: 'suv' },
    { model: 'Land Cruiser', category: 'suv' },
    { model: 'Supra', category: 'coupe' },
    { model: 'Highlander', category: 'suv' },
    { model: 'Tacoma', category: 'truck' },
  ],
  'Honda': [
    { model: 'Civic', category: 'sedan' },
    { model: 'Accord', category: 'sedan' },
    { model: 'CR-V', category: 'suv' },
    { model: 'Pilot', category: 'suv' },
    { model: 'NSX', category: 'coupe' },
  ],
  'BMW': [
    { model: '3 Series', category: 'sedan' },
    { model: '5 Series', category: 'sedan' },
    { model: 'X3', category: 'suv' },
    { model: 'X5', category: 'suv' },
    { model: 'M3', category: 'sedan' },
    { model: 'i4', category: 'electric' },
  ],
  'Mercedes-Benz': [
    { model: 'C-Class', category: 'sedan' },
    { model: 'E-Class', category: 'sedan' },
    { model: 'S-Class', category: 'sedan' },
    { model: 'GLC', category: 'suv' },
    { model: 'GLE', category: 'suv' },
    { model: 'EQS', category: 'electric' },
  ],
  'Audi': [
    { model: 'A4', category: 'sedan' },
    { model: 'A6', category: 'sedan' },
    { model: 'Q5', category: 'suv' },
    { model: 'Q7', category: 'suv' },
    { model: 'e-tron', category: 'electric' },
  ],
  'Nissan': [
    { model: 'Altima', category: 'sedan' },
    { model: 'GT-R', category: 'coupe' },
    { model: 'Rogue', category: 'suv' },
    { model: 'Pathfinder', category: 'suv' },
    { model: '370Z', category: 'coupe' },
  ],
  'Lexus': [
    { model: 'IS', category: 'sedan' },
    { model: 'ES', category: 'sedan' },
    { model: 'RX', category: 'suv' },
    { model: 'LX', category: 'suv' },
    { model: 'LC', category: 'coupe' },
  ],
  'Porsche': [
    { model: '911', category: 'coupe' },
    { model: 'Cayenne', category: 'suv' },
    { model: 'Macan', category: 'suv' },
    { model: 'Taycan', category: 'electric' },
    { model: 'Panamera', category: 'sedan' },
  ],
}

export const modelsData: ModelSEO[] = Object.entries(modelsByMake).flatMap(([make, models]) =>
  models.map((m) => ({
    id: faker.string.uuid(),
    slug: `${make.toLowerCase().replace(/\s+/g, '-')}-${m.model.toLowerCase().replace(/\s+/g, '-')}`,
    make,
    model: m.model,
    category: m.category,
    metaTitle: `${make} ${m.model} for Sale - Buy Quality ${make} ${m.model} | Zervtek`,
    metaDescription: `Find the best ${make} ${m.model} vehicles for sale. Browse our inventory of certified pre-owned ${m.model} with competitive pricing and worldwide shipping.`,
    keywords: [
      make.toLowerCase(),
      m.model.toLowerCase(),
      `${make.toLowerCase()} ${m.model.toLowerCase()}`,
      `buy ${m.model.toLowerCase()}`,
      m.category,
    ],
    pageContent: faker.lorem.paragraphs(2),
    linkedBlogs: faker.helpers.maybe(() =>
      Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
        faker.lorem.sentence({ min: 3, max: 6 })
      )
    ) || [],
    seoScore: faker.number.int({ min: 35, max: 100 }),
    status: faker.helpers.arrayElement(['draft', 'published']),
    vehicleCount: faker.number.int({ min: 0, max: 50 }),
    pageViews: faker.number.int({ min: 50, max: 20000 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }))
)
