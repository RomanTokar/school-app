import { registerDecorator, ValidationOptions } from 'class-validator';
import { isFuture } from 'date-fns';

export function IsDateInFuture(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateInPast',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isFuture(new Date(value));
        },
      },
    });
  };
}
