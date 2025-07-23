/**
 * @fileoverview Financial category entity for the application
 * This entity represents financial categories within report periods.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { ReportPeriod } from "./report-period.entity";
import { FinancialLineItem } from "./financial-line-item.entity";

/**
 * Financial category entity class
 * Represents a financial category within a report period
 */
@Entity()
export class FinancialCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportPeriod, (period) => period.categories, {
    nullable: false,
  })
  @JoinColumn({ name: "reportPeriodId" })
  reportPeriod: ReportPeriod;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ length: 50, nullable: true })
  categoryType?: string; // e.g., "income", "expense", "asset", "liability"

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FinancialLineItem, (item) => item.category, {
    cascade: true,
  })
  lineItems: FinancialLineItem[];
}
