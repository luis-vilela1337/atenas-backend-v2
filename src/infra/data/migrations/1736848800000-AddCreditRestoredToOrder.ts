import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreditRestoredToOrder1736848800000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'credit_restored',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'credit_restored');
  }
}
