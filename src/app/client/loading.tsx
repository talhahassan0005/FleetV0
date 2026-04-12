// src/app/client/loading.tsx
import { Topbar, PageLayout, LoadTableSkeleton } from '@/components/ui'

export default function ClientLoading() {
  return (
    <>
      <Topbar title="My Loads" />
      <PageLayout>
        <LoadTableSkeleton />
      </PageLayout>
    </>
  )
}
