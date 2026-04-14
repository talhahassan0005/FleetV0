// src/app/client/profile/loading.tsx
import { Topbar, PageLayout, ProfileSkeleton } from '@/components/ui'

export default function ProfileLoading() {
  return (
    <>
      <Topbar title="My Profile" />
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    </>
  )
}
