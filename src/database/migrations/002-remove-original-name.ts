/**
 * @fileoverview Remove original name from financial line items
 * This migration removes the original name column from the financial line items table.
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOriginalName1700000000001 implements MigrationInterface {
  name = "RemoveOriginalName1700000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "financial_line_item" DROP COLUMN "originalName"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "financial_line_item" ADD "originalName" character varying(255) NOT NULL`
    );
  }
}
