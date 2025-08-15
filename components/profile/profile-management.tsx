"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Upload, ExternalLink, Award } from "lucide-react"

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

export function ProfileManagement() {
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "TechViet Solutions",
    description:
      "Leading Vietnamese software development company specializing in web and mobile applications for Japanese market.",
    website: "https://techviet.com",
    established_year: 2018,
    employee_count: 45,
    location: "Ho Chi Minh City",
    address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City, Vietnam",
    hourly_rate_min: 25,
    hourly_rate_max: 45,
    industries: ["Web Development", "E-commerce", "Fintech"],
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
  })

  const [portfolios, setPortfolios] = useState([
    {
      id: "1",
      title: "E-commerce Platform for Japanese Retailer",
      description:
        "Built a comprehensive e-commerce platform with inventory management, payment integration, and multi-language support.",
      project_url: "https://example-ecommerce.com",
      technologies_used: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      project_duration: "8 months",
      team_size: 6,
    },
  ])

  const [certifications, setCertifications] = useState([
    {
      id: "1",
      name: "ISO 27001:2013 Information Security Management",
      issuer: "BSI Group",
      issue_date: "2023-03-15",
      expiry_date: "2026-03-15",
      certificate_url: "https://example.com/iso27001.pdf",
    },
  ])

  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    project_url: "",
    technologies_used: [] as string[],
    project_duration: "",
    team_size: "",
  })

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    certificate_url: "",
  })

  const handleCompanyInfoChange = (field: string, value: string | number | string[]) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: "industries" | "technologies", value: string) => {
    const current = companyInfo[field]
    const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    handleCompanyInfoChange(field, updated)
  }

  const addPortfolio = () => {
    if (newPortfolio.title && newPortfolio.description) {
      setPortfolios((prev) => [
        ...prev,
        {
          ...newPortfolio,
          id: Date.now().toString(),
          team_size: Number.parseInt(newPortfolio.team_size) || 0,
        },
      ])
      setNewPortfolio({
        title: "",
        description: "",
        project_url: "",
        technologies_used: [],
        project_duration: "",
        team_size: "",
      })
    }
  }

  const removePortfolio = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id))
  }

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.issue_date) {
      setCertifications((prev) => [
        ...prev,
        {
          ...newCertification,
          id: Date.now().toString(),
        },
      ])
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
    setCertifications((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving profile data:", { companyInfo, portfolios, certifications })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Company Profile</h1>
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
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
                  <Input
                    id="company_name"
                    value={companyInfo.company_name}
                    onChange={(e) => handleCompanyInfoChange("company_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyInfo.description}
                  onChange={(e) => handleCompanyInfoChange("description", e.target.value)}
                  rows={4}
                  placeholder="Describe your company, services, and expertise..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="established_year">Established Year</Label>
                  <Input
                    id="established_year"
                    type="number"
                    value={companyInfo.established_year}
                    onChange={(e) => handleCompanyInfoChange("established_year", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    value={companyInfo.employee_count}
                    onChange={(e) => handleCompanyInfoChange("employee_count", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={companyInfo.location}
                    onValueChange={(value) => handleCompanyInfoChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                      <SelectItem value="Hanoi">Hanoi</SelectItem>
                      <SelectItem value="Da Nang">Da Nang</SelectItem>
                      <SelectItem value="Can Tho">Can Tho</SelectItem>
                      <SelectItem value="Hai Phong">Hai Phong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                  placeholder="Street address, district, city, country"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_min">Minimum Hourly Rate (USD)</Label>
                  <Input
                    id="hourly_rate_min"
                    type="number"
                    value={companyInfo.hourly_rate_min}
                    onChange={(e) => handleCompanyInfoChange("hourly_rate_min", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_max">Maximum Hourly Rate (USD)</Label>
                  <Input
                    id="hourly_rate_max"
                    type="number"
                    value={companyInfo.hourly_rate_max}
                    onChange={(e) => handleCompanyInfoChange("hourly_rate_max", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {companyInfo.industries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                      {industry}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayField("industries", industry)} />
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INDUSTRIES.filter((industry) => !companyInfo.industries.includes(industry)).map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        onCheckedChange={() => toggleArrayField("industries", industry)}
                      />
                      <Label htmlFor={`industry-${industry}`} className="text-sm">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {companyInfo.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="flex items-center gap-1">
                      {tech}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayField("technologies", tech)} />
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {TECHNOLOGIES.filter((tech) => !companyInfo.technologies.includes(tech)).map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox id={`tech-${tech}`} onCheckedChange={() => toggleArrayField("technologies", tech)} />
                      <Label htmlFor={`tech-${tech}`} className="text-sm">
                        {tech}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Existing Portfolios */}
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <Card key={portfolio.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">{portfolio.title}</h3>
                    <Button variant="ghost" size="sm" onClick={() => removePortfolio(portfolio.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-4">{portfolio.description}</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <div className="font-medium">{portfolio.project_duration}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Team Size:</span>
                      <div className="font-medium">{portfolio.team_size} people</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Project URL:</span>
                      <div className="font-medium">
                        {portfolio.project_url ? (
                          <a
                            href={portfolio.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Project
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {portfolio.technologies_used.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Portfolio Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio-title">Project Title</Label>
                <Input
                  id="portfolio-title"
                  value={newPortfolio.title}
                  onChange={(e) => setNewPortfolio((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="E.g., E-commerce Platform for Japanese Retailer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio-description">Project Description</Label>
                <Textarea
                  id="portfolio-description"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the project, challenges solved, and outcomes..."
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-url">Project URL (Optional)</Label>
                  <Input
                    id="portfolio-url"
                    value={newPortfolio.project_url}
                    onChange={(e) => setNewPortfolio((prev) => ({ ...prev, project_url: e.target.value }))}
                    placeholder="https://project-url.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-duration">Project Duration</Label>
                  <Input
                    id="portfolio-duration"
                    value={newPortfolio.project_duration}
                    onChange={(e) => setNewPortfolio((prev) => ({ ...prev, project_duration: e.target.value }))}
                    placeholder="E.g., 6 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-team-size">Team Size</Label>
                  <Input
                    id="portfolio-team-size"
                    type="number"
                    value={newPortfolio.team_size}
                    onChange={(e) => setNewPortfolio((prev) => ({ ...prev, team_size: e.target.value }))}
                    placeholder="Number of team members"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Technologies Used</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPortfolio.technologies_used.map((tech) => (
                    <Badge key={tech} variant="outline" className="flex items-center gap-1">
                      {tech}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setNewPortfolio((prev) => ({
                            ...prev,
                            technologies_used: prev.technologies_used.filter((t) => t !== tech),
                          }))
                        }
                      />
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => {
                    if (!newPortfolio.technologies_used.includes(value)) {
                      setNewPortfolio((prev) => ({
                        ...prev,
                        technologies_used: [...prev.technologies_used, value],
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add technology" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNOLOGIES.filter((tech) => !newPortfolio.technologies_used.includes(tech)).map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addPortfolio} className="w-full">
                Add Portfolio Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          {/* Existing Certifications */}
          <div className="space-y-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{cert.name}</h3>
                        <p className="text-muted-foreground">Issued by {cert.issuer}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                          {cert.expiry_date && <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>}
                        </div>
                        {cert.certificate_url && (
                          <a
                            href={cert.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1 mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Certification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cert-name">Certification Name</Label>
                <Input
                  id="cert-name"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="E.g., ISO 27001:2013 Information Security Management"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-issuer">Issuing Organization</Label>
                <Input
                  id="cert-issuer"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification((prev) => ({ ...prev, issuer: e.target.value }))}
                  placeholder="E.g., BSI Group"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cert-issue-date">Issue Date</Label>
                  <Input
                    id="cert-issue-date"
                    type="date"
                    value={newCertification.issue_date}
                    onChange={(e) => setNewCertification((prev) => ({ ...prev, issue_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-expiry-date">Expiry Date (Optional)</Label>
                  <Input
                    id="cert-expiry-date"
                    type="date"
                    value={newCertification.expiry_date}
                    onChange={(e) => setNewCertification((prev) => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-url">Certificate URL (Optional)</Label>
                <Input
                  id="cert-url"
                  value={newCertification.certificate_url}
                  onChange={(e) => setNewCertification((prev) => ({ ...prev, certificate_url: e.target.value }))}
                  placeholder="https://certificate-url.com"
                />
              </div>
              <Button onClick={addCertification} className="w-full">
                Add Certification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Recommended: Square image, minimum 200x200px</p>
                </div>

                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover Image
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: 1200x400px, showcasing your office or team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
