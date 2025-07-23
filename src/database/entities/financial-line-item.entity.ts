/**
 * @fileoverview Financial line item entity for the application
 * This entity represents individual line items within financial categories.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { FinancialCategory } from "./financial-category.entity";

/**
 * Financial line item entity class
 * Represents an individual line item within a financial category
 */
@Entity()
export class FinancialLineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FinancialCategory, (category) => category.lineItems, {
    nullable: false,
  })
  @JoinColumn({ name: "categoryId" })
  category: FinancialCategory;

  @Column({ length: 255, nullable: false })
  originalName: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ length: 100, nullable: true })
  accountId?: string;

  @Column({ length: 50, nullable: true })
  itemType?: string; // e.g., "revenue", "expense", "asset", "liability"

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
