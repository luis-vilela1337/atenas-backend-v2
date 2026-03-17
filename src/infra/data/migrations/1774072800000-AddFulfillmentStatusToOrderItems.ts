import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulfillmentStatusToOrderItems1774072800000
  implements MigrationInterface
{
  name = 'AddFulfillmentStatusToOrderItems1774072800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ADD COLUMN "fulfillment_status" character varying NOT NULL DEFAULT 'ORDER_RECEIVED'
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items"
        ADD CONSTRAINT "CHK_order_items_fulfillmentStatus"
        CHECK ("fulfillment_status" IN (
          'ORDER_RECEIVED', 'PHOTOS_SEPARATED', 'PRODUCT_MANUFACTURED',
          'IN_TRANSIT', 'DELIVERED', 'SENT'
        ))
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_item_fulfillment_status"
        ON "order_items" ("fulfillment_status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_order_item_fulfillment_status"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "CHK_order_items_fulfillmentStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "fulfillment_status"`,
    );
  }
}
