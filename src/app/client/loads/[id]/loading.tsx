// src/app/client/loads/[id]/loading.tsx
import { Topbar, PageLayout, LoadDetailSkeleton } from '@/components/ui'

export default function LoadDetailLoading() {
  return (
    <>
      <Topbar title="Load Details" />
      <PageLayout>
        <LoadDetailSkeleton />
      </PageLayout>
    </>
  )
}
