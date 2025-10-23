import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailParams,
  MailerSend,
  Recipient,
  Sender,
  Attachment,
} from 'mailersend';
import {
  EmailSendOptions,
  EmailSendResponse,
  TemplateEmailOptions,
  EmailRecipient,
  EmailAttachment,
} from './types/email.types';

@Injectable()
export class MailerSendService {
  private readonly mailerSend: MailerSend;
  private readonly defaultFromEmail: string;
  private readonly defaultFromName: string;
  private readonly logger = new Logger(MailerSendService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILERSEND_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'MAILERSEND_API_KEY not configured. Email service will not work.',
      );
    }

    this.mailerSend = new MailerSend({
      apiKey: apiKey || '',
    });

    this.defaultFromEmail =
      this.configService.get<string>('MAILERSEND_FROM_EMAIL') || '';
    this.defaultFromName =
      this.configService.get<string>('MAILERSEND_FROM_NAME') ||
      'Atenas Formaturas';
  }

  /**
   * Envia um email simples
   */
  async sendEmail(options: EmailSendOptions): Promise<EmailSendResponse> {
    try {
      const emailParams = new EmailParams()
        .setFrom(this.createSender(options.from))
        .setTo(this.createRecipients(options.to))
        .setSubject(options.subject);

      // HTML content
      if (options.html) {
        emailParams.setHtml(options.html);
      }

      // Text content
      if (options.text) {
        emailParams.setText(options.text);
      }

      // CC
      if (options.cc && options.cc.length > 0) {
        emailParams.setCc(this.createRecipients(options.cc));
      }

      // BCC
      if (options.bcc && options.bcc.length > 0) {
        emailParams.setBcc(this.createRecipients(options.bcc));
      }

      // Reply-To
      if (options.replyTo) {
        emailParams.setReplyTo(this.createSender(options.replyTo));
      }

      // Attachments
      if (options.attachments && options.attachments.length > 0) {
        emailParams.setAttachments(this.createAttachments(options.attachments));
      }

      // Tags
      if (options.tags && options.tags.length > 0) {
        emailParams.setTags(options.tags);
      }

      const response = await this.mailerSend.email.send(emailParams);

      this.logger.log(
        `Email sent successfully to ${options.to
          .map((r) => r.email)
          .join(', ')}`,
      );

      return {
        success: true,
        messageId: response.headers['x-message-id'] || 'sent',
      };
    } catch (error) {
      let errorMessage = 'Unknown error';

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.body) {
        errorMessage = JSON.stringify(error.body);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        try {
          errorMessage = JSON.stringify(error, null, 2);
        } catch {
          errorMessage = String(error);
        }
      }

      this.logger.error(
        `Failed to send email: ${errorMessage}`,
        error?.stack || error,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envia um email usando template do MailerSend
   */
  async sendTemplateEmail(
    options: TemplateEmailOptions,
  ): Promise<EmailSendResponse> {
    try {
      const emailParams = new EmailParams()
        .setFrom(this.createSender(options.from))
        .setTo(this.createRecipients(options.to))
        .setTemplateId(options.templateId);

      // Personalization variables
      if (options.variables && options.variables.length > 0) {
        const personalization = options.variables.map((variable) => ({
          email: variable.email,
          data: variable.substitutions,
        }));
        emailParams.setPersonalization(personalization);
      }

      // Subject (opcional para templates)
      if (options.subject) {
        emailParams.setSubject(options.subject);
      }

      // Tags
      if (options.tags && options.tags.length > 0) {
        emailParams.setTags(options.tags);
      }

      const response = await this.mailerSend.email.send(emailParams);

      this.logger.log(
        `Template email sent successfully to ${options.to
          .map((r) => r.email)
          .join(', ')}`,
      );

      return {
        success: true,
        messageId: response.headers['x-message-id'] || 'sent',
      };
    } catch (error) {
      let errorMessage = 'Unknown error';

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.body) {
        errorMessage = JSON.stringify(error.body);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        try {
          errorMessage = JSON.stringify(error, null, 2);
        } catch {
          errorMessage = String(error);
        }
      }

      this.logger.error(
        `Failed to send template email: ${errorMessage}`,
        error?.stack || error,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envia email de boas-vindas (exemplo de método helper)
   */
  async sendWelcomeEmail(
    to: EmailRecipient,
    variables?: Record<string, any>,
  ): Promise<EmailSendResponse> {
    const welcomeTemplateId = this.configService.get<string>(
      'MAILERSEND_WELCOME_TEMPLATE_ID',
    );

    if (welcomeTemplateId) {
      // Usar template se configurado
      return this.sendTemplateEmail({
        from: {
          email: this.defaultFromEmail,
          name: this.defaultFromName,
        },
        to: [to],
        templateId: welcomeTemplateId,
        variables: [{ email: to.email, substitutions: variables || {} }],
        tags: ['welcome', 'onboarding'],
      });
    }

    // Fallback para email HTML simples
    return this.sendEmail({
      from: {
        email: this.defaultFromEmail,
        name: this.defaultFromName,
      },
      to: [to],
      subject: `Bem-vindo(a) ao Atenas Formaturas, ${to.name || ''}!`,
      html: this.getWelcomeEmailHtml(to.name || 'usuário'),
      tags: ['welcome', 'onboarding'],
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(
    to: EmailRecipient,
    resetToken: string,
    resetUrl: string,
  ): Promise<EmailSendResponse> {
    const resetTemplateId = this.configService.get<string>(
      'MAILERSEND_PASSWORD_RESET_TEMPLATE_ID',
    );

    if (resetTemplateId) {
      return this.sendTemplateEmail({
        from: {
          email: this.defaultFromEmail,
          name: this.defaultFromName,
        },
        to: [to],
        templateId: resetTemplateId,
        variables: [
          {
            email: to.email,
            substitutions: {
              name: to.name || 'usuário',
              reset_url: resetUrl,
              reset_token: resetToken,
            },
          },
        ],
        tags: ['password-reset', 'security'],
      });
    }

    return this.sendEmail({
      from: {
        email: this.defaultFromEmail,
        name: this.defaultFromName,
      },
      to: [to],
      subject: 'Redefinição de Senha - Atenas Formaturas',
      html: this.getPasswordResetEmailHtml(to.name || 'usuário', resetUrl),
      tags: ['password-reset', 'security'],
    });
  }

  /**
   * Envia email com código de verificação para reset de senha
   */
  async sendPasswordResetCodeEmail(
    to: EmailRecipient,
    code: string,
  ): Promise<EmailSendResponse> {
    const resetCodeTemplateId = this.configService.get<string>(
      'MAILERSEND_PASSWORD_RESET_CODE_TEMPLATE_ID',
    );

    if (resetCodeTemplateId) {
      return this.sendTemplateEmail({
        from: {
          email: this.defaultFromEmail,
          name: this.defaultFromName,
        },
        to: [to],
        templateId: resetCodeTemplateId,
        variables: [
          {
            email: to.email,
            substitutions: {
              name: to.name || 'usuário',
              code: code,
            },
          },
        ],
        tags: ['password-reset-code', 'security'],
      });
    }

    return this.sendEmail({
      from: {
        email: this.defaultFromEmail,
        name: this.defaultFromName,
      },
      to: [to],
      subject: 'Código de Verificação - Atenas Formaturas',
      html: this.getPasswordResetCodeEmailHtml(to.name || 'usuário', code),
      tags: ['password-reset-code', 'security'],
    });
  }

  /**
   * Helper methods
   */
  private createSender(recipient: EmailRecipient): Sender {
    return new Sender(recipient.email, recipient.name);
  }

  private createRecipients(recipients: EmailRecipient[]): Recipient[] {
    return recipients.map(
      (recipient) => new Recipient(recipient.email, recipient.name),
    );
  }

  private createAttachments(attachments: EmailAttachment[]): Attachment[] {
    return attachments.map((attachment) => {
      const att = new Attachment(
        Buffer.isBuffer(attachment.content)
          ? attachment.content.toString('base64')
          : attachment.content,
        attachment.filename,
      );

      if (attachment.disposition) {
        att.disposition = attachment.disposition;
      }

      if (attachment.id) {
        att.id = attachment.id;
      }

      return att;
    });
  }

  /**
   * HTML templates para emails (fallback quando não há template configurado)
   */
  private getWelcomeEmailHtml(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light">
          <style>
            :root {
              color-scheme: light only !important;
              supported-color-schemes: light !important;
            }

            /* Garantir que cores específicas não sejam invertidas */
            body, table, td, div {
              color-scheme: light only !important;
            }

            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000000 !important;
              background-color: #ffffff !important;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff !important;
            }
            .header {
              background: #fdf50e !important;
              background-color: #fdf50e !important;
              color: #000000 !important;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background: #f9f9f9 !important;
              color: #000000 !important;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #000000 !important;
            }
            p, h1, h2, h3 { color: #000000 !important; }

            /* Media Query como Backup */
            @media (prefers-color-scheme: dark) {
              .header,
              [style*="background-color: #fdf50e"],
              [style*="background: #fdf50e"] {
                background-color: #fdf50e !important;
                background: #fdf50e !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header" style="background-color: #fdf50e !important;">
              <h1>Bem-vindo(a) ao Atenas Formaturas!</h1>
            </div>
            <div class="content">
              <p>Olá ${name},</p>
              <p>É um prazer ter você conosco! Sua conta foi criada com sucesso.</p>
              <p>Agora você pode aproveitar todos os recursos da nossa plataforma.</p>
              <p>Se precisar de ajuda, não hesite em entrar em contato conosco.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Atenas Formaturas. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailHtml(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light">
          <style>
            :root {
              color-scheme: light only !important;
              supported-color-schemes: light !important;
            }

            /* Garantir que cores específicas não sejam invertidas */
            body, table, td, div {
              color-scheme: light only !important;
            }

            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000000 !important;
              background-color: #ffffff !important;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff !important;
            }
            .header {
              background: #fdf50e !important;
              background-color: #fdf50e !important;
              color: #000000 !important;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background: #f9f9f9 !important;
              color: #000000 !important;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #fdf50e !important;
              background-color: #fdf50e !important;
              color: #000000 !important;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background: #fef08a !important;
              background-color: #fef08a !important;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #000000 !important;
            }
            p, h1, h2, h3, strong { color: #000000 !important; }

            /* Media Query como Backup */
            @media (prefers-color-scheme: dark) {
              .header,
              .button,
              [style*="background-color: #fdf50e"],
              [style*="background: #fdf50e"] {
                background-color: #fdf50e !important;
                background: #fdf50e !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header" style="background-color: #fdf50e !important;">
              <h1>Redefinição de Senha</h1>
            </div>
            <div class="content">
              <p>Olá ${name},</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button" style="background-color: #fdf50e !important;">Redefinir Senha</a>
              </p>
              <p><strong>Este link é válido por 1 hora.</strong></p>
              <p>Se você não solicitou esta alteração, pode ignorar este email com segurança.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Atenas Formaturas. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetCodeEmailHtml(name: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light">
          <style>
            :root {
              color-scheme: light only !important;
              supported-color-schemes: light !important;
            }

            /* Garantir que cores específicas não sejam invertidas */
            body, table, td, div {
              color-scheme: light only !important;
            }

            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000000 !important;
              background-color: #ffffff !important;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff !important;
            }
            .header {
              background: #fdf50e !important;
              background-color: #fdf50e !important;
              color: #000000 !important;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background: #f9f9f9 !important;
              color: #000000 !important;
            }
            .code-box {
              background: #fefce8 !important;
              background-color: #fefce8 !important;
              border: 2px dashed #fdf50e !important;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #000000 !important;
              font-family: 'Courier New', monospace;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #000000 !important;
            }
            .security-note {
              color: #000000 !important;
              font-size: 12px;
            }
            p, h1, h2, h3, strong { color: #000000 !important; }

            /* Media Query como Backup */
            @media (prefers-color-scheme: dark) {
              .header,
              .code-box,
              [style*="background-color: #fdf50e"],
              [style*="background: #fdf50e"],
              [style*="border: 2px dashed #fdf50e"] {
                background-color: #fdf50e !important;
                background: #fdf50e !important;
                border-color: #fdf50e !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header" style="background-color: #fdf50e !important;">
              <h1>Código de Verificação</h1>
            </div>
            <div class="content">
              <p>Olá ${name},</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              <p>Use o código abaixo para redefinir sua senha:</p>
              <div class="code-box" style="border: 2px dashed #fdf50e !important;">
                <div class="code">${code}</div>
              </div>
              <p><strong>Este código é válido por 15 minutos.</strong></p>
              <p>Se você não solicitou esta alteração, pode ignorar este email com segurança.</p>
              <p class="security-note">Por segurança, nunca compartilhe este código com ninguém.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Atenas Formaturas. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
