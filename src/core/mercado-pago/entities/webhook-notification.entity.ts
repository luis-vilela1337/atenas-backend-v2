export interface WebhookNotification {
  id: string;
  type: 'payment' | 'merchant_order';
  paymentId?: string;
  merchantOrderId?: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  rawData: any;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  statusDetail: string;
  paymentId: string;
  externalReference: string;
  transactionAmount: number;
  dateApproved?: Date;
  dateCreated: Date;
  lastModified: Date;
}

export interface WebhookProcessingResult {
  notificationId: string;
  processed: boolean;
  error?: string;
  paymentStatus?: PaymentStatus;
}