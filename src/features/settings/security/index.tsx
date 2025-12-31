import { ContentSection } from '../components/content-section'
import { SecurityForm } from './security-form'

export function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Manage your password, two-factor authentication, and session security.'
    >
      <SecurityForm />
    </ContentSection>
  )
}
