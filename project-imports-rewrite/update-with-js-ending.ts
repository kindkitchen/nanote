import * as fs from "@std/fs";
import * as path from "@std/path";

const project_cwd = path.join(import.meta.dirname!, "..");

for await (
  const file of await fs.walk(
    path.join(project_cwd, "test"),
    {
      exts: [".ts"],
      skip: [/node_modules/],
    },
  )
) {
  if (file.isFile) {
    const content = await Deno.readTextFile(file.path);
    const lines = content.split("\n");
    console.log(lines.length);
    const fresh_lines = [] as string[];

    let is_multiline_import_parsing = false;

    for (const line of lines) {
      if (
        /import /.test(line) ||
        is_multiline_import_parsing
      ) {
        if (line.endsWith('";') && !line.endsWith('.js";')) {
          if (/from "\./.test(line)) {
            fresh_lines.push(line.slice(0, -'";'.length) + '.js"');
          } else {
            fresh_lines.push(line);
          }

          is_multiline_import_parsing = false;
          continue;
        } else {
          fresh_lines.push(line);
          is_multiline_import_parsing = true;
        }
      } else {
        fresh_lines.push(line);
      }
    }

    console.log(fresh_lines.length);

    await Deno.writeTextFileSync(file.path, fresh_lines.join("\n"));
  }
}
