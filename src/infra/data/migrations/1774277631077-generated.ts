import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1774277631077 implements MigrationInterface {
  name = 'Generated1774277631077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_cart_userId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cart_updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "CHK_order_items_fulfillmentStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "finalizado_em" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart" ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "finalizado_em"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_fulfillmentStatus" CHECK (((fulfillment_status)::text = ANY ((ARRAY['ORDER_RECEIVED'::character varying, 'PHOTOS_SEPARATED'::character varying, 'PRODUCT_MANUFACTURED'::character varying, 'IN_TRANSIT'::character varying, 'DELIVERED'::character varying, 'SENT'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart_updated_at" ON "cart" ("updated_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cart" ADD CONSTRAINT "FK_cart_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
