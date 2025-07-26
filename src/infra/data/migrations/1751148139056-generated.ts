import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1751148139056 implements MigrationInterface {
  name = 'Generated1751148139056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_event_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying(500) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "user_id" uuid NOT NULL, "event_id" uuid NOT NULL, CONSTRAINT "PK_13ee65eeeca6de6c43e1bb162f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_event_photos_user_event" ON "user_event_photos" ("user_id", "event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" ADD CONSTRAINT "FK_e9c9543af997cd66e70df861e3b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" ADD CONSTRAINT "FK_72332fd4416a40285744be63f1d" FOREIGN KEY ("event_id") REFERENCES "institution_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" DROP CONSTRAINT "FK_72332fd4416a40285744be63f1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" DROP CONSTRAINT "FK_e9c9543af997cd66e70df861e3b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_event_photos_user_event"`,
    );
    await queryRunner.query(`DROP TABLE "user_event_photos"`);
  }
}
