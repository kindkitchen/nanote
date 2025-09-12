import { Type } from '@nestjs/common';
import {
  InputType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { MergeType } from './MergeType';

export function CombineType<
  T extends Type<unknown>,
  U extends Record<
    keyof T['prototype'],
    null | InstructionType | Type<unknown>
  >,
>(
  source: T,
  instruction: U,
): <R extends Type<unknown>['prototype'] | null = null>(
  ...args: Type<
    Omit<Record<string, unknown>, keyof Source<T, U>['prototype']>
  >[]
) => Record<
  'input_type' | 'object_type',
  Source<T, U> &
    Type<
      R extends null
        ? {
            [K in keyof (typeof args)[number]['prototype'] as K extends string
              ? K
              : never]: (typeof args)[number]['prototype'][K] extends never
              ? never
              : (typeof args)[number]['prototype'][K];
          }
        : R
    >
> {
  return (
    ...extra: any[]
  ) => {
    const generate = (purpose: 'Input' | 'ObjectType') => {
      const { pick, pick_force_nullable, extra } = Object.entries(
        instruction,
      ).reduce(
        (acc, [k, v]) => {
          if (!(k && v)) return acc;
          if (typeof v === 'string') {
            acc[v as InstructionType].push(k as keyof T);
          } else {
            acc.extra[k] = v;
          }

          return acc;
        },
        {
          extra: {} as Record<string, Type<unknown>>,
          pick: [] as (keyof T)[],
          pick_force_nullable: [] as (keyof T)[],
        } satisfies Record<InstructionType, (keyof T)[]> & {
          extra: Record<string, Type<unknown>>;
        },
      );
      const Decorator = purpose === 'Input' ? InputType : ObjectType;
      @Decorator({
        isAbstract: true,
      })
      class GeneratedObjectType extends MergeType(
        PartialType(PickType(source, pick_force_nullable as never[])),
        PickType(source, pick as never[]),
        ...Object.entries(extra).map(([prop, clazz]) =>
          PickType(clazz, [prop] as never[]),
        ),
      ) {}

      return GeneratedObjectType;
    };

    return {
      get input_type() {
        return MergeType(generate('Input'), ...extra);
      },
      get object_type() {
        return MergeType(generate('ObjectType'), ...extra);
      },
    } as any; // deno-lint-ignore no-explicit-any
  };
}

type Source<
  T extends Type<unknown>,
  U extends Record<
    keyof T['prototype'],
    null | InstructionType | Type<unknown>
  >,
> = Type<{
  [K in keyof U as K extends string
    ? U[K] extends null
      ? never
      : K
    : never]: U[K] extends 'pick_force_nullable'
    ? T['prototype'][K] | null
    : U[K] extends 'pick'
      ? T['prototype'][K]
      : U[K] extends Type<Record<K, unknown>>
        ? U[K]['prototype'][K]
        : never;
}>;

type InstructionType = 'pick_force_nullable' | 'pick';
