import type { CollectionConfig } from 'payload'

export const Statistics: CollectionConfig = {
  slug: 'statistics',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'program', 'asOfDate'],
    group: 'Data',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'value',
      type: 'text',
      required: true,
    },
    {
      name: 'numericValue',
      type: 'number',
    },
    {
      name: 'program',
      type: 'select',
      required: true,
      options: [
        { label: 'VICP', value: 'vicp' },
        { label: 'CICP', value: 'cicp' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
    {
      name: 'asOfDate',
      type: 'date',
      required: true,
    },
    {
      name: 'displayOnHomepage',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
