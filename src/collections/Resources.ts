import type { CollectionConfig } from 'payload'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'sourceType'],
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'VICP Statistics', value: 'vicp-stats' },
        { label: 'CICP Statistics', value: 'cicp-stats' },
        { label: 'PREP Act', value: 'prep-act' },
        { label: 'GAO Reports', value: 'gao' },
        { label: 'Legislation', value: 'legislation' },
      ],
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Government', value: 'government' },
        { label: 'Academic', value: 'academic' },
        { label: 'Legal', value: 'legal' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
