import { faker } from '@faker-js/faker'

faker.seed(98765)

export type FAQCategory = 'general' | 'bidding' | 'shipping' | 'payment' | 'inspection' | 'account'
export type FAQStatus = 'published' | 'draft'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  status: FAQStatus
  order: number
  views: number
  helpfulCount: number
  notHelpfulCount: number
  createdAt: Date
  updatedAt: Date
}

export const faqCategories: { value: FAQCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'bidding', label: 'Bidding & Auctions' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'payment', label: 'Payment & Invoicing' },
  { value: 'inspection', label: 'Vehicle Inspection' },
  { value: 'account', label: 'Account & Profile' },
]

const faqTemplates: Record<FAQCategory, { question: string; answer: string }[]> = {
  general: [
    {
      question: 'What types of vehicles do you sell?',
      answer: 'We specialize in Japanese Domestic Market (JDM) vehicles, including sports cars, luxury vehicles, and rare collectibles. Our inventory includes popular brands like Toyota, Nissan, Honda, Mazda, and Subaru.',
    },
    {
      question: 'How do I create an account?',
      answer: 'Click on the "Register" button in the top right corner of our website. Fill in your details including name, email, and create a secure password. You will receive a verification email to activate your account.',
    },
    {
      question: 'What currencies do you accept?',
      answer: 'We accept payments in USD, EUR, GBP, and JPY. All prices on our website are displayed in Japanese Yen (JPY) by default, but can be converted to your preferred currency.',
    },
  ],
  bidding: [
    {
      question: 'How do I place a bid on a vehicle?',
      answer: 'First, ensure you have a verified account with sufficient deposit. Navigate to the vehicle you are interested in, enter your maximum bid amount, and click "Place Bid". Our system will automatically bid on your behalf up to your maximum amount.',
    },
    {
      question: 'What happens if I win an auction?',
      answer: 'If you win, you will receive an email notification immediately. You have 24 hours to confirm the purchase and arrange payment. Our team will then handle all export documentation and shipping arrangements.',
    },
    {
      question: 'Can I retract my bid?',
      answer: 'Bids are generally binding and cannot be retracted. However, if you have made a genuine error, please contact our support team immediately. Repeated bid retractions may result in account suspension.',
    },
    {
      question: 'What is the auction deposit requirement?',
      answer: 'A refundable deposit of ¥100,000 is required to participate in auctions. This deposit is applied to your first purchase or refunded if you decide not to bid.',
    },
  ],
  shipping: [
    {
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by destination: USA/Canada (4-6 weeks), Europe (6-8 weeks), Australia/NZ (3-4 weeks), Asia (1-2 weeks). These are estimates and actual times may vary based on port congestion and customs clearance.',
    },
    {
      question: 'Do you offer door-to-door delivery?',
      answer: 'Yes, we offer both port-to-port and door-to-door delivery options. Door-to-door delivery includes customs clearance, local transport, and delivery to your specified address.',
    },
    {
      question: 'What shipping methods are available?',
      answer: 'We offer RoRo (Roll-on/Roll-off) shipping for the most economical option, and container shipping for premium protection. Container shipping is recommended for high-value or modified vehicles.',
    },
  ],
  payment: [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank wire transfers (TT), which is our primary payment method. For returning customers with good standing, we may offer additional payment options. Credit card payments are not accepted for vehicle purchases.',
    },
    {
      question: 'When is payment due?',
      answer: 'Full payment is due within 5 business days of receiving the invoice for auction wins, and 3 business days for stock vehicles. Late payments may incur storage fees and could affect your account standing.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees. Our invoices clearly itemize: vehicle price, auction fees, FOB charges, shipping costs, and any optional services. All fees are disclosed before you commit to a purchase.',
    },
  ],
  inspection: [
    {
      question: 'Do you provide vehicle inspection reports?',
      answer: 'Yes, all auction vehicles come with official auction inspection sheets. For stock vehicles, we provide our own detailed inspection reports with photos. Additional third-party inspections can be arranged upon request.',
    },
    {
      question: 'What does the inspection cover?',
      answer: 'Our inspections cover: exterior condition, interior condition, engine and mechanical components, undercarriage, accident history, odometer verification, and overall grade assessment.',
    },
    {
      question: 'Can I request additional photos or videos?',
      answer: 'Absolutely! Our team can provide additional photos, videos, and even live video calls to show you the vehicle in detail. Just contact your sales representative with your requests.',
    },
  ],
  account: [
    {
      question: 'How do I verify my account?',
      answer: 'Account verification requires: government-issued ID (passport or driver\'s license), proof of address (utility bill or bank statement), and a completed verification form. Verification typically takes 1-2 business days.',
    },
    {
      question: 'Can I have multiple users on one account?',
      answer: 'Business accounts can have multiple authorized users. Contact our support team to set up additional users with customized permission levels for your organization.',
    },
    {
      question: 'How do I update my account information?',
      answer: 'Log into your account and navigate to "Settings" to update your contact information, preferences, and notification settings. For changes to verified information (name, company details), please contact support.',
    },
  ],
}

export const faqs: FAQ[] = (() => {
  const allFaqs: FAQ[] = []
  let orderIndex = 0

  Object.entries(faqTemplates).forEach(([category, templates]) => {
    templates.forEach((template) => {
      const createdAt = faker.date.past({ years: 1 })
      allFaqs.push({
        id: faker.string.uuid(),
        question: template.question,
        answer: template.answer,
        category: category as FAQCategory,
        status: faker.helpers.weightedArrayElement([
          { value: 'published' as const, weight: 8 },
          { value: 'draft' as const, weight: 2 },
        ]),
        order: orderIndex++,
        views: faker.number.int({ min: 50, max: 2000 }),
        helpfulCount: faker.number.int({ min: 10, max: 500 }),
        notHelpfulCount: faker.number.int({ min: 0, max: 50 }),
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      })
    })
  })

  return allFaqs
})()

export const faqCategoryLabels: Record<FAQCategory, string> = {
  general: 'General',
  bidding: 'Bidding & Auctions',
  shipping: 'Shipping & Delivery',
  payment: 'Payment & Invoicing',
  inspection: 'Vehicle Inspection',
  account: 'Account & Profile',
}

export const faqStatusLabels: Record<FAQStatus, string> = {
  published: 'Published',
  draft: 'Draft',
}

export function getFAQStats() {
  return {
    total: faqs.length,
    published: faqs.filter(f => f.status === 'published').length,
    draft: faqs.filter(f => f.status === 'draft').length,
    totalViews: faqs.reduce((sum, f) => sum + f.views, 0),
    avgHelpfulness: Math.round(
      (faqs.reduce((sum, f) => sum + f.helpfulCount, 0) /
        faqs.reduce((sum, f) => sum + f.helpfulCount + f.notHelpfulCount, 0)) * 100
    ),
  }
}
