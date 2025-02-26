import { z } from 'zod';
import { DEFAULT_COLORS } from '@/lib/constants/colors';

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const HandlePlacementSchema = z.enum(['left', 'right']);

export const TableFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  primary_key: z.boolean().optional(),
});

export const TableSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: PositionSchema,
  color: z.enum(DEFAULT_COLORS),
  fields: z.array(TableFieldSchema),
});

export const TableRelationSchema = z.object({
  id: z.string(),
  source: z.string().describe('Source table ID'),
  target: z.string().describe('Target table ID'),
  source_field: z.string().describe('Source field ID'),
  target_field: z.string().describe('Target field ID'),
  source_handle_placement: HandlePlacementSchema,
  target_handle_placement: HandlePlacementSchema,
});

export const DiagramConfigSchema = z.object({
  tables: z.array(TableSchema),
  relations: z.array(TableRelationSchema),
});
