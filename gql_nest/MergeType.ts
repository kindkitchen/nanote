import { Type } from '@nestjs/common';
import { IntersectionType } from '@nestjs/graphql';

export function MergeType<
  R extends
    | Type<any>['prototype']
    | null = null,
>(
  ...args: Type<unknown>[]
): Type<
  R extends null
    ? {
        [K in keyof (typeof args)[number]['prototype'] as K extends string
          ? K
          : never]: (typeof args)[number]['prototype'][K] extends never
          ? never
          : (typeof args)[number]['prototype'][K];
      }
    : R
> {
  const len = args.length;

  if (len === 0) {
    return class {} as Type<any>;
  } else if (len === 1) {
    return args.pop() as Type<any>;
  }

  return args.reduce((first, second) =>
    IntersectionType(first, second),
  ) as Type<any>;
}
