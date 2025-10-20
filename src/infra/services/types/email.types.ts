export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  disposition?: 'attachment' | 'inline';
  id?: string;
}

export interface EmailSendOptions {
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailRecipient;
  attachments?: EmailAttachment[];
  tags?: string[];
  templateId?: string;
  variables?: Record<string, any>[];
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TemplateVariables {
  email: string;
  substitutions: Record<string, any>;
}

export interface TemplateEmailOptions {
  from: EmailRecipient;
  to: EmailRecipient[];
  templateId: string;
  variables: TemplateVariables[];
  subject?: string;
  tags?: string[];
}
