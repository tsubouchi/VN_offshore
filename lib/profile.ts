import { supabase, isSupabaseAvailable } from './supabase'

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  description: string
  website: string
  established_year: number
  employee_count: number
  location: string
  address: string
  hourly_rate_min: number
  hourly_rate_max: number
  currency: string
  business_hours?: Record<string, unknown>
  languages?: string[]
  certifications?: string[]
  social_links?: Record<string, unknown>
  founded_date?: string
  legal_name?: string
  tax_id?: string
  is_featured?: boolean
}

export interface Portfolio {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  client_name?: string
  completion_date?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  certificate_url: string
}

export interface ProfileUpdateData {
  companyInfo: Partial<CompanyProfile>
  portfolios?: Portfolio[]
  certifications?: Certification[]
  technologies?: string[]
  industries?: string[]
}

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  if (!isSupabaseAvailable() || !supabase) {
    // Return mock data for demo
    return {
      id: "1",
      user_id: userId,
      company_name: "Demo Company",
      description: "A demo company profile",
      website: "https://demo.com",
      established_year: 2020,
      employee_count: 50,
      location: "Ho Chi Minh City",
      address: "123 Demo Street",
      hourly_rate_min: 25,
      hourly_rate_max: 50,
      currency: "USD"
    }
  }

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return null
  }
}

export async function updateCompanyProfile(
  userId: string,
  profileData: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    // Mock success for demo
    console.log('Mock profile update:', profileData)
    return { success: true }
  }

  try {
    // Update company info
    if (profileData.companyInfo) {
      const { error: companyError } = await supabase
        .from('companies')
        .update(profileData.companyInfo)
        .eq('user_id', userId)

      if (companyError) throw companyError
    }

    // Get company ID for related tables
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!company) throw new Error('Company not found')

    // Update technologies
    if (profileData.technologies) {
      // Delete existing technologies
      await supabase
        .from('company_technologies')
        .delete()
        .eq('company_id', company.id)

      // Insert new technologies
      if (profileData.technologies.length > 0) {
        const techData = profileData.technologies.map(tech => ({
          company_id: company.id,
          technology_name: tech
        }))

        const { error: techError } = await supabase
          .from('company_technologies')
          .insert(techData)

        if (techError) throw techError
      }
    }

    // Update portfolios
    if (profileData.portfolios) {
      // Delete existing portfolios
      await supabase
        .from('company_projects')
        .delete()
        .eq('company_id', company.id)

      // Insert new portfolios
      if (profileData.portfolios.length > 0) {
        const portfolioData = profileData.portfolios.map(portfolio => ({
          company_id: company.id,
          project_name: portfolio.title,
          description: portfolio.description,
          project_url: portfolio.project_url,
          image_url: portfolio.image_url,
          technologies: portfolio.technologies,
          client_name: portfolio.client_name,
          completion_date: portfolio.completion_date
        }))

        const { error: portfolioError } = await supabase
          .from('company_projects')
          .insert(portfolioData)

        if (portfolioError) throw portfolioError
      }
    }

    // Update certifications (would need a certifications table)
    if (profileData.certifications) {
      // Store certifications in company's certifications field as JSON for now
      const { error: certError } = await supabase
        .from('companies')
        .update({ 
          certifications: profileData.certifications.map(cert => cert.name)
        })
        .eq('id', company.id)

      if (certError) throw certError
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }
  }
}

export async function getCompanyPortfolios(companyId: string): Promise<Portfolio[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('company_projects')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(project => ({
      id: project.id,
      title: project.project_name,
      description: project.description,
      image_url: project.image_url || '',
      project_url: project.project_url || '',
      technologies: project.technologies || [],
      client_name: project.client_name,
      completion_date: project.completion_date
    })) || []
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return []
  }
}

export async function getCompanyTechnologies(companyId: string): Promise<string[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return ['React', 'Node.js', 'TypeScript'] // Mock data
  }

  try {
    const { data, error } = await supabase
      .from('company_technologies')
      .select('technology_name')
      .eq('company_id', companyId)

    if (error) throw error
    return data?.map(tech => tech.technology_name) || []
  } catch (error) {
    console.error('Error fetching technologies:', error)
    return []
  }
}

export async function uploadCompanyFile(
  companyId: string,
  file: File,
  fileType: 'logo' | 'cover' | 'portfolio' | 'certificate' | 'document'
): Promise<{ url: string | null; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    // Mock upload for demo
    console.log('Mock file upload:', file.name, fileType)
    return { url: URL.createObjectURL(file) }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${companyId}/${fileType}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('company-files')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-files')
      .getPublicUrl(fileName)

    // Save file record to database
    await supabase
      .from('company_files')
      .insert({
        company_id: companyId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type
      })

    return { url: publicUrl }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }
  }
}