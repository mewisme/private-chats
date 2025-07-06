'use client'

import { Checkbox } from '@/components/animate-ui/base/checkbox'
import { Label } from '@/components/ui/label'
import { useSettings, type Settings } from '@/hooks/use-settings'

interface SettingItemProps {
  id: keyof Settings
  label: string
}

export function SettingItem({ id, label }: SettingItemProps) {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={settings[id] ?? false}
        onCheckedChange={(checked) => updateSetting(id, checked)}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}
