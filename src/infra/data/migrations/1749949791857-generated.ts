import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1749949791857 implements MigrationInterface {
  name = 'Generated1749949791857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "FK_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "fk_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(`ALTER TABLE "institution_events"
      ADD CONSTRAINT "FK_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "FK_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(`ALTER TABLE "institution_events"
      ADD CONSTRAINT "fk_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "institution_events"
      ADD CONSTRAINT "FK_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
