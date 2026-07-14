import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Provide a valid enterprise email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const reportIncidentSchema = z.object({
  title: z.string().min(3, 'Incident title must have at least 3 characters'),
  description: z.string().min(10, 'Provide a detailed description of the incident (min 10 chars)'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(2, 'Incident location is required (e.g. Zone B3)')
});

export type ReportIncidentInput = z.infer<typeof reportIncidentSchema>;
