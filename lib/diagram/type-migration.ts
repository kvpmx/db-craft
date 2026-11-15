import { DATABASE_FIELD_TYPES, DatabaseType } from '@/lib/constants/diagram';
import type { DiagramConfig } from '@/types/diagram';

type TypeKind =
  | 'tinyint'
  | 'smallint'
  | 'mediumint'
  | 'int'
  | 'bigint'
  | 'serial'
  | 'bigserial'
  | 'decimal'
  | 'money'
  | 'float'
  | 'double'
  | 'boolean'
  | 'char'
  | 'varchar'
  | 'nchar'
  | 'nvarchar'
  | 'text'
  | 'longtext'
  | 'ntext'
  | 'binary'
  | 'varbinary'
  | 'blob'
  | 'longblob'
  | 'date'
  | 'time'
  | 'timetz'
  | 'datetime'
  | 'timestamp'
  | 'timestamptz'
  | 'year'
  | 'interval'
  | 'json'
  | 'jsonb'
  | 'xml'
  | 'uuid'
  | 'enum'
  | 'set'
  | 'inet'
  | 'cidr'
  | 'macaddr'
  | 'geometry'
  | 'point'
  | 'linestring'
  | 'polygon'
  | 'multipoint'
  | 'multilinestring'
  | 'multipolygon'
  | 'geometrycollection'
  | 'geography';

const TYPE_KINDS: Record<string, TypeKind> = {
  'tinyint': 'tinyint',
  'smallint': 'smallint',
  'int2': 'smallint',
  'mediumint': 'mediumint',
  'int': 'int',
  'integer': 'int',
  'int4': 'int',
  'bigint': 'bigint',
  'int8': 'bigint',
  'unsigned big int': 'bigint',
  'serial': 'serial',
  'bigserial': 'bigserial',
  'decimal': 'decimal',
  'dec': 'decimal',
  'numeric': 'decimal',
  'fixed': 'decimal',
  'number': 'decimal',
  'money': 'money',
  'smallmoney': 'money',
  'float': 'float',
  'real': 'float',
  'binary_float': 'float',
  'double': 'double',
  'double precision': 'double',
  'binary_double': 'double',
  'boolean': 'boolean',
  'bool': 'boolean',
  'bit': 'boolean',
  'char': 'char',
  'character': 'char',
  'varchar': 'varchar',
  'varchar2': 'varchar',
  'character varying': 'varchar',
  'nchar': 'nchar',
  'nvarchar': 'nvarchar',
  'nvarchar2': 'nvarchar',
  'tinytext': 'text',
  'text': 'text',
  'mediumtext': 'text',
  'longtext': 'longtext',
  'clob': 'longtext',
  'long': 'longtext',
  'ntext': 'ntext',
  'nclob': 'ntext',
  'binary': 'binary',
  'raw': 'binary',
  'varbinary': 'varbinary',
  'tinyblob': 'blob',
  'blob': 'blob',
  'mediumblob': 'blob',
  'bytea': 'blob',
  'image': 'blob',
  'long raw': 'blob',
  'longblob': 'longblob',
  'date': 'date',
  'time': 'time',
  'timetz': 'timetz',
  'datetime': 'datetime',
  'datetime2': 'datetime',
  'smalldatetime': 'datetime',
  'timestamp': 'timestamp',
  'timestamptz': 'timestamptz',
  'datetimeoffset': 'timestamptz',
  'timestamp with time zone': 'timestamptz',
  'timestamp with local time zone': 'timestamptz',
  'year': 'year',
  'interval': 'interval',
  'interval year to month': 'interval',
  'interval day to second': 'interval',
  'json': 'json',
  'jsonb': 'jsonb',
  'xml': 'xml',
  'xmltype': 'xml',
  'uuid': 'uuid',
  'uniqueidentifier': 'uuid',
  'enum': 'enum',
  'set': 'set',
  'inet': 'inet',
  'inet4': 'inet',
  'inet6': 'inet',
  'cidr': 'cidr',
  'macaddr': 'macaddr',
  'geometry': 'geometry',
  'point': 'point',
  'linestring': 'linestring',
  'path': 'linestring',
  'polygon': 'polygon',
  'multipoint': 'multipoint',
  'multilinestring': 'multilinestring',
  'multipolygon': 'multipolygon',
  'geometrycollection': 'geometrycollection',
  'geography': 'geography',
};

const MYSQL_TYPES: Partial<Record<TypeKind, string>> = {
  tinyint: 'tinyint',
  smallint: 'smallint',
  mediumint: 'mediumint',
  int: 'int',
  bigint: 'bigint',
  serial: 'int',
  bigserial: 'bigint',
  decimal: 'decimal',
  money: 'decimal(19,4)',
  float: 'float',
  double: 'double',
  boolean: 'tinyint(1)',
  char: 'char',
  varchar: 'varchar',
  nchar: 'char',
  nvarchar: 'varchar',
  text: 'text',
  longtext: 'longtext',
  ntext: 'longtext',
  binary: 'binary',
  varbinary: 'varbinary',
  blob: 'blob',
  longblob: 'longblob',
  date: 'date',
  time: 'time',
  timetz: 'time',
  datetime: 'datetime',
  timestamp: 'timestamp',
  timestamptz: 'timestamp',
  year: 'year',
  json: 'json',
  jsonb: 'json',
  xml: 'longtext',
  uuid: 'char(36)',
  enum: 'enum',
  set: 'set',
  inet: 'varchar(45)',
  cidr: 'varchar(43)',
  macaddr: 'varchar(17)',
  geometry: 'geometry',
  point: 'point',
  linestring: 'linestring',
  polygon: 'polygon',
  multipoint: 'multipoint',
  multilinestring: 'multilinestring',
  multipolygon: 'multipolygon',
  geometrycollection: 'geometrycollection',
  geography: 'geometry',
};

const TYPE_EQUIVALENTS: Record<DatabaseType, Partial<Record<TypeKind, string>>> = {
  [DatabaseType.MySQL]: MYSQL_TYPES,
  [DatabaseType.MariaDB]: {
    ...MYSQL_TYPES,
    uuid: 'uuid',
    inet: 'inet6',
  },
  [DatabaseType.PostgreSQL]: {
    tinyint: 'smallint',
    smallint: 'smallint',
    mediumint: 'integer',
    int: 'integer',
    bigint: 'bigint',
    serial: 'serial',
    bigserial: 'bigserial',
    decimal: 'numeric',
    money: 'money',
    float: 'real',
    double: 'double precision',
    boolean: 'boolean',
    char: 'char',
    varchar: 'varchar',
    nchar: 'char',
    nvarchar: 'varchar',
    text: 'text',
    longtext: 'text',
    ntext: 'text',
    binary: 'bytea',
    varbinary: 'bytea',
    blob: 'bytea',
    longblob: 'bytea',
    date: 'date',
    time: 'time',
    timetz: 'timetz',
    datetime: 'timestamp',
    timestamp: 'timestamp',
    timestamptz: 'timestamptz',
    year: 'smallint',
    interval: 'interval',
    json: 'json',
    jsonb: 'jsonb',
    xml: 'xml',
    uuid: 'uuid',
    enum: 'enum',
    inet: 'inet',
    cidr: 'cidr',
    macaddr: 'macaddr',
    point: 'point',
    linestring: 'path',
    polygon: 'polygon',
  },
  [DatabaseType.SQLServer]: {
    tinyint: 'tinyint',
    smallint: 'smallint',
    mediumint: 'int',
    int: 'int',
    bigint: 'bigint',
    serial: 'int',
    bigserial: 'bigint',
    decimal: 'decimal',
    money: 'money',
    float: 'real',
    double: 'float',
    boolean: 'bit',
    char: 'char',
    varchar: 'varchar',
    nchar: 'nchar',
    nvarchar: 'nvarchar',
    text: 'text',
    longtext: 'varchar(max)',
    ntext: 'ntext',
    binary: 'binary',
    varbinary: 'varbinary',
    blob: 'varbinary(max)',
    longblob: 'varbinary(max)',
    date: 'date',
    time: 'time',
    timetz: 'time',
    datetime: 'datetime2',
    timestamp: 'datetime2',
    timestamptz: 'datetimeoffset',
    year: 'smallint',
    json: 'nvarchar(max)',
    jsonb: 'nvarchar(max)',
    xml: 'xml',
    uuid: 'uniqueidentifier',
    inet: 'varchar(45)',
    cidr: 'varchar(43)',
    macaddr: 'varchar(17)',
    geometry: 'geometry',
    point: 'geometry',
    linestring: 'geometry',
    polygon: 'geometry',
    multipoint: 'geometry',
    multilinestring: 'geometry',
    multipolygon: 'geometry',
    geometrycollection: 'geometry',
    geography: 'geography',
  },
  [DatabaseType.SQLite]: {
    tinyint: 'tinyint',
    smallint: 'smallint',
    mediumint: 'mediumint',
    int: 'integer',
    bigint: 'bigint',
    serial: 'integer',
    bigserial: 'integer',
    decimal: 'decimal',
    money: 'numeric',
    float: 'float',
    double: 'double',
    boolean: 'boolean',
    char: 'char',
    varchar: 'varchar',
    nchar: 'char',
    nvarchar: 'varchar',
    text: 'text',
    longtext: 'text',
    ntext: 'text',
    binary: 'blob',
    varbinary: 'blob',
    blob: 'blob',
    longblob: 'blob',
    date: 'date',
    time: 'text',
    timetz: 'text',
    datetime: 'datetime',
    timestamp: 'datetime',
    timestamptz: 'datetime',
    year: 'integer',
    json: 'json',
    jsonb: 'json',
    xml: 'text',
    uuid: 'text',
    inet: 'text',
    cidr: 'text',
    macaddr: 'text',
  },
  [DatabaseType.Oracle]: {
    tinyint: 'number(3)',
    smallint: 'number(5)',
    mediumint: 'number(7)',
    int: 'number(10)',
    bigint: 'number(19)',
    serial: 'number(10)',
    bigserial: 'number(19)',
    decimal: 'number',
    money: 'number(19,4)',
    float: 'binary_float',
    double: 'binary_double',
    boolean: 'boolean',
    char: 'char',
    varchar: 'varchar2',
    nchar: 'nchar',
    nvarchar: 'nvarchar2',
    text: 'clob',
    longtext: 'clob',
    ntext: 'nclob',
    binary: 'raw',
    varbinary: 'raw',
    blob: 'blob',
    longblob: 'blob',
    date: 'date',
    datetime: 'timestamp',
    timestamp: 'timestamp',
    timestamptz: 'timestamp with time zone',
    year: 'number(4)',
    interval: 'interval day to second',
    json: 'clob',
    jsonb: 'clob',
    xml: 'xmltype',
    uuid: 'raw(16)',
    inet: 'varchar2(45)',
    cidr: 'varchar2(43)',
    macaddr: 'varchar2(17)',
  },
};

// Length/precision arguments are carried over only to types that accept them.
const PARAMETERIZED_TYPES = new Set([
  'char',
  'nchar',
  'varchar',
  'nvarchar',
  'varchar2',
  'nvarchar2',
  'binary',
  'varbinary',
  'raw',
  'decimal',
  'numeric',
  'dec',
  'fixed',
  'number',
  'bit',
  'varbit',
  'time',
  'timetz',
  'timestamp',
  'timestamptz',
  'datetime2',
  'datetimeoffset',
]);

export interface ParsedFieldType {
  base: string;
  params: string;
}

export interface TypeMismatch {
  /** Lowercased type name without arguments, e.g. `varchar` for `VARCHAR(100)` */
  sourceType: string;
  /** Target type suggested by the built-in equivalence table */
  suggestion: string | null;
  fields: { table: string; field: string }[];
}

export type TypeMapping = Record<string, string>;

export const parseFieldType = (type: string): ParsedFieldType => {
  const trimmed = type.trim();
  const paramsStart = trimmed.indexOf('(');

  if (paramsStart === -1) return { base: trimmed.toLowerCase(), params: '' };

  return {
    base: trimmed.slice(0, paramsStart).trim().toLowerCase(),
    params: trimmed.slice(paramsStart).trim(),
  };
};

export const isTypeSupported = (type: string, database: DatabaseType) => {
  const { base } = parseFieldType(type);
  return (DATABASE_FIELD_TYPES[database] as readonly string[]).includes(base);
};

export const suggestTypeMapping = (sourceType: string, target: DatabaseType) => {
  const kind = TYPE_KINDS[parseFieldType(sourceType).base];
  const suggestion = kind ? TYPE_EQUIVALENTS[target][kind] : undefined;

  return suggestion && isTypeSupported(suggestion, target) ? suggestion : null;
};

export const findTypeMismatches = (schema: DiagramConfig, target: DatabaseType): TypeMismatch[] => {
  const mismatches = new Map<string, TypeMismatch>();

  for (const table of schema.tables ?? []) {
    for (const field of table.fields) {
      if (isTypeSupported(field.type, target)) continue;

      const { base } = parseFieldType(field.type);
      let mismatch = mismatches.get(base);

      if (!mismatch) {
        mismatch = { sourceType: base, suggestion: suggestTypeMapping(base, target), fields: [] };
        mismatches.set(base, mismatch);
      }

      mismatch.fields.push({ table: table.name, field: field.name });
    }
  }

  return [...mismatches.values()].sort((a, b) => a.sourceType.localeCompare(b.sourceType));
};

const convertFieldType = (type: string, mappedType: string) => {
  const { params } = parseFieldType(type);
  const mapped = parseFieldType(mappedType);

  if (mapped.params || !params || !PARAMETERIZED_TYPES.has(mapped.base)) return mappedType;

  return `${mappedType}${params}`;
};

export const applyTypeMapping = (schema: DiagramConfig, mapping: TypeMapping): DiagramConfig => {
  return {
    ...schema,
    tables: (schema.tables ?? []).map((table) => ({
      ...table,
      fields: table.fields.map((field) => {
        const mappedType = mapping[parseFieldType(field.type).base];
        return mappedType ? { ...field, type: convertFieldType(field.type, mappedType) } : field;
      }),
    })),
  };
};
