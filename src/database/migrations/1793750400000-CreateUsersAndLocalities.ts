import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndLocalities1793750400000 implements MigrationInterface {
  name = 'CreateUsersAndLocalities1793750400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "localities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "province" character varying(120) NOT NULL,
        "country" character varying(120) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_localities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying(80) NOT NULL,
        "last_name" character varying(80) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "phone" character varying(30),
        "locality_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_locality" FOREIGN KEY ("locality_id")
          REFERENCES "localities"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    // Localidad inicial del MVP. Se usa un id fijo para que el seed sea idempotente.
    await queryRunner.query(`
      INSERT INTO "localities" ("id", "name", "province", "country", "is_active")
      VALUES (
        '0d3f7c1a-5b2e-4a9c-9a51-8f6b2c4d7e10',
        'Libertador General San Martín',
        'Jujuy',
        'Argentina',
        true
      )
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "localities"`);
  }
}
