import { faker } from '@faker-js/faker'

faker.seed(12321)

export interface MakeSEO {
  id: string
  slug: string
  name: string
  logo?: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  pageContent: string
  seoScore: number
  status: 'draft' | 'published'
  vehicleCount: number
  pageViews: number
  createdAt: Date
  updatedAt: Date
}

const makes = [
  'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Mazda', 'Lexus',
  'Porsche', 'Volkswagen', 'Ford', 'Chevrolet', 'Subaru', 'Hyundai', 'Kia',
  'Mitsubishi', 'Infiniti', 'Acura', 'Volvo', 'Jaguar', 'Land Rover', 'Ferrari',
  'Lamborghini', 'Bentley', 'Maserati', 'Alfa Romeo', 'Genesis', 'Rivian', 'Tesla'
]

export const makesData: MakeSEO[] = makes.map((make) => ({
  id: faker.string.uuid(),
  slug: make.toLowerCase().replace(/\s+/g, '-'),
  name: make,
  logo: faker.image.url(),
  metaTitle: `${make} Vehicles for Sale - Premium Japanese Import Cars | Zervtek`,
  metaDescription: `Browse our extensive collection of ${make} vehicles. Find certified pre-owned ${make} cars, SUVs, and trucks with competitive pricing and worldwide shipping.`,
  keywords: [make.toLowerCase(), `${make.toLowerCase()} for sale`, `buy ${make.toLowerCase()}`, 'japanese cars', 'import vehicles'],
  pageContent: faker.lorem.paragraphs(3),
  seoScore: faker.number.int({ min: 40, max: 100 }),
  status: faker.helpers.arrayElement(['draft', 'published']),
  vehicleCount: faker.number.int({ min: 5, max: 100 }),
  pageViews: faker.number.int({ min: 100, max: 50000 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))
