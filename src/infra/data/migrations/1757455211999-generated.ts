import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1757455211999 implements MigrationInterface {
  name = 'Generated1757455211999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "display_id" SERIAL`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_f7ac7d928ff96e0b1488155dc4b" UNIQUE ("display_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_f7ac7d928ff96e0b1488155dc4b"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "display_id"`);
  }
}
