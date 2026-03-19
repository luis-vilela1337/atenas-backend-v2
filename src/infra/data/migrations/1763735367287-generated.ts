import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1763735367287 implements MigrationInterface {
  name = 'Generated1763735367287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" ADD "quantity" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "quantity"`);
  }
}
