import { CompanyReviewsClient } from "./reviews-client"

export default async function CompanyReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <CompanyReviewsClient companyId={id} />
}