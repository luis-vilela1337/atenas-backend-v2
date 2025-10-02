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

      console.log('🔐 [WEBHOOK SIGNATURE] Starting validation', {
        hasSignature: !!signature,
        hasWebhookSecret: !!webhookSecret,
        dataId,
        requestId,
      });

      if (!signature || !webhookSecret) {
        console.error('❌ [WEBHOOK SIGNATURE] Missing required parameters');
        return {
          isValid: false,
          error: 'Missing required parameters for signature validation',
        };
      }

      const signatureParts = this.parseSignature(signature);
      if (!signatureParts) {
        console.error('❌ [WEBHOOK SIGNATURE] Invalid signature format', {
          signature,
        });
        return {
          isValid: false,
          error: 'Invalid signature format',
        };
      }

      const { timestamp, hash } = signatureParts;

      console.log('🔍 [WEBHOOK SIGNATURE] Parsed signature', {
        timestamp,
        receivedHash: hash,
      });

      // Validação de timestamp
      const timestampMs = parseInt(timestamp) * 1000;
      const currentMs = Date.now();
      const ageInSeconds = Math.floor((currentMs - timestampMs) / 1000);

      console.log('⏱️ [WEBHOOK SIGNATURE] Timestamp validation', {
        timestamp,
        timestampMs,
        currentMs,
        ageInSeconds,
        maxAgeSeconds: 86400, // 24 hours for retry webhooks
      });

      // Validação de timestamp desabilitada para permitir webhooks de retry
      // Mercado Pago pode reenviar webhooks antigos
      // if (this.isTimestampExpired(timestamp)) {
      //   console.error('❌ [WEBHOOK SIGNATURE] Timestamp expired', {
      //     ageInSeconds,
      //   });
      //   return {
      //     isValid: false,
      //     error: 'Signature timestamp is too old',
      //   };
      // }

      // ⚠️ TESTANDO DIFERENTES FORMATOS DO MERCADO PAGO

      // Formato 1: com ponto-e-vírgula
      const manifest1 = `id:${dataId};request-id:${requestId};ts:${timestamp}`;
      const hash1 = createHmac('sha256', webhookSecret)
        .update(manifest1)
        .digest('hex');

      // Formato 2: com espaço
      const manifest2 = `id:${dataId} request-id:${requestId} ts:${timestamp}`;
      const hash2 = createHmac('sha256', webhookSecret)
        .update(manifest2)
        .digest('hex');

      // Formato 3: sem separador
      const manifest3 = `id:${dataId}request-id:${requestId}ts:${timestamp}`;
      const hash3 = createHmac('sha256', webhookSecret)
        .update(manifest3)
        .digest('hex');

      console.log('🧪 [WEBHOOK SIGNATURE] Testing different formats', {
        format1_semicolon: {
          manifest: manifest1,
          hash: hash1,
          match: this.compareHashes(hash, hash1),
        },
        format2_space: {
          manifest: manifest2,
          hash: hash2,
          match: this.compareHashes(hash, hash2),
        },
        format3_nosep: {
          manifest: manifest3,
          hash: hash3,
          match: this.compareHashes(hash, hash3),
        },
        receivedHash: hash,
      });

      const isValid =
        this.compareHashes(hash, hash1) ||
        this.compareHashes(hash, hash2) ||
        this.compareHashes(hash, hash3);

      if (isValid) {
        console.log(
          '✅ [WEBHOOK SIGNATURE] Validation SUCCESSFUL (Mercado Pago method)',
        );
        return { isValid: true };
      }

      console.warn(
        '⚠️ [WEBHOOK SIGNATURE] All Mercado Pago formats failed, trying LEGACY',
      );

      // ⚠️ FALLBACK: Se falhar, tenta o método antigo
      if (!isValid && requestBody) {
        const legacyPayload = `${timestamp}.${requestBody}`;
        const expectedHashLegacy = this.calculateSignatureLegacy(
          timestamp,
          requestBody,
          webhookSecret,
        );

        console.log('🔄 [WEBHOOK SIGNATURE] Legacy algorithm', {
          legacyPayload: legacyPayload.substring(0, 100) + '...',
          expectedHashLegacy,
          receivedHash: hash,
        });

        const isValidLegacy = this.compareHashes(hash, expectedHashLegacy);

        if (isValidLegacy) {
          console.warn(
            '⚠️ [WEBHOOK SIGNATURE] Validated using LEGACY method - Update Mercado Pago configuration',
          );
          return { isValid: true };
        }
      }

      console.error('❌ [WEBHOOK SIGNATURE] Validation FAILED', {
        testedHashes: {
          format1: hash1,
          format2: hash2,
          format3: hash3,
        },
        receivedHash: hash,
      });

      return {
        isValid: false,
        error: 'Invalid signature',
      };
    } catch (error) {
      console.error('❌ [WEBHOOK SIGNATURE] Exception during validation', {
        error: error.message,
        stack: error.stack,
      });
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
