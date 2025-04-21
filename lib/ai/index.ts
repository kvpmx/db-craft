import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import {
  DiagramConfigSchema,
  TableSchema,
  TableFieldSchema,
  TableRelationSchema,
} from '../constants/schema';
import { DatabaseType, NAMING_CONVENTIONS } from '../constants/diagram';

import type { ZodObject, ZodRawShape } from 'zod';

const keysOf = <T extends ZodRawShape>(obj: ZodObject<T>) => {
  return Object.keys(obj.shape).join(', ');
};

const minify = (str: string) => {
  return str.replace(/\s+/g, '');
};

export const getSystemPrompt = (type: DatabaseType | undefined = DatabaseType.MySQL) => {
  return minify(`
    You are a database schema diagram generator.
    You will be given a prompt and you will generate a diagram of a database schema based on the prompt.

    The diagram should be in JSON format.
    The JSON should contain the following fields: ${keysOf(DiagramConfigSchema)}.
    Each table should have the following fields: ${keysOf(TableSchema)}.
    Each field should have the following fields: ${keysOf(TableFieldSchema)}.
    Each relation should have the following fields: ${keysOf(TableRelationSchema)}.
    Do not reference non-existing tables or fields!

    The diagram should be generated based on the given prompt.
    Names of the tables in fields should be in ${NAMING_CONVENTIONS[type]} case.
    Primary key field of the table should just have 'id' name (in proper case).
    Do not prefix field names with the table name.
    If the specified prompt has a SQL script, then use the names from this script, ignoring the naming conventions.

    Tables should not be very close to each other.
    Width of the table is 200px, so the distance between the tables should be at least 300px (+100px for space between tables).
    The relations between the tables will be represented as smoothstep lines. 
    If you can figure it out, choose the position of the tables in such a way to not cross lines between each other.
  `);
};

export const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const generateDiagramObject = async (prompt: string, type: DatabaseType | undefined) => {
  const { object } = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: DiagramConfigSchema,
    system: getSystemPrompt(type),
    prompt,
  });

  return object;
};
