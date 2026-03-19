import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTable1770872400000 implements MigrationInterface {
  name = 'CreateCartTable1770872400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cart" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "items" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_cart" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cart_userId" UNIQUE ("userId")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cart_user_id" ON "cart" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cart_updated_at" ON "cart" ("updated_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "cart"
      ADD CONSTRAINT "FK_cart_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_cart_userId"`,
    );
    await queryRunner.query(`DROP INDEX "idx_cart_updated_at"`);
    await queryRunner.query(`DROP INDEX "idx_cart_user_id"`);
    await queryRunner.query(`DROP TABLE "cart"`);
  }
}
