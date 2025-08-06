import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMercadoPagoWebhookTables1751228400000
  implements MigrationInterface
{
  name = 'CreateMercadoPagoWebhookTables1751228400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "mercado_pago_notifications" (
                "id" character varying(255) NOT NULL,
                "type" character varying(50) NOT NULL,
                "paymentId" character varying(255),
                "merchantOrderId" character varying(255),
                "status" character varying(50) NOT NULL DEFAULT 'pending',
                "rawData" jsonb NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "processed_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_mercado_pago_notifications" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "mercado_pago_notifications" ("type")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_payment_id" ON "mercado_pago_notifications" ("paymentId")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_merchant_order_id" ON "mercado_pago_notifications" ("merchantOrderId")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notification_status" ON "mercado_pago_notifications" ("status")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_created_at" ON "mercado_pago_notifications" ("created_at")
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payment_status_history" (
                "id" SERIAL NOT NULL,
                "paymentId" character varying(255) NOT NULL,
                "externalReference" character varying(255),
                "status" character varying(50) NOT NULL,
                "statusDetail" character varying(255),
                "transactionAmount" numeric(10,2),
                "dateApproved" TIMESTAMP WITH TIME ZONE,
                "dateCreated" TIMESTAMP WITH TIME ZONE NOT NULL,
                "lastModified" TIMESTAMP WITH TIME ZONE NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_payment_status_history" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_payment_history_payment_id" ON "payment_status_history" ("paymentId")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_payment_history_external_reference" ON "payment_status_history" ("externalReference")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_payment_history_status" ON "payment_status_history" ("status")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_payment_history_status"`);
    await queryRunner.query(
      `DROP INDEX "idx_payment_history_external_reference"`,
    );
    await queryRunner.query(`DROP INDEX "idx_payment_history_payment_id"`);
    await queryRunner.query(`DROP TABLE "payment_status_history"`);

    await queryRunner.query(`DROP INDEX "idx_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_notification_status"`);
    await queryRunner.query(`DROP INDEX "idx_merchant_order_id"`);
    await queryRunner.query(`DROP INDEX "idx_payment_id"`);
    await queryRunner.query(`DROP INDEX "idx_notification_type"`);
    await queryRunner.query(`DROP TABLE "mercado_pago_notifications"`);
  }
}
