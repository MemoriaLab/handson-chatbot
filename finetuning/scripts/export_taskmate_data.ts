/**
 * data/faq.ts と data/service.ts を finetuning/taskmate/*.json にエクスポート
 * 実行: npm run finetuning:export
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { faqs } from "../../data/faq";
import { serviceInfo } from "../../data/service";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "taskmate");

mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "faq.json"), JSON.stringify(faqs, null, 2), "utf-8");
writeFileSync(
  join(outDir, "service.json"),
  JSON.stringify(serviceInfo, null, 2),
  "utf-8"
);

console.log(`Wrote ${join(outDir, "faq.json")}`);
console.log(`Wrote ${join(outDir, "service.json")}`);
