import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1750351515326 implements MigrationInterface {
  name = 'Generated1750351515326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "FK_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_flag_enum" AS ENUM('ALBUM', 'GENERIC', 'DIGITAL_FILES')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "flag" "public"."products_flag_enum" NOT NULL DEFAULT 'GENERIC', "description" text, "photos" text array, "video" text array, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."institution_products_flag_enum" AS ENUM('ALBUM', 'GENERIC', 'DIGITAL_FILES')`,
    );
    await queryRunner.query(
      `CREATE TABLE "institution_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "flag" "public"."institution_products_flag_enum" NOT NULL, "details" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "product_id" uuid NOT NULL, "institution_id" uuid NOT NULL, CONSTRAINT "unique_product_institution" UNIQUE ("product_id", "institution_id"), CONSTRAINT "PK_603408fe0bf6aad777022fcb2b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_institution_product_product_id" ON "institution_products" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_institution_product_institution_id" ON "institution_products" ("institution_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_institution_product_created" ON "institution_products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_institution_product_flag" ON "institution_products" ("flag") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "currentHashedRefreshToken" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" ADD CONSTRAINT "FK_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_products" ADD CONSTRAINT "FK_a314cd20fe007dba6b3cc4f945f" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_products" ADD CONSTRAINT "FK_94cbb5dd984e435ad831dce4181" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_products" DROP CONSTRAINT "FK_94cbb5dd984e435ad831dce4181"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_products" DROP CONSTRAINT "FK_a314cd20fe007dba6b3cc4f945f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "FK_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d" UNIQUE ("identifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "currentHashedRefreshToken"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_institution_product_flag"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_institution_product_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_institution_product_institution_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_institution_product_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "institution_products"`);
    await queryRunner.query(
      `DROP TYPE "public"."institution_products_flag_enum"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_flag_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" ADD CONSTRAINT "FK_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
