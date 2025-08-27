import { createHmac } from 'crypto';

export interface ValidateSignatureInput {
  signature: string;
  requestBody: string;
  webhookSecret: string;
  maxTimestampAge?: number; // em segundos, padrão 600 (10 minutos)
}

export interface ValidateSignatureOutput {
  isValid: boolean;
  error?: string;
}

export class ValidateSignatureUseCase {
  execute(input: ValidateSignatureInput): ValidateSignatureOutput {
    try {
      const {
        signature,
        requestBody,
        webhookSecret,
        maxTimestampAge = 600,
      } = input;

      if (!signature || !requestBody || !webhookSecret) {
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

      // Validar timestamp
      const timestampValidation = this.validateTimestamp(
        timestamp,
        maxTimestampAge,
      );
      if (!timestampValidation.isValid) {
        return {
          isValid: false,
          error: timestampValidation.error,
        };
      }

      const expectedHash = this.calculateSignature(
        timestamp,
        requestBody,
        webhookSecret,
      );

      const isValid = this.compareHashes(hash, expectedHash);

      return {
        isValid,
        error: isValid
          ? undefined
          : `Invalid signature - Expected: ${expectedHash}, Received: ${hash}`,
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

  private calculateSignature(
    timestamp: string,
    requestBody: string,
    webhookSecret: string,
  ): string {
    const payload = `${timestamp}.${requestBody}`;
    return createHmac('sha256', webhookSecret).update(payload).digest('hex');
  }

  private validateTimestamp(
    timestamp: string,
    maxAge: number,
  ): { isValid: boolean; error?: string } {
    try {
      const webhookTimestamp = parseInt(timestamp);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeDifference = Math.abs(currentTimestamp - webhookTimestamp);

      if (timeDifference > maxAge) {
        return {
          isValid: false,
          error: `Timestamp too old. Difference: ${timeDifference}s, Max allowed: ${maxAge}s`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid timestamp format: ${timestamp}`,
      };
    }
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
