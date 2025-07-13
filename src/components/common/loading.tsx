import { DualLoader } from '../base/dual-loader'

export function Loading() {
  const loader = <DualLoader />

  return <div className="flex min-h-screen items-center justify-center">{loader}</div>
}
