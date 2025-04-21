import { normalizeType } from '@/utils/sql';
import type { DiagramConfig, TableField, TableRelation } from '@/types/diagram';

export abstract class BaseSQLGenerator {
  protected config: DiagramConfig;
  protected tablesMap: Record<string, TableField[]>;

  constructor(config: DiagramConfig) {
    this.config = config;
    this.tablesMap = {};

    // Index tables by ID for easier lookups
    config.tables.forEach((table) => {
      this.tablesMap[table.id] = table.fields;
    });
  }

  protected abstract sqlTable(tableName: string, fields: TableField[]): string;
  protected abstract sqlRelation(
    relation: TableRelation,
    tables: Record<string, TableField[]>
  ): string;

  public toSQL(): string {
    const tableStatements: string[] = [];
    const relationStatements: string[] = [];
    const commentStatements: string[] = [];

    // Generate table statements
    this.config.tables.forEach((table) => {
      tableStatements.push(this.sqlTable(table.name, table.fields));
    });

    // Generate relation statements
    this.config.relations.forEach((relation) => {
      relationStatements.push(this.sqlRelation(relation, this.tablesMap));
    });

    // Combine all SQL statements
    return (
      [...tableStatements, ...relationStatements, ...commentStatements]
        .filter(Boolean)
        .join('\n\n') + '\n'
    );
  }

  protected escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  protected formatField(
    field: TableField,
    escape: (name: string) => string,
    options: { autoIncrement?: string } = {}
  ): string {
    const name = escape(field.name);
    const type = normalizeType(field.type);

    let line = `${name} ${type}`;

    if (field.primary_key) line += ' PRIMARY KEY';
    if (field.unique && !field.primary_key) line += ' UNIQUE';
    if (!field.nullable && !field.primary_key) line += ' NOT NULL';

    if (field.auto_increment) line += ` ${options.autoIncrement ?? 'AUTO INCREMENT'}`;

    return `  ${line}`;
  }

  protected generatePrimaryKey(
    fields: TableField[],
    escape: (name: string) => string
  ): string | null {
    const primaryKeys = fields.filter((f) => f.primary_key).map((f) => escape(f.name));
    return primaryKeys.length > 1 ? `  PRIMARY KEY (${primaryKeys.join(', ')})` : null;
  }
}
