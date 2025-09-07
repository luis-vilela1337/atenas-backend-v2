import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndContractFields1757211242262
  implements MigrationInterface
{
  name = 'AddUserAndContractFields1757211242262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_order_item_details_orderItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_order_item_details_photoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "CHK_order_items_productType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "CHK_orders_paymentStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "cpf" character varying(14)`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "becaMeasures" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "zipCode" character varying(9)`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "contractNumber" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "contractUniqueId" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "mercado_pago_notifications" ALTER COLUMN "processed_at" SET DEFAULT now()`,
    );
    // First, update any NULL values to 'GENERIC'
    await queryRunner.query(
      `UPDATE "order_items" SET "productType" = 'GENERIC' WHERE "productType" IS NULL OR "productType" = ''`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productType"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_items_producttype_enum" AS ENUM('GENERIC', 'DIGITAL_FILES', 'ALBUM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productType" "public"."order_items_producttype_enum" NOT NULL DEFAULT 'GENERIC'`,
    );
    // Remove default after adding the column
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "productType" DROP DEFAULT`,
    );
    // First, update any invalid paymentStatus values
    await queryRunner.query(
      `UPDATE "orders" SET "paymentStatus" = 'PENDING' WHERE "paymentStatus" IS NULL OR "paymentStatus" NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );

    await queryRunner.query(`DROP INDEX "public"."idx_order_payment_status"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentStatus"`);
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    // Remove default after adding the column
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "shippingAddress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_payment_status" ON "orders" ("paymentStatus") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" ADD CONSTRAINT "FK_20bd0cca4ab3cff5270382c046d" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" ADD CONSTRAINT "FK_a3af4dc49e685829a303f4a190d" FOREIGN KEY ("photoId") REFERENCES "user_event_photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_a3af4dc49e685829a303f4a190d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_20bd0cca4ab3cff5270382c046d"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_order_payment_status"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "shippingAddress" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentStatus"`);
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "paymentStatus" character varying NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_payment_status" ON "orders" ("paymentStatus") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_items_producttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productType" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "mercado_pago_notifications" ALTER COLUMN "processed_at" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "contractUniqueId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "contractNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "zipCode"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "becaMeasures"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cpf"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_paymentStatus" CHECK ((("paymentStatus")::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "CHK_order_items_productType" CHECK ((("productType")::text = ANY ((ARRAY['GENERIC'::character varying, 'DIGITAL_FILES'::character varying, 'ALBUM'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" ADD CONSTRAINT "FK_order_item_details_photoId" FOREIGN KEY ("photoId") REFERENCES "user_event_photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" ADD CONSTRAINT "FK_order_item_details_orderItemId" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
