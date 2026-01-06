import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1767712724467 implements MigrationInterface {
  name = 'Generated1767712724467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "login_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "login_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ip_address" character varying(45), "user_agent" text, "success" boolean NOT NULL DEFAULT true, "failure_reason" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe377f36d49c39547cb6b9f0727" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_history_user_id" ON "login_history" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_history_login_at" ON "login_history" ("login_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_history_success" ON "login_history" ("success") `,
    );
    await queryRunner.query(
      `ALTER TABLE "login_history" ADD CONSTRAINT "FK_ad9ce49cb73c0b33746a56b6bd1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "login_history" DROP CONSTRAINT "FK_ad9ce49cb73c0b33746a56b6bd1"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_login_history_success"`);
    await queryRunner.query(`DROP INDEX "public"."idx_login_history_login_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_login_history_user_id"`);
    await queryRunner.query(`DROP TABLE "login_history"`);
  }
}
