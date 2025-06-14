import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generated1747237005972 implements MigrationInterface {
  name = 'Generated1747237005972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "institution_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "institution_id" uuid NOT NULL, CONSTRAINT "PK_593181b3ce4d2d70313bdf49209" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "identifier" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "observations" text, "passwordHash" character varying NOT NULL, "role" character varying(20) NOT NULL, "fatherName" character varying(255), "fatherPhone" character varying(20), "motherName" character varying(255), "motherPhone" character varying(20), "driveLink" character varying(255), "creditValue" numeric(10,2), "profileImage" character varying(255), "status" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "institution_id" uuid NOT NULL, CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d" UNIQUE ("identifier"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "institutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contractNumber" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "observations" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_3216721963409e39bae005cce53" UNIQUE ("contractNumber"), CONSTRAINT "PK_0be7539dcdba335470dc05e9690" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" ADD CONSTRAINT "FK_77c1c951b4b517aedab08a117ae" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_822972ceea1fda0973b8acc7bbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institution_events" DROP CONSTRAINT "FK_77c1c951b4b517aedab08a117ae"`,
    );
    await queryRunner.query(`DROP TABLE "institutions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "institution_events"`);
  }
}
