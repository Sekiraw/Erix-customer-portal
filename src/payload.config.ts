import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { hu } from '@payloadcms/translations/languages/hu'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Notifications } from './collections/Notifications'
import { AppSettings } from './globals/AppSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const groupCollections = (group: string, collections: CollectionConfig[]): CollectionConfig[] => {
  return collections.map((collection) => {
    return {
      ...collection,
      admin: {
        ...collection.admin,
        group,
      },
    }
  })
}

const FirstCollectionGroup = [Users, Notifications]
const HiddenCollectionGroup = [Media]

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: {
      Component: {
        path: 'src/app/components/Misc/UserIcon.tsx',
      },
    },
    meta: {
      title: 'Customer Portal',
      titleSuffix: undefined,
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/api/app-icon',
        },
      ],
    },
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: { path: 'src/app/components/Admin/CustomNav.tsx' },
      views: {
        dashboard: {
          Component: '@/components/Dashboard#Dashboard',
        },
      },
      graphics: {
        Logo: { path: 'src/app/components/Misc/Logo.tsx' },
        Icon: { path: 'src/app/components/Misc/Icon.tsx' },
      },
    },
  },
  collections: [
    ...groupCollections('First', FirstCollectionGroup),
    ...groupCollections('Hidden', HiddenCollectionGroup),
  ],
  // globals: [AppSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  i18n: {
    supportedLanguages: {
      hu,
      en,
    },
    fallbackLanguage: 'hu',
    translations: {
      en: {
        general: {
          createNew: '+ Add',
        },
      },
      hu: {
        general: {
          noResults:
            'Nem található {{label}}. Elképzelhető, hogy még nem lett létrehozva, vagy nem felel meg a fenti szűrőknek.',

          createNew: '+ Hozzáadás',
        },
      },
    },
  },
  sharp,
  plugins: [],
})
