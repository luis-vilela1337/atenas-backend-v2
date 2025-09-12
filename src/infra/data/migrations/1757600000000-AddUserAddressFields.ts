import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAddressFields1757600000000 implements MigrationInterface {
  name = 'AddUserAddressFields1757600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "street" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "number" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "complement" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "neighborhood" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "city" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "state" varchar(2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "zipCode" TYPE varchar(10)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "zipCode" TYPE varchar(9)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "neighborhood"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "complement"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "number"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "street"`);
  }
}
