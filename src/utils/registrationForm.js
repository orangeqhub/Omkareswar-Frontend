import { z } from 'zod';

export const ROLE_TO_FORM_TYPE = {
  buyer: 'BUYER',
  seller: 'SELLER',
  employee: 'EMPLOYEE',
  mediator: 'MEDIATOR',
};

export const FORM_TYPE_TO_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  EMPLOYEE: 'employee',
  MEDIATOR: 'mediator',
};

export const FIELD_TYPE_LABELS = {
  text: 'Text',
  textarea: 'Text Area',
  number: 'Number',
  email: 'Email',
  phone: 'Phone',
  password: 'Password',
  date: 'Date',
  select: 'Dropdown',
  radio: 'Radio Buttons',
  checkbox: 'Checkbox',
  file: 'File Upload',
};

// Camel/snake/kebab -> "Title Case" for auto-generated labels.
export function toTitleCase(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

function requiredMessage(field) {
  return `${field.label || toTitleCase(field.fieldKey)} is required.`;
}

function zodForField(field, isRequired) {
  const label = field.label || toTitleCase(field.fieldKey);
  const msg = requiredMessage(field);

  if (isRequired) {
    switch (field.fieldType) {
      case 'number':
        return z.coerce.number().refine((v) => Number.isFinite(v), { message: `${label} must be a valid number.` });
      case 'email':
        return z.string().min(1, msg).email(`Enter a valid email for ${label}.`);
      case 'phone':
        return z.string().min(1, msg).regex(INDIAN_MOBILE, `${label} must be a valid 10 digit mobile number.`);
      case 'password':
        return z.string().min(1, msg).min(6, `${label} must be at least 6 characters.`);
      case 'date':
        return z.string().min(1, msg).refine((v) => !Number.isNaN(Date.parse(v)), { message: `${label} must be a valid date.` });
      case 'checkbox':
        return z.boolean().refine((v) => v === true, { message: `${label} must be accepted.` });
      case 'select':
      case 'radio': {
        const values = (field.options || []).map((o) => (typeof o === 'object' ? String(o.value) : String(o)));
        return z.string().min(1, msg).refine((v) => values.includes(v), { message: `Please select a valid option for ${label}.` });
      }
      case 'file':
        return z.any().refine((v) => (typeof FileList !== 'undefined' && v instanceof FileList ? v.length > 0 : !!v), { message: msg });
      default:
        return z.string().min(1, msg);
    }
  }

  switch (field.fieldType) {
    case 'number':
      return z.coerce.number().optional().or(z.literal(''));
    case 'email':
      return z.string().email(`Enter a valid email for ${label}.`).optional().or(z.literal(''));
    case 'phone':
      return z.string().regex(INDIAN_MOBILE, `${label} must be a valid 10 digit mobile number.`).optional().or(z.literal(''));
    case 'password':
      return z.string().min(6, `${label} must be at least 6 characters.`).optional().or(z.literal(''));
    case 'date':
      return z.string().optional().or(z.literal(''));
    case 'checkbox':
      return z.boolean().optional().default(false);
    case 'select':
    case 'radio': {
      const values = (field.options || []).map((o) => (typeof o === 'object' ? String(o.value) : String(o)));
      return z.string().optional().or(z.literal('')).refine((v) => !v || values.includes(v), { message: `Please select a valid option for ${label}.` });
    }
    case 'file':
      return z.any();
    default:
      return z.string().optional().or(z.literal(''));
  }
}

/**
 * Builds a zod schema from a fetched registration form config.
 * Returns a plain z.object - callers add cross-field refinements (acceptTerms,
 * password match) and merge it with their static form fields.
 */
export function buildRegistrationSchema(fields) {
  const shape = {};
  (fields || []).forEach((field) => {
    shape[field.fieldKey] = zodForField(field, field.isRequired);
  });
  return z.object(shape);
}

export function buildRegistrationRefinements(schema, fields) {
  const keys = new Set((fields || []).map((f) => f.fieldKey));
  let refined = schema;
  if (keys.has('password') && keys.has('confirmPassword')) {
    refined = refined.refine(
      (data) => {
        if (!data.confirmPassword) return false;
        return data.password === data.confirmPassword;
      },
      { message: 'Passwords do not match', path: ['confirmPassword'] }
    );
  }
  return refined;
}

export function isFileField(field) {
  return field.fieldType === 'file';
}
