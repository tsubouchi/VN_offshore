"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Users, Globe, Calendar, Award, MessageCircle, ExternalLink } from "lucide-react"
import type { Company } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { CompanyProfileSkeleton } from "@/components/company/company-profile-skeleton"
import { PageErrorBoundary } from "@/components/page-error-boundary"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { ContactModal } from "@/components/contact/contact-modal"
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface Portfolio {
  id: string
  title: string
  description: string
  project_url?: string
  image_url?: string
  technologies_used: string[]
  project_duration?: string
  team_size?: number
}

interface Certification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  certificate_url?: string
}

// Mock data for demonstration
const MOCK_COMPANY: Company & {
  industries: string[]
  technologies: string[]
  portfolios: Portfolio[]
  certifications: Certification[]
} = {
  id: "1",
  user_id: "user1",
  company_name: "TechViet Solutions",
  description:
    "TechViet Solutions is a leading Vietnamese software development company with over 6 years of experience serving Japanese clients. We specialize in creating high-quality web and mobile applications using modern technologies and agile methodologies. Our team of 45+ skilled developers is committed to delivering exceptional results while maintaining strong communication and cultural understanding with our Japanese partners.",
  website: "https://techviet.com",
  established_year: 2018,
  employee_count: 45,
  location: "Ho Chi Minh City",
  address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City, Vietnam",
  status: "approved",
  logo_url: "/abstract-tech-logo.png",
  cover_image_url: "/modern-office-building.png",
  hourly_rate_min: 25,
  hourly_rate_max: 45,
  currency: "USD",
  average_rating: 4.8,
  total_reviews: 24,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  industries: ["Web Development", "E-commerce", "Fintech", "Healthcare"],
  technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Next.js", "Python"],
  portfolios: [
    {
      id: "p1",
      title: "E-commerce Platform for Japanese Retailer",
      description:
        "Built a comprehensive e-commerce platform with inventory management, payment integration, and multi-language support for a major Japanese retail chain.",
      project_url: "https://example-ecommerce.com",
      image_url: "/ecommerce-website-homepage.png",
      technologies_used: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      project_duration: "8 months",
      team_size: 6,
    },
    {
      id: "p2",
      title: "Fintech Mobile Application",
      description:
        "Developed a secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial analytics.",
      project_url: "https://example-fintech.com",
      image_url: "/mobile-banking-app.png",
      technologies_used: ["React Native", "Node.js", "MongoDB", "Firebase", "Plaid API"],
      project_duration: "10 months",
      team_size: 8,
    },
    {
      id: "p3",
      title: "Healthcare Management System",
      description:
        "Created a patient management system with appointment scheduling, medical records, and telemedicine capabilities for a Japanese healthcare provider.",
      image_url: "/healthcare-dashboard.png",
      technologies_used: ["Vue.js", "Python", "PostgreSQL", "WebRTC", "Docker"],
      project_duration: "12 months",
      team_size: 10,
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "ISO 27001:2013 Information Security Management",
      issuer: "BSI Group",
      issue_date: "2023-03-15",
      expiry_date: "2026-03-15",
      certificate_url: "https://example.com/iso27001.pdf",
    },
    {
      id: "c2",
      name: "AWS Solution Architecture Professional",
      issuer: "Amazon Web Services",
      issue_date: "2023-01-20",
      expiry_date: "2026-01-20",
    },
    {
      id: "c3",
      name: "Agile Project Management Certification",
      issuer: "Project Management Institute",
      issue_date: "2022-11-10",
      expiry_date: "2025-11-10",
    },
  ],
}

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<typeof MOCK_COMPANY | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Simulate loading company data
  useEffect(() => {
    const loadCompany = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      setCompany(MOCK_COMPANY)
      setIsLoading(false)
    }
    loadCompany()
  }, [])

  const renderStars = (rating: number, size?: string) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${size || ""} ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  const handleContact = () => {
    setIsContactModalOpen(true)
  }

  const handleStartChat = (companyId: string, message: string) => {
    // TODO: Integrate with real-time messaging
    console.log("Starting chat with company:", companyId, "Message:", message)
    // For now, simulate navigation to messages page
    const conversationData = {
      companyId,
      companyName: company?.company_name,
      companyLogo: company?.logo_url,
      initialMessage: message,
      timestamp: new Date().toISOString(),
    }
    sessionStorage.setItem("newConversation", JSON.stringify(conversationData))
    // router.push("/messages") - uncomment when ready to redirect
  }

  if (isLoading || !company) {
    return <CompanyProfileSkeleton />
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <Breadcrumb
              items={[
                { label: "Companies", href: "/search" },
                { label: company.company_name, current: true }
              ]}
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-primary/10 to-accent/10">
        <Image
          src={company.cover_image_url || "/placeholder.svg?height=300&width=800&query=modern office building"}
          alt="Company cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center flex-shrink-0">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url || "/placeholder.svg"}
                    alt={`${company.company_name} logo`}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">{company.company_name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-card-foreground mb-2">{company.company_name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employee_count} employees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Est. {company.established_year}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {renderStars(company.average_rating)}
                    <span className="font-semibold">{company.average_rating}</span>
                    <span className="text-muted-foreground">({company.total_reviews} reviews)</span>
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    ${company.hourly_rate_min}-${company.hourly_rate_max} USD/hour
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.industries.map((industry) => (
                    <Badge key={industry} variant="secondary">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Company
                </Button>
                <FavoriteButton
                  companyId={company.id}
                  companyName={company.company_name}
                  variant="outline"
                  size="lg"
                  showText={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.company_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{company.description}</p>
                  </CardContent>
                </Card>

                {/* Technologies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technologies & Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {company.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projects Completed</span>
                      <span className="font-semibold">150+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Retention</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Project Size</span>
                      <span className="font-semibold">6 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-semibold">&lt; 2 hours</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium">{company.address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Business Hours</div>
                      <div className="font-medium">Mon-Fri: 9:00 AM - 6:00 PM (GMT+7)</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Languages</div>
                      <div className="font-medium">Vietnamese, English, Japanese</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.portfolios.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <Image
                      src={project.image_url || "/placeholder.svg?height=200&width=300&query=project screenshot"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

                    <div className="space-y-2 mb-3">
                      {project.project_duration && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{project.project_duration}</span>
                        </div>
                      )}
                      {project.team_size && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Team Size:</span>
                          <span>{project.team_size} people</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies_used.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies_used.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies_used.length - 3}
                        </Badge>
                      )}
                    </div>

                    {project.project_url && (
                      <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Project
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {company.certifications.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Issued by {cert.issuer}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                          {cert.expiry_date && <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>}
                        </div>
                        {cert.certificate_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              View Certificate
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {renderStars(company.average_rating, "md")}
                  <span className="text-2xl font-bold">{company.average_rating}</span>
                  <span className="text-muted-foreground">({company.total_reviews} reviews)</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  See what Japanese companies say about working with {company.company_name}
                </p>
                <Link href={`/company/${company.id}/reviews`}>
                  <Button size="lg">
                    <Star className="h-4 w-4 mr-2" />
                    View All Reviews
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        company={company}
        onStartChat={handleStartChat}
      />
      </div>
    </PageErrorBoundary>
  )
}
