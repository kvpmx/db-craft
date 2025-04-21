import { MySQLGenerator } from './mysql';
import { PostgreSQLGenerator } from './postgresql';
import { SQLServerGenerator } from './sqlserver';
import { DatabaseType } from '../constants/diagram';

import type { BaseSQLGenerator } from './base';
import type { DiagramConfig } from '@/types/diagram';

const GENERATORS_MAP = {
  [DatabaseType.MySQL]: MySQLGenerator,
  [DatabaseType.PostgreSQL]: PostgreSQLGenerator,
  [DatabaseType.SQLServer]: SQLServerGenerator,
};

const createGenerator = (dbType: DatabaseType, config: DiagramConfig): BaseSQLGenerator | never => {
  const GeneratorConstructor = GENERATORS_MAP[dbType];
  if (GeneratorConstructor) return new GeneratorConstructor(config);
  throw new Error(`Unsupported database type: ${dbType}`);
};

export const configToSQL = <T extends DatabaseType>(
  dbType: T,
  config: DiagramConfig<T>
): string => {
  return createGenerator(dbType, config).toSQL();
};
