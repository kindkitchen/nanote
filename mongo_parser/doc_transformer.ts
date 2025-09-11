import { Db, Document, ObjectId, WithId } from "mongodb";
import { JsonDataMapperUtil } from "./json-data-mapper.util.ts";

export async function doc_transformer(
  doc: WithId<Document> | null,
  db: Db,
  relations_store: {
    collection?: string;
    prev_id?: string;
    mongo_id?: string;
  } = {},
) {
  const {
    prev_id = "id",
    mongo_id = "insertedId",
    collection = "id_insertedId",
  } = relations_store;
  if (!doc) return doc;

  const objects = [doc] as any;

  do {
    const object = objects.pop();
    const is_array = Array.isArray(object);
    const keys = is_array
      ? Array.from({ length: object.length }).map((_, i) => i)
      : Object.keys(object);

    for (const key of keys) {
      if (key === "_deprecated_i_d") {
        continue;
      }
      const value = object[key];

      if (
        value === null || typeof value === "boolean" ||
        typeof value === "number"
      ) continue;

      if (Array.isArray(value)) {
        objects.push(value);
        continue;
      }

      if (
        JsonDataMapperUtil
          .is_json_object(value)
      ) {
        if (ObjectId.isValid(value)) {
          continue;
        }
        const obj = JsonDataMapperUtil.dynamodb_obj_to_json(value);
        if (JsonDataMapperUtil.is_json_object(obj)) {
          objects.push(obj);
        }
        continue;
      }

      if (typeof value === "string") {
        const maybe_number = +value;
        if (!isNaN(maybe_number)) {
          object[key] = maybe_number;
          continue;
        }
        const is_boolean = value === "true" || value === "false";

        if (is_boolean) {
          object[key] = value === "true";
          continue;
        }

        const maybe_date = new Date(value);

        if (maybe_date.toString() !== "Invalid Date") {
          object[key] = maybe_date;
          continue;
        }

        try {
          const obj = JSON.parse(value);

          if (JsonDataMapperUtil.is_json_object(obj)) {
            const obj_from_string = JsonDataMapperUtil.dynamodb_obj_to_json(
              obj,
            );
            object[key] = obj_from_string;
            if (JsonDataMapperUtil.is_json_object(obj_from_string)) {
              objects.push(obj_from_string);
            }
            continue;
          }
        } catch {
          //
        }

        const is_ObjectId = await db.collection(collection).findOne({
          [prev_id]: value,
        });

        if (is_ObjectId) {
          object[key] = is_ObjectId[mongo_id];
          continue;
        }
      }
    }
  } while (objects.length);

  return doc;
}
