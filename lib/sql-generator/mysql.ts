import dedent from 'dedent';
import { BaseSQLGenerator } from './base';
import type { TableField, TableRelation } from '@/types/diagram';

export class MySQLGenerator extends BaseSQLGenerator {
  protected sqlTable(tableName: string, fields: TableField[]): string {
    const escape = this.escapeIdentifier;
    const lines = fields.map((field) =>
      this.formatField(field, escape, { autoIncrement: 'AUTO_INCREMENT' })
    );

    const pk = this.generatePrimaryKey(fields, escape);
    if (pk) lines.push(pk);

    return `CREATE TABLE ${escape(tableName)} (\n${lines.join(',\n')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
  }

  protected sqlRelation(relation: TableRelation, tables: Record<string, TableField[]>): string {
    const sourceTable = this.config.tables.find((t) => t.id === relation.source)?.name;
    const targetTable = this.config.tables.find((t) => t.id === relation.target)?.name;

    if (!sourceTable || !targetTable) {
      throw new Error(`Invalid relation: source or target table not found`);
    }

    const sourceField = tables[relation.source].find((f) => f.id === relation.source_field)?.name;
    const targetField = tables[relation.target].find((f) => f.id === relation.target_field)?.name;

    if (!sourceField || !targetField) {
      throw new Error(`Invalid relation: source or target field not found`);
    }

    return dedent`
      ALTER TABLE \`${sourceTable}\`
      ADD CONSTRAINT \`fk_${sourceTable}_${targetTable}_${sourceField}\`
      FOREIGN KEY (\`${sourceField}\`) REFERENCES \`${targetTable}\` (\`${targetField}\`)
      ON DELETE CASCADE
      ON UPDATE RESTRICT;
    `;
  }

  protected override escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }
}
