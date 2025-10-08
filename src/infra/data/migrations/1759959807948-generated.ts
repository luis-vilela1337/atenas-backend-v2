import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1759959807948 implements MigrationInterface {
  name = 'Generated1759959807948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institution_events" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_event_photos" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP COLUMN "deleted_at"`,
    );
  }
}
