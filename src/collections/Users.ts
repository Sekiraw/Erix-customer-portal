import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    components: {
      afterListTable: ['src/app/components/Admin/AdminListPaginationClient.tsx'],
    },
  },
  labels: {
    singular: {
      en: 'User',
      hu: 'Felhasználó',
    },
    plural: {
      en: 'Users',
      hu: 'Felhasználók',
    },
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      label: {
        en: 'Role',
        hu: 'Szerepkör',
      },
      required: true,
      defaultValue: 'client',
      options: [
        {
          label: { en: 'Client', hu: 'Ügyfél' },
          value: 'client',
        },
        {
          label: { en: 'Employee', hu: 'Munkavállaló' },
          value: 'employee',
        },
        {
          label: { en: 'Manager', hu: 'Vezető' },
          value: 'manager',
        },
        {
          label: { en: 'Operations / IT Staff', hu: 'Üzemeltetés / IT munkatárs' },
          value: 'it_staff',
        },
      ],
    },
    {
      name: 'firstName',
      type: 'text',
      label: {
        en: 'First Name',
        hu: 'Keresztnév',
      },
      required: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: {
        en: 'Last Name',
        hu: 'Vezetéknév',
      },
      required: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      label: { en: 'Terms Accepted At', hu: 'ÁSZF elfogadva' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'termsAcceptedIp',
      type: 'text',
      label: { en: 'Terms Accepted IP', hu: 'ÁSZF elfogadás IP' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'termsVersion',
      type: 'text',
      label: { en: 'Terms Version', hu: 'ÁSZF verzió' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    // Email verification
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Email Verified', hu: 'E-mail megerősítve' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'emailVerifiedAt',
      type: 'date',
      label: { en: 'Email Verified At', hu: 'E-mail megerősítve' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'emailVerificationToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'emailVerificationTokenExpiresAt',
      type: 'date',
      admin: { hidden: true },
    },
    // Failed login tracking
    {
      name: 'failedLoginAttempts',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
    },
    {
      name: 'lastFailedLoginAt',
      type: 'date',
      admin: { hidden: true },
    },
    // Password reset
    {
      name: 'resetPasswordToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'resetPasswordTokenExpiresAt',
      type: 'date',
      admin: { hidden: true },
    },
    // Two-factor authentication
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Two-Factor Auth Enabled', hu: '2FA engedélyezve' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      admin: { hidden: true },
    },
  ],
}
