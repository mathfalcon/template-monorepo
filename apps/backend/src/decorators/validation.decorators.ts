import {FieldErrors, ValidateError} from '@tsoa/runtime';
import {ZodObject, ZodType} from 'zod';

export type ValidationSchema = ZodObject<{
  query?: ZodType;
  body?: ZodType;
  params?: ZodType;
}>;

// Function parameter Decorator Factory
// Overrides tsoa Body Decorator
export function Body() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingMetadata =
      Reflect.getOwnMetadata('Body', target, propertyKey) || [];
    existingMetadata.push(parameterIndex);
    Reflect.defineMetadata('Body', existingMetadata, target, propertyKey);
  };
}

// Function parameter Decorator Factory
// Overrides tsoa Query Decorator
export function Query() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingMetadata =
      Reflect.getOwnMetadata('Query', target, propertyKey) || [];
    existingMetadata.push(parameterIndex);
    Reflect.defineMetadata('Query', existingMetadata, target, propertyKey);
  };
}

// Function parameter Decorator Factory
// Overrides tsoa Params Decorator
export function Params() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingMetadata =
      Reflect.getOwnMetadata('Params', target, propertyKey) || [];
    existingMetadata.push(parameterIndex);
    Reflect.defineMetadata('Params', existingMetadata, target, propertyKey);
  };
}

// Function Decorator Factory
export function ValidateBody(validationSchema: ValidationSchema) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // Retrieve the list of indices of the parameters that are decorated
      // in order to retrieve the body
      const bodyCandidates: number[] =
        Reflect.getOwnMetadata('Body', target, propertyKey) || [];
      if (bodyCandidates.length === 0) {
        throw new ValidateError(
          {
            body: {
              message: 'Body parameter is missing',
            },
          },
          'Body parameter is missing',
        );
      }
      const bodyIndex = bodyCandidates[0] as number;
      // we've found the body in the list of parameters
      // now we check if its payload is valid against the passed Zod schema

      const bodySchema = validationSchema.shape.body;
      if (bodySchema) {
        const check = await bodySchema.safeParseAsync(args[bodyIndex]);
        if (!check.success) {
          // throw new Error(check.error.issues.map(issue => `${issue.message} for field/s [${issue.path.join(',')}]`).join(', '));
          // return { status: 400, error: check.error.issues.map(issue => `${issue.message} for field/s [${issue.path.join(',')}]`).join(', ') };
          const errorPayload: FieldErrors = {};
          check.error.issues.map(issue => {
            errorPayload[issue.path.join(',')] = {
              message: issue.message,
              value: issue.code,
            };
          });
          throw new ValidateError(errorPayload, '');
        }
      }
      
      // the payload checkout!
      // Call the original method with the arguments
      return originalMethod.apply(this, args);
    };
  };
}

// Function Decorator Factory
export function ValidateQuery(validationSchema: ValidationSchema) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // Retrieve the list of indices of the parameters that are decorated
      // in order to retrieve the query
      const queryCandidates: number[] =
        Reflect.getOwnMetadata('Query', target, propertyKey) || [];
      if (queryCandidates.length === 0) {
        throw new ValidateError(
          {
            query: {
              message: 'Query parameter is missing',
            },
          },
          'Query parameter is missing',
        );
      }
      const queryIndex = queryCandidates[0] as number;
      // we've found the query in the list of parameters
      // now we check if its payload is valid against the passed Zod schema

      const querySchema = validationSchema.shape.query;
      if (querySchema) {
        const check = await querySchema.safeParseAsync(args[queryIndex]);
        if (!check.success) {
          const errorPayload: FieldErrors = {};
          check.error.issues.map(issue => {
            errorPayload[issue.path.join(',')] = {
              message: issue.message,
              value: issue.code,
            };
          });
          throw new ValidateError(errorPayload, '');
        }
      }

      // the payload checkout!
      // Call the original method with the arguments
      return originalMethod.apply(this, args);
    };
  };
}

// Function Decorator Factory
export function ValidateParams(validationSchema: ValidationSchema) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // Retrieve the list of indices of the parameters that are decorated
      // in order to retrieve the params
      const paramsCandidates: number[] =
        Reflect.getOwnMetadata('Params', target, propertyKey) || [];
      if (paramsCandidates.length === 0) {
        throw new ValidateError(
          {
            params: {
              message: 'Params parameter is missing',
            },
          },
          'Params parameter is missing',
        );
      }
      const paramsIndex = paramsCandidates[0] as number;
      // we've found the params in the list of parameters
      // now we check if its payload is valid against the passed Zod schema

      const paramsSchema = validationSchema.shape.params;
      if (paramsSchema) {
        const check = await paramsSchema.safeParseAsync(args[paramsIndex]);
        if (!check.success) {
          const errorPayload: FieldErrors = {};
          check.error.issues.map(issue => {
            errorPayload[issue.path.join(',')] = {
              message: issue.message,
              value: issue.code,
            };
          });
          throw new ValidateError(errorPayload, '');
        }
      }

      // the payload checkout!
      // Call the original method with the arguments
      return originalMethod.apply(this, args);
    };
  };
}
