export const JsonDataMapperUtil = {
  get_child,
  dynamodb_obj_to_json,
  is_json_object,
};

function get_child(
  data: JsonObjectType | JsonArrayType,
  path_to_child: string[],
) {
  try {
    const result = path_to_child.reduce((acc, p) => {
      // deno-lint-ignore no-explicit-any
      acc = (acc as any)[p];

      return acc;
    }, data);

    return result;
  } catch (err) {
    console.error(err);
    console.error(`Incorrect path to traverse json-data!`);
    Deno.exit(400);
  }
}

/**
 * @link https://gist.github.com/igorzg/c80c0de4ad5c4028cb26cfec415cc600
 */
function dynamodb_obj_to_json(data: any) {
  const S = "S";
  const SS = "SS";
  const NN = "NN";
  const NS = "NS";
  const BS = "BS";
  const BB = "BB";
  const N = "N";
  const BOOL = "BOOL";
  const NULL = "NULL";
  const M = "M";
  const L = "L";

  if (is_json_object(data)) {
    const keys = Object.keys(data);
    while (keys.length) {
      const key = keys.shift() as string;
      const types = data[key];

      if (is_json_object(types) && Object.hasOwn(types, S)) {
        data[key] = types[S];
      } else if (is_json_object(types) && Object.hasOwn(types, N)) {
        data[key] = parseFloat(types[N] as string);
      } else if (is_json_object(types) && Object.hasOwn(types, BOOL)) {
        data[key] = types[BOOL];
      } else if (is_json_object(types) && Object.hasOwn(types, NULL)) {
        data[key] = null;
      } else if (is_json_object(types) && Object.hasOwn(types, M)) {
        data[key] = dynamodb_obj_to_json(types[M]);
      } else if (is_json_object(types) && Object.hasOwn(types, L)) {
        data[key] = dynamodb_obj_to_json(types[L]);
      } else if (is_json_object(types) && Object.hasOwn(types, SS)) {
        data[key] = types[SS];
      } else if (is_json_object(types) && Object.hasOwn(types, NN)) {
        data[key] = types[NN];
      } else if (is_json_object(types) && Object.hasOwn(types, BB)) {
        data[key] = types[BB];
      } else if (is_json_object(types) && Object.hasOwn(types, NS)) {
        data[key] = types[NS];
      } else if (is_json_object(types) && Object.hasOwn(types, BS)) {
        data[key] = types[BS];
      } else if (is_json_object(types)) {
        data[key] = dynamodb_obj_to_json(types);
      }
    }
  } else if (Array.isArray(data)) {
    data.forEach((el, i, arr) => {
      arr[i] = dynamodb_obj_to_json({ el }).el;
    });
  }

  return data;
}

function is_json_object(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


export type JsonType =
  | null
  | string
  | number
  | boolean
  | JsonObjectType
  | JsonArrayType;

export interface JsonObjectType {
  [key: string]: JsonType;
}

export interface JsonArrayType extends Array<JsonType> {}
