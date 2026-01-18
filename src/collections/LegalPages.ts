import type { CollectionConfig } from 'payload'

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: {
    singular: 'Legal Page',
    plural: 'Legal Pages',
  },
  admin: {
    useAsTitle: 'title',
    description: 'Manage Privacy Policy and Terms of Service content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Page title (e.g., "Privacy Policy" or "Terms of Service")',
      },
    },
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Privacy Policy', value: 'privacy' },
        { label: 'Terms of Service', value: 'terms' },
      ],
      admin: {
        description: 'URL slug for this page',
      },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
      admin: {
        description: 'Date shown as "Last Updated" on the page',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMMM d, yyyy',
        },
      },
    },
    {
      name: 'quickSummary',
      type: 'group',
      label: 'Quick Summary',
      admin: {
        description: 'Summary box shown at the top of the page',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show quick summary',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Summary Items',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g., "What we collect"',
              },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g., "Survey responses, email (if you opt in)"',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Content Sections',
      required: true,
      admin: {
        description: 'Add sections to the legal page',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Section title (e.g., "Information We Collect")',
          },
        },
        {
          name: 'anchor',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'URL anchor (e.g., "information-we-collect")',
            description: 'Used for table of contents links',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          admin: {
            description: 'Section content - supports formatting, lists, tables, and links',
          },
        },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: {
        description: 'Contact email shown on the page (e.g., privacy@covidvaccineinjury.us)',
      },
    },
  ],
}
