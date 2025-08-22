"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { Star, MapPin, Users, Globe, MessageCircle } from "lucide-react"
import type { Company } from "@/lib/supabase"
import Image from "next/image"

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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/30 cursor-pointer hover:-translate-y-1 hover:bg-primary/2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 bg-muted rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              {company.logo_url ? (
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={`${company.company_name} logo`}
                  fill
                  className="object-cover rounded-lg group-hover:brightness-110 transition-all duration-200"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                  <span className="text-primary font-semibold text-lg group-hover:scale-110 transition-transform duration-200">{company.company_name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                {company.company_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors duration-200">
                <div className="flex items-center space-x-1 group-hover:text-primary transition-colors duration-200">
                  <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>{company.location || "Vietnam"}</span>
                </div>
                {company.employee_count && (
                  <div className="flex items-center space-x-1 group-hover:text-primary transition-colors duration-200">
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>{company.employee_count} employees</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-1 group-hover:text-primary transition-colors duration-200">
                    <Globe className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Website</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1 group-hover:scale-105 transition-transform duration-200">
              {renderStars(company.average_rating)}
              <span className="text-sm font-medium ml-1 group-hover:text-primary transition-colors duration-200">{company.average_rating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">{company.total_reviews} reviews</div>
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
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors duration-200">Industries</h4>
            <div className="flex flex-wrap gap-1">
              {company.industries.slice(0, 3).map((industry) => (
                <Badge 
                  key={industry} 
                  variant="secondary" 
                  className="text-xs hover:bg-primary/20 transition-colors duration-200 group-hover:scale-105"
                >
                  {industry}
                </Badge>
              ))}
              {company.industries.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs hover:bg-primary/10 transition-colors duration-200 group-hover:scale-105"
                >
                  +{company.industries.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Technologies */}
        {company.technologies && company.technologies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors duration-200">Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {company.technologies.slice(0, 4).map((tech) => (
                <Badge 
                  key={tech} 
                  variant="outline" 
                  className="text-xs hover:bg-primary/10 hover:border-primary transition-colors duration-200 group-hover:scale-105"
                >
                  {tech}
                </Badge>
              ))}
              {company.technologies.length > 4 && (
                <Badge 
                  variant="outline" 
                  className="text-xs hover:bg-primary/10 transition-colors duration-200 group-hover:scale-105"
                >
                  +{company.technologies.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">Hourly Rate</div>
            <div className="font-semibold text-primary group-hover:text-primary/80 transition-colors duration-200">
              ${company.hourly_rate_min}-${company.hourly_rate_max} USD
            </div>
          </div>
          <div className="text-right group-hover:scale-105 transition-transform duration-200">
            <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">Established</div>
            <div className="font-medium group-hover:text-primary transition-colors duration-200">{company.established_year || "2020"}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <FavoriteButton
            companyId={company.id}
            companyName={company.company_name}
            size="sm"
            className="flex-shrink-0"
          />
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200 hover:scale-105" 
            onClick={() => onViewProfile(company.id)}
          >
            View Profile
          </Button>
          <Button 
            className="flex-1 hover:bg-primary/90 hover:shadow-lg transition-all duration-200 hover:scale-105" 
            onClick={() => onContact(company)}
          >
            <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
