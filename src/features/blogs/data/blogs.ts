import { faker } from '@faker-js/faker'

faker.seed(90123)

export interface Blog {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: string
  author: {
    id: string
    name: string
    avatar: string
  }
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  views: number
  likes: number
  comments: number
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  publishedAt?: Date
  scheduledFor?: Date
  createdAt: Date
  updatedAt: Date
}

const categories = ['Buying Guide', 'Vehicle Reviews', 'Auction Tips', 'Industry News', 'Maintenance', 'Import/Export']
const tags = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'JDM', 'Import', 'Auction', 'Tips', 'Guide', 'Review', 'News', 'Maintenance']

export const blogs: Blog[] = Array.from({ length: 50 }, (_, index) => {
  const authorName = faker.person.fullName()
  const title = faker.lorem.sentence({ min: 5, max: 10 })
  const category = faker.helpers.arrayElement(categories)

  return {
    id: faker.string.uuid(),
    slug: faker.helpers.slugify(title).toLowerCase(),
    title,
    excerpt: faker.lorem.paragraph(),
    content: faker.lorem.paragraphs(5),
    featuredImage: faker.image.url(),
    author: {
      id: faker.string.uuid(),
      name: authorName,
      avatar: faker.image.avatar(),
    },
    category,
    tags: faker.helpers.arrayElements(tags, { min: 2, max: 5 }),
    status: faker.helpers.arrayElement(['draft', 'published', 'scheduled', 'archived']),
    views: faker.number.int({ min: 0, max: 10000 }),
    likes: faker.number.int({ min: 0, max: 500 }),
    comments: faker.number.int({ min: 0, max: 50 }),
    seo: {
      metaTitle: title.slice(0, 60),
      metaDescription: faker.lorem.sentence({ min: 15, max: 25 }),
      keywords: faker.helpers.arrayElements(tags, { min: 3, max: 6 }),
    },
    publishedAt: faker.helpers.maybe(() => faker.date.past()),
    scheduledFor: faker.helpers.maybe(() => faker.date.future()),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
