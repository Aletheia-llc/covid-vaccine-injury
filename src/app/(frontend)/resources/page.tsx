import { getPayload } from 'payload'
import config from '@payload-config'
import ResourcesClient from './ResourcesClient'

// Revalidate every 60 seconds so CMS changes appear quickly
export const revalidate = 60

// Map CMS categories to display categories
const categoryMap: Record<string, { label: string; icon: string }> = {
  'cicp-stats': { label: 'CICP Data', icon: '📊' },
  'vicp-stats': { label: 'VICP Data', icon: '📈' },
  'prep-act': { label: 'Regulatory', icon: '📜' },
  'gao': { label: 'Oversight', icon: '🔍' },
  'legislation': { label: 'Legal', icon: '⚖️' },
}

export default async function ResourcesPage() {
  const payload = await getPayload({ config })

  const resourcesData = await payload.find({
    collection: 'resources',
    limit: 100,
    sort: 'order',
  })

  const resources = resourcesData.docs.map((doc) => {
    const catInfo = categoryMap[doc.category] || { label: doc.category, icon: '📄' }

    // Determine program based on category
    let program = 'Both'
    if (doc.category === 'cicp-stats' || doc.category === 'prep-act') {
      program = 'CICP'
    } else if (doc.category === 'vicp-stats') {
      program = 'VICP'
    } else if (doc.category === 'gao' || doc.category === 'legislation') {
      program = 'Both'
    }

    return {
      category: catInfo.label,
      name: doc.title,
      program,
      description: doc.description || '',
      frequency: 'As updated',
      url: doc.url,
      icon: catInfo.icon,
    }
  })

  // Calculate counts
  const counts = {
    total: resources.length,
    cicp: resources.filter(r => r.program === 'CICP').length,
    vicp: resources.filter(r => r.program === 'VICP').length,
    both: resources.filter(r => r.program === 'Both').length,
  }

  return <ResourcesClient resources={resources} counts={counts} />
}
