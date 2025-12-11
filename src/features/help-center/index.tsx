'use client'

import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Search as SearchIcon,
  Book,
  MessageCircle,
  FileText,
  Video,
  HelpCircle,
  ExternalLink,
  Mail,
  Phone,
  ChevronRight,
  Gavel,
  Users,
  CreditCard,
  Car,
  Settings,
  Shield,
} from 'lucide-react'

const categories = [
  {
    id: 'auctions',
    title: 'Auctions',
    icon: Gavel,
    description: 'Managing auctions, bidding, and listings',
    articles: 12,
  },
  {
    id: 'customers',
    title: 'Customer Management',
    icon: Users,
    description: 'Customer accounts, profiles, and communication',
    articles: 8,
  },
  {
    id: 'payments',
    title: 'Payments & Invoices',
    icon: CreditCard,
    description: 'Payment processing, invoicing, and refunds',
    articles: 15,
  },
  {
    id: 'vehicles',
    title: 'Vehicle Inventory',
    icon: Car,
    description: 'Stock management and vehicle details',
    articles: 10,
  },
  {
    id: 'settings',
    title: 'Account Settings',
    icon: Settings,
    description: 'Profile, preferences, and configurations',
    articles: 6,
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Authentication, permissions, and safety',
    articles: 7,
  },
]

const popularArticles = [
  {
    id: '1',
    title: 'How to create a new auction listing',
    category: 'Auctions',
    views: 1234,
  },
  {
    id: '2',
    title: 'Processing customer payments',
    category: 'Payments',
    views: 987,
  },
  {
    id: '3',
    title: 'Managing vehicle inventory',
    category: 'Vehicles',
    views: 856,
  },
  {
    id: '4',
    title: 'Setting up email notifications',
    category: 'Settings',
    views: 723,
  },
  {
    id: '5',
    title: 'Understanding bid history',
    category: 'Auctions',
    views: 654,
  },
]

const faqs = [
  {
    question: 'How do I create a new auction?',
    answer: 'Navigate to Auctions > Create New. Fill in the vehicle details, set the starting price, reserve price, and auction duration. You can add photos and detailed descriptions before publishing.',
  },
  {
    question: 'How can I process a refund?',
    answer: 'Go to Payments > Find the transaction > Click on Refund. You can process full or partial refunds. The refund will be processed within 3-5 business days.',
  },
  {
    question: 'How do I add a new customer?',
    answer: 'Navigate to Customers > Add Customer. Fill in the required information including name, email, and phone number. An invitation email will be sent to the customer.',
  },
  {
    question: 'What happens when an auction ends?',
    answer: 'When an auction ends, the highest bidder is notified and has 24 hours to complete the purchase. If they fail to complete, the next highest bidder is contacted.',
  },
  {
    question: 'How do I generate an invoice?',
    answer: 'Go to Invoice Generator > Create New. Select the customer, add line items, and generate the invoice. You can send it directly via email or download as PDF.',
  },
  {
    question: 'Can I edit an active auction?',
    answer: 'You can edit some details like description and photos on active auctions. However, prices and end times cannot be changed once bidding has started.',
  },
]

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">How can we help you?</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search our knowledge base or browse categories below
            </p>
            <div className="max-w-xl mx-auto relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for articles, guides, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Book className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium">Documentation</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Video className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium">Video Tutorials</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <MessageCircle className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium">Live Chat</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium">API Docs</p>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover:border-primary cursor-pointer transition-colors group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{category.articles} articles</Badge>
                    </div>
                    <CardTitle className="mt-4">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto">
                      Browse articles <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Articles & FAQs */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Popular Articles
                </CardTitle>
                <CardDescription>Most viewed help articles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">{article.views} views</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-sm">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Still need help?</h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Our support team is available 24/7 to assist you with any questions or issues.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Us
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
