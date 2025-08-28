import { icons } from "./icons"

export function IconForNav({ name }: { name: string }) {
  const Icon = icons[name] || (() => <div className="w-4 h-4" />)
  return <Icon className="w-4 h-4" />
}
