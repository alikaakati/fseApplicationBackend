/**
 * @fileoverview Report period entity for the application
 * This entity represents financial report periods for companies.
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
import { Company } from "./company.entity";
import { FinancialCategory } from "./financial-category.entity";

/**
 * Report period entity class
 * Represents a financial reporting period for a company
 */
@Entity()
export class ReportPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.reportPeriods, {
    nullable: false,
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @Column({ type: "date", nullable: false })
  startDate: string;

  @Column({ type: "date", nullable: false })
  endDate: string;

  @Column({ length: 50, nullable: true })
  periodType?: string; // e.g., "monthly", "quarterly", "annual"

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FinancialCategory, (category) => category.reportPeriod, {
    cascade: true,
  })
  categories: FinancialCategory[];
}
