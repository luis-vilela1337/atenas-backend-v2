import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayerAndPaymentSnapshotToOrders1779600000000
  implements MigrationInterface
{
  name = 'AddPayerAndPaymentSnapshotToOrders1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN "payer_snapshot" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN "payment_snapshot" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_snapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payer_snapshot"`,
    );
  }
}
