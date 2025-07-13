import { DualLoader } from '../base/dual-loader'

interface LoadingPageProps {
  isChild?: boolean
}

export function LoadingPage({ isChild = false }: LoadingPageProps) {
  const loader = <DualLoader />

  return isChild ? (
    loader
  ) : (
    <div className="flex min-h-screen items-center justify-center">{loader}</div>
  )
}
