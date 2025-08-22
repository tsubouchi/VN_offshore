"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/toast-container"
import { 
  getCompanyProfile, 
  updateCompanyProfile,
  getCompanyPortfolios,
  getCompanyTechnologies,
  type Portfolio,
  type Certification
} from "@/lib/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { Plus, X, ExternalLink, Award, Save, Building, Globe, Calendar, Users, DollarSign, MapPin } from "lucide-react"

const INDUSTRIES = [
  "Web Development",
  "Mobile App Development",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Education",
  "Gaming",
  "IoT",
  "AI/Machine Learning",
  "Blockchain",
]

const TECHNOLOGIES = [
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "PHP",
  "Ruby on Rails",
  "Go",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "React Native",
  "Flutter",
  "iOS (Swift)",
  "Android (Kotlin)",
  "AWS",
  "Docker",
  "Kubernetes",
]

export function ProfileManagementV2() {
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    description: "",
    website: "",
    established_year: new Date().getFullYear(),
    employee_count: 0,
    location: "",
    address: "",
    hourly_rate_min: 0,
    hourly_rate_max: 0,
    industries: [] as string[],
    technologies: [] as string[],
    languages: ["English", "Vietnamese"],
    business_hours: "9:00 AM - 6:00 PM (GMT+7)" as string | Record<string, unknown>,
  })

  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])

  const [newPortfolio, setNewPortfolio] = useState<Partial<Portfolio>>({
    title: "",
    description: "",
    project_url: "",
    technologies: [],
  })

  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    certificate_url: "",
  })

  // Load existing profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      setIsLoading(true)
      try {
        const profile = await getCompanyProfile(user.id)
        if (profile) {
          setCompanyInfo({
            company_name: profile.company_name || '',
            description: profile.description || '',
            website: profile.website || '',
            established_year: profile.established_year || new Date().getFullYear(),
            employee_count: profile.employee_count || 0,
            location: profile.location || '',
            address: profile.address || '',
            hourly_rate_min: profile.hourly_rate_min || 0,
            hourly_rate_max: profile.hourly_rate_max || 0,
            industries: [],
            technologies: [],
            languages: profile.languages || ['English', 'Vietnamese'],
            business_hours: (typeof profile.business_hours === 'string' ? profile.business_hours : '9:00 AM - 6:00 PM (GMT+7)') as string | Record<string, unknown>,
          })

          // Load portfolios and technologies if company exists
          const techs = await getCompanyTechnologies(profile.id)
          setCompanyInfo(prev => ({ ...prev, technologies: techs }))
          
          const portfolioData = await getCompanyPortfolios(profile.id)
          if (portfolioData.length > 0) {
            setPortfolios(portfolioData)
          }

          // Load certifications from profile if available
          if (profile.certifications && Array.isArray(profile.certifications)) {
            const certs = profile.certifications.map((name, index) => ({
              id: `cert-${index}`,
              name,
              issuer: '',
              issue_date: '',
              certificate_url: ''
            }))
            setCertifications(certs)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to load profile data'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [user, router, addToast])

  const handleSave = async () => {
    if (!user) {
      addToast({
        type: 'warning',
        title: 'Login Required',
        description: 'Please log in to save your profile'
      })
      return
    }

    // Validation
    if (!companyInfo.company_name.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Company name is required'
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await updateCompanyProfile(user.id, {
        companyInfo: {
          company_name: companyInfo.company_name,
          description: companyInfo.description,
          website: companyInfo.website,
          established_year: companyInfo.established_year,
          employee_count: companyInfo.employee_count,
          location: companyInfo.location,
          address: companyInfo.address,
          hourly_rate_min: companyInfo.hourly_rate_min,
          hourly_rate_max: companyInfo.hourly_rate_max,
          languages: companyInfo.languages,
          business_hours: typeof companyInfo.business_hours === 'string' ? undefined : companyInfo.business_hours,
        },
        portfolios,
        certifications,
        technologies: companyInfo.technologies,
        industries: companyInfo.industries,
      })

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Profile Saved',
          description: 'Your company profile has been updated successfully'
        })
      } else {
        throw new Error(result.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save profile'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompanyInfoChange = (field: string, value: string | number | string[]) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: "industries" | "technologies", value: string) => {
    const current = companyInfo[field]
    if (current.includes(value)) {
      handleCompanyInfoChange(field, current.filter(item => item !== value))
    } else {
      handleCompanyInfoChange(field, [...current, value])
    }
  }

  const addPortfolio = () => {
    if (newPortfolio.title && newPortfolio.description) {
      const portfolio: Portfolio = {
        id: `portfolio-${Date.now()}`,
        title: newPortfolio.title,
        description: newPortfolio.description,
        image_url: '',
        project_url: newPortfolio.project_url || '',
        technologies: newPortfolio.technologies || [],
      }
      setPortfolios([...portfolios, portfolio])
      setNewPortfolio({
        title: "",
        description: "",
        project_url: "",
        technologies: [],
      })
    }
  }

  const removePortfolio = (id: string) => {
    setPortfolios(portfolios.filter(p => p.id !== id))
  }

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      const certification: Certification = {
        id: `cert-${Date.now()}`,
        name: newCertification.name,
        issuer: newCertification.issuer,
        issue_date: newCertification.issue_date || '',
        expiry_date: newCertification.expiry_date,
        certificate_url: newCertification.certificate_url || '',
      }
      setCertifications([...certifications, certification])
      setNewCertification({
        name: "",
        issuer: "",
        issue_date: "",
        expiry_date: "",
        certificate_url: "",
      })
    }
  }

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Company Profile</h1>
        <Button onClick={handleSave} size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="technologies">Technologies</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company_name"
                      value={companyInfo.company_name}
                      onChange={(e) => handleCompanyInfoChange("company_name", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={companyInfo.website}
                      onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyInfo.description}
                  onChange={(e) => handleCompanyInfoChange("description", e.target.value)}
                  placeholder="Describe your company, services, and expertise..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="established_year">Established Year</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="established_year"
                      type="number"
                      value={companyInfo.established_year}
                      onChange={(e) => handleCompanyInfoChange("established_year", parseInt(e.target.value))}
                      min={1900}
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employee_count"
                      type="number"
                      value={companyInfo.employee_count}
                      onChange={(e) => handleCompanyInfoChange("employee_count", parseInt(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={companyInfo.location}
                      onChange={(e) => handleCompanyInfoChange("location", e.target.value)}
                      placeholder="e.g., Ho Chi Minh City"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_min">Minimum Hourly Rate (USD)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hourly_rate_min"
                      type="number"
                      value={companyInfo.hourly_rate_min}
                      onChange={(e) => handleCompanyInfoChange("hourly_rate_min", parseInt(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_max">Maximum Hourly Rate (USD)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hourly_rate_max"
                      type="number"
                      value={companyInfo.hourly_rate_max}
                      onChange={(e) => handleCompanyInfoChange("hourly_rate_max", parseInt(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INDUSTRIES.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={companyInfo.industries.includes(industry)}
                      onCheckedChange={() => toggleArrayField("industries", industry)}
                    />
                    <Label htmlFor={industry} className="text-sm cursor-pointer">
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{portfolio.title}</h4>
                      <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                      {portfolio.project_url && (
                        <a
                          href={portfolio.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Project
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePortfolio(portfolio.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {portfolio.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Add New Portfolio Item</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Project Title"
                    value={newPortfolio.title || ''}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Project Description"
                    value={newPortfolio.description || ''}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    rows={3}
                  />
                  <Input
                    placeholder="Project URL (optional)"
                    type="url"
                    value={newPortfolio.project_url || ''}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, project_url: e.target.value })}
                  />
                  <Button onClick={addPortfolio} disabled={!newPortfolio.title || !newPortfolio.description}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portfolio Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Awards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{cert.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                      {cert.issue_date && (
                        <p className="text-xs text-muted-foreground">
                          Issued: {cert.issue_date}
                          {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Add New Certification</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Certification Name"
                    value={newCertification.name || ''}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  />
                  <Input
                    placeholder="Issuing Organization"
                    value={newCertification.issuer || ''}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="Issue Date"
                    value={newCertification.issue_date || ''}
                    onChange={(e) => setNewCertification({ ...newCertification, issue_date: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="Expiry Date (optional)"
                    value={newCertification.expiry_date || ''}
                    onChange={(e) => setNewCertification({ ...newCertification, expiry_date: e.target.value })}
                  />
                </div>
                <Button onClick={addCertification} disabled={!newCertification.name || !newCertification.issuer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technologies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technologies & Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TECHNOLOGIES.map((tech) => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech}
                      checked={companyInfo.technologies.includes(tech)}
                      onCheckedChange={() => toggleArrayField("technologies", tech)}
                    />
                    <Label htmlFor={tech} className="text-sm cursor-pointer">
                      {tech}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}