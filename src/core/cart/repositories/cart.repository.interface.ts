export interface CartRepositoryInterface {
  findByUserId(userId: string): Promise<any[] | null>;
  upsert(userId: string, items: any[]): Promise<any[]>;
  clearByUserId(userId: string): Promise<void>;
  deleteAbandonedCarts(daysThreshold: number): Promise<number>;
}
