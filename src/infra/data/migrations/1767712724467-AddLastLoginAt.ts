import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastLoginAt1767712724467 implements MigrationInterface {
  name = 'AddLastLoginAt1767712724467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_login_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
  }
}
