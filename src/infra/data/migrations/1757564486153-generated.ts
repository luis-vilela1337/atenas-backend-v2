import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1757564486153 implements MigrationInterface {
  name = 'Generated1757564486153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "display_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_paymentstatus_enum" RENAME TO "orders_paymentstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."orders_paymentstatus_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum_old" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum_old" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_paymentstatus_enum_old" RENAME TO "orders_paymentstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "display_id" SET NOT NULL`,
    );
  }
}
