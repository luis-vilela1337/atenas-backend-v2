import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTables1754264500000 implements MigrationInterface {
  name = 'CreateOrderTables1754264500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create orders table
    await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "totalAmount" numeric(10,2) NOT NULL,
                "paymentStatus" character varying NOT NULL DEFAULT 'PENDING',
                "paymentGatewayId" character varying(255),
                "shippingAddress" jsonb NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_orders_paymentStatus" CHECK ("paymentStatus" IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
            )
        `);

    // Create indexes for orders table
    await queryRunner.query(`
            CREATE INDEX "idx_order_user_id" ON "orders" ("userId")
        `);

    await queryRunner.query(`
            CREATE INDEX "idx_order_payment_status" ON "orders" ("paymentStatus")
        `);

    await queryRunner.query(`
            CREATE INDEX "idx_order_payment_gateway_id" ON "orders" ("paymentGatewayId")
        `);

    // Create order_items table
    await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "productName" character varying(255) NOT NULL,
                "productType" character varying NOT NULL,
                "itemPrice" numeric(10,2) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_order_items_productType" CHECK ("productType" IN ('GENERIC', 'DIGITAL_FILES', 'ALBUM'))
            )
        `);

    // Create indexes for order_items table
    await queryRunner.query(`
            CREATE INDEX "idx_order_item_order_id" ON "order_items" ("orderId")
        `);

    await queryRunner.query(`
            CREATE INDEX "idx_order_item_product_id" ON "order_items" ("productId")
        `);

    // Create order_item_details table
    await queryRunner.query(`
            CREATE TABLE "order_item_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderItemId" uuid NOT NULL,
                "photoId" uuid,
                "eventId" uuid,
                "isPackage" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_order_item_details" PRIMARY KEY ("id")
            )
        `);

    // Create indexes for order_item_details table
    await queryRunner.query(`
            CREATE INDEX "idx_order_item_detail_order_item_id" ON "order_item_details" ("orderItemId")
        `);

    await queryRunner.query(`
            CREATE INDEX "idx_order_item_detail_photo_id" ON "order_item_details" ("photoId")
        `);

    await queryRunner.query(`
            CREATE INDEX "idx_order_item_detail_event_id" ON "order_item_details" ("eventId")
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD CONSTRAINT "FK_orders_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "order_items" 
            ADD CONSTRAINT "FK_order_items_orderId" 
            FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "order_items" 
            ADD CONSTRAINT "FK_order_items_productId" 
            FOREIGN KEY ("productId") REFERENCES "products"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "order_item_details" 
            ADD CONSTRAINT "FK_order_item_details_orderItemId" 
            FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "order_item_details" 
            ADD CONSTRAINT "FK_order_item_details_photoId" 
            FOREIGN KEY ("photoId") REFERENCES "user_event_photos"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_order_item_details_photoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_details" DROP CONSTRAINT "FK_order_item_details_orderItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_userId"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_order_item_detail_event_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_detail_photo_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_detail_order_item_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_product_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_order_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_payment_gateway_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_payment_status"`);
    await queryRunner.query(`DROP INDEX "idx_order_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "order_item_details"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
