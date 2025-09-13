function genSelectWithAlias<T extends { id: number }, A extends string = string>(
  keyObj: Record<keyof T, null>,
  alias: A
) {
  type KeysForClient = Record<keyof T & string, `${A}.${keyof T & string}`> &
    Record<`${keyof T & string}_in_result`, `${A}_${keyof T & string}`> &
    Record<`${keyof T & string}_in_select`, `${A}.${keyof T & string} AS ${A}_${keyof T & string}`>;
  const keysForClient = Object.keys(keyObj).reduce((acc, k) => {
    const alias_dot_key = `${alias}.${k}`;
    const alias_dash_key = `${alias}_${k}`;

    acc[k] = alias_dot_key;
    acc[`${k}_in_result`] = alias_dash_key;
    acc[`${k}_in_select`] = `${alias_dot_key} AS ${alias_dash_key}`;

    return acc;
  }, {} as KeysForClient);

  return [keysForClient, alias] as const;
}

function argsTo$<T extends Record<string, string | boolean | null | number>>(args: T) {
  const parameters: T[string][] = [];
  let counter = 0;

  return {
    $: new Proxy(args, {
      get(target, p, receiver) {
        const value = Reflect.get(target, p, receiver);

        parameters.push(value as any); // TODO

        return `$${++counter}`;
      },
    }),
    parameters,
  };
}

export const SqlWriterHelper = {
  genSelectWithAlias,
  argsTo$,
};
