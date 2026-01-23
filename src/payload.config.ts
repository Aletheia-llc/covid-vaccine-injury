import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { FAQs } from './collections/FAQs'
import { Statistics } from './collections/Statistics'
import { Resources } from './collections/Resources'
import { FormSubmissions } from './collections/FormSubmissions'
import { SurveyResponses } from './collections/SurveyResponses'
import { Subscribers } from './collections/Subscribers'
import { LegalPages } from './collections/LegalPages'
import { assertValidEnv } from './lib/env-validation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate environment variables at startup
assertValidEnv()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | U.S. Covid Vaccine Injuries',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖️</text></svg>",
        },
      ],
    },
    components: {
      graphics: {
        Logo: '/components/AdminLogo',
        Icon: '/components/AdminIcon',
      },
      beforeDashboard: ['/components/SurveyDashboard'],
    },
  },
  collections: [Users, FAQs, Statistics, Resources, FormSubmissions, SurveyResponses, Subscribers, LegalPages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
  sharp,
})
