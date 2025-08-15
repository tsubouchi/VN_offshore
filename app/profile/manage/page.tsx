import { ProfileManagement } from "@/components/profile/profile-management"

export default function ProfileManagePage() {
  // TODO: Get company ID from authenticated user
  const companyId = "1"

  return <ProfileManagement companyId={companyId} />
}
