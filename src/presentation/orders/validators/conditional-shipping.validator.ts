import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class ConditionalShippingConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    // Check if any cart item requires shipping (is not DIGITAL_FILES)
    const requiresShipping = relatedValue.some(
      (item: any) => item.productType !== 'DIGITAL_FILES',
    );

    // If shipping is required but no shipping details provided, validation fails
    if (requiresShipping && !value) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Shipping details are required for physical products (GENERIC or ALBUM)';
  }
}

export function ConditionalShipping(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: ConditionalShippingConstraint,
    });
  };
}
