import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstitutionProducts1747237005973
  implements MigrationInterface
{
  name = 'CreateInstitutionProducts1747237005973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "institution_products"
      (
        "id"             uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "flag"           "product_flag_enum"      NOT NULL,
        "details"        jsonb,
        "created_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP WITH TIME ZONE          DEFAULT now(),
        "product_id"     uuid                     NOT NULL,
        "institution_id" uuid                     NOT NULL,
        CONSTRAINT "PK_institution_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "institution_products"
        ADD CONSTRAINT "unique_product_institution"
          UNIQUE ("product_id", "institution_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_institution_product_product_id"
        ON "institution_products" ("product_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_institution_product_institution_id"
        ON "institution_products" ("institution_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_institution_product_flag"
        ON "institution_products" ("flag")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_institution_product_created"
        ON "institution_products" ("created_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "institution_products"
        ADD CONSTRAINT "FK_institution_products_product"
          FOREIGN KEY ("product_id") REFERENCES "products" ("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "institution_products"
        ADD CONSTRAINT "FK_institution_products_institution"
          FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_products" DROP CONSTRAINT "FK_institution_products_institution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_products" DROP CONSTRAINT "FK_institution_products_product"`,
    );
    await queryRunner.query(`DROP INDEX "idx_institution_product_created"`);
    await queryRunner.query(`DROP INDEX "idx_institution_product_flag"`);
    await queryRunner.query(
      `DROP INDEX "idx_institution_product_institution_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_institution_product_product_id"`);
    await queryRunner.query(`DROP TABLE "institution_products"`);
  }
}
