import { createHmac } from 'crypto';

export interface ValidateSignatureInput {
  signature: string;
  requestId: string;
  dataId: string;
  requestBody: string; // Manter para fallback
  webhookSecret: string;
}

export interface ValidateSignatureOutput {
  isValid: boolean;
  error?: string;
}

export class ValidateSignatureUseCase {
  execute(input: ValidateSignatureInput): ValidateSignatureOutput {
    try {
      const { signature, requestId, dataId, requestBody, webhookSecret } =
        input;

      if (!signature || !webhookSecret) {
        return {
          isValid: false,
          error: 'Missing required parameters for signature validation',
        };
      }

      const signatureParts = this.parseSignature(signature);
      if (!signatureParts) {
        return {
          isValid: false,
          error: 'Invalid signature format',
        };
      }

      const { timestamp, hash } = signatureParts;

      // Validação de timestamp
      if (this.isTimestampExpired(timestamp)) {
        return {
          isValid: false,
          error: 'Signature timestamp is too old',
        };
      }

      // ⚠️ NOVO ALGORITMO CORRETO DO MERCADO PAGO
      const expectedHash = this.calculateSignatureMercadoPago(
        dataId,
        requestId,
        timestamp,
        webhookSecret,
      );

      const isValid = this.compareHashes(hash, expectedHash);

      // ⚠️ FALLBACK: Se falhar, tenta o método antigo
      if (!isValid && requestBody) {
        const expectedHashLegacy = this.calculateSignatureLegacy(
          timestamp,
          requestBody,
          webhookSecret,
        );

        const isValidLegacy = this.compareHashes(hash, expectedHashLegacy);

        if (isValidLegacy) {
          console.warn(
            '⚠️ Webhook validated using LEGACY method - Update Mercado Pago configuration',
          );
          return { isValid: true };
        }
      }

      return {
        isValid,
        error: isValid ? undefined : 'Invalid signature',
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Signature validation error: ${error.message}`,
      };
    }
  }

  private parseSignature(signature: string): {
    timestamp: string;
    hash: string;
  } | null {
    try {
      const parts = signature.split(',');
      const timestampPart = parts.find((part) => part.startsWith('ts='));
      const hashPart = parts.find((part) => part.startsWith('v1='));

      if (!timestampPart || !hashPart) {
        return null;
      }

      return {
        timestamp: timestampPart.split('=')[1],
        hash: hashPart.split('=')[1],
      };
    } catch {
      return null;
    }
  }

  private isTimestampExpired(timestamp: string): boolean {
    const timestampMs = parseInt(timestamp) * 1000;
    const currentMs = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;

    return currentMs - timestampMs > fiveMinutesMs;
  }

  /**
   * ✅ ALGORITMO CORRETO SEGUNDO DOCUMENTAÇÃO MERCADO PAGO
   * Template: id:[data.id];request-id:[x-request-id];ts:[timestamp]
   */
  private calculateSignatureMercadoPago(
    dataId: string,
    requestId: string,
    timestamp: string,
    webhookSecret: string,
  ): string {
    // Formato EXATO da documentação do Mercado Pago
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp}`;
    return createHmac('sha256', webhookSecret).update(manifest).digest('hex');
  }

  /**
   * ⚠️ MÉTODO LEGADO - Mantido para compatibilidade reversa
   */
  private calculateSignatureLegacy(
    timestamp: string,
    requestBody: string,
    webhookSecret: string,
  ): string {
    const payload = `${timestamp}.${requestBody}`;
    return createHmac('sha256', webhookSecret).update(payload).digest('hex');
  }

  private compareHashes(hash1: string, hash2: string): boolean {
    if (hash1.length !== hash2.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < hash1.length; i++) {
      result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i);
    }

    return result === 0;
  }
}
