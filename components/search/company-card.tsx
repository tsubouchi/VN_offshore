"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Users, Globe, MessageCircle } from "lucide-react"
import type { Company } from "@/lib/supabase"

interface CompanyCardProps {
  company: Company & {
    industries?: string[]
    technologies?: string[]
  }
  onContact: (company: Company & { industries?: string[]; technologies?: string[] }) => void
  onViewProfile: (companyId: string) => void
}

export function CompanyCard({ company, onContact, onViewProfile }: CompanyCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-accent/50 cursor-pointer">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              {company.logo_url ? (
                <img
                  src={company.logo_url || "/placeholder.svg"}
                  alt={`${company.company_name} logo`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">{company.company_name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {company.company_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{company.location || "Vietnam"}</span>
                </div>
                {company.employee_count && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employee_count} employees</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              {renderStars(company.average_rating)}
              <span className="text-sm font-medium ml-1">{company.average_rating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-muted-foreground">{company.total_reviews} reviews</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {company.description ||
            "Professional offshore development company specializing in modern web and mobile applications."}
        </p>

        {/* Industries */}
        {company.industries && company.industries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Industries</h4>
            <div className="flex flex-wrap gap-1">
              {company.industries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="secondary" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {company.industries.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{company.industries.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Technologies */}
        {company.technologies && company.technologies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {company.technologies.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {company.technologies.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{company.technologies.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Hourly Rate</div>
            <div className="font-semibold text-primary">
              ${company.hourly_rate_min}-${company.hourly_rate_max} USD
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Established</div>
            <div className="font-medium">{company.established_year || "2020"}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onViewProfile(company.id)}>
            View Profile
          </Button>
          <Button className="flex-1" onClick={() => onContact(company)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
