import type { CollectionConfig } from 'payload'

export const SurveyResponses: CollectionConfig = {
  slug: 'survey-responses',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['q1', 'q2', 'q8', 'zip', 'createdAt'],
    group: 'Submissions',
  },
  access: {
    create: () => true, // Anyone can submit
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'q1',
      label: 'Believes injuries are real',
      type: 'select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Unsure', value: 'unsure' },
      ],
    },
    {
      name: 'q2',
      label: 'Impacted by injury',
      type: 'select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
    },
    {
      name: 'q3',
      label: 'Who was impacted',
      type: 'select',
      options: [
        { label: 'Me personally', value: 'me' },
        { label: 'Immediate circle', value: 'immediate' },
        { label: 'Acquaintance', value: 'acquaintance' },
      ],
    },
    {
      name: 'q4',
      label: 'Injury severity',
      type: 'select',
      options: [
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
        { label: 'Permanent', value: 'permanent' },
        { label: 'Death', value: 'death' },
      ],
    },
    {
      name: 'q5',
      label: 'Medical treatment',
      type: 'select',
      options: [
        { label: 'Yes - acknowledged', value: 'yes' },
        { label: 'Partially', value: 'partially' },
        { label: 'No - dismissed', value: 'no' },
      ],
    },
    {
      name: 'q6',
      label: 'Filed CICP claim',
      type: 'select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No - unaware', value: 'no-unaware' },
        { label: 'No - missed deadline', value: 'no-deadline' },
        { label: 'No - too complex', value: 'no-complex' },
        { label: 'No - other', value: 'no-other' },
      ],
    },
    {
      name: 'q7',
      label: 'CICP claim outcome',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Denied - deadline', value: 'denied-deadline' },
        { label: 'Denied - records', value: 'denied-records' },
        { label: 'Denied - proof', value: 'denied-proof' },
        { label: 'Compensated', value: 'compensated' },
      ],
    },
    {
      name: 'q8',
      label: 'Satisfied with system',
      type: 'select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'Somewhat', value: 'somewhat' },
        { label: 'No', value: 'no' },
      ],
    },
    {
      name: 'q9',
      label: 'Desired changes',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Transfer to VICP', value: 'vicp-transfer' },
        { label: 'Extend deadline', value: 'deadline' },
        { label: 'Pain & suffering', value: 'pain-suffering' },
        { label: 'Attorney fees', value: 'attorney-fees' },
        { label: 'Judicial review', value: 'judicial-review' },
        { label: 'Injury table', value: 'injury-table' },
      ],
    },
    {
      name: 'comments',
      label: 'Additional comments',
      type: 'textarea',
    },
    {
      name: 'zip',
      label: 'ZIP Code',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email (if subscribed)',
      type: 'email',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
