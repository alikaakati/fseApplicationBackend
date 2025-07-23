/**
 * @fileoverview Company entity for the application
 * This entity represents companies in the system and their financial data.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ReportPeriod } from "./report-period.entity";

/**
 * Company entity class
 * Represents a company in the system with associated report periods
 */
@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReportPeriod, (period) => period.company, { cascade: true })
  reportPeriods: ReportPeriod[];
}
