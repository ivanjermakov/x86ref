import { existsSync } from "fs";
import { load } from "cheerio";
import { cp, mkdir, readFile, writeFile } from "fs/promises";

await mkdir("build", { recursive: true });
await mkdir("cache", { recursive: true });

const refHtmlCached = "cache/coder64.html";

let refHtml: string;
if (existsSync(refHtmlCached)) {
	refHtml = (await readFile(refHtmlCached)).toString();
} else {
	const res = await (
		await fetch("http://ref.x86asm.net/coder64.html")
	).arrayBuffer();
	refHtml = new TextDecoder("ISO-8859-1").decode(res);
	await writeFile(refHtmlCached, refHtml);
}
const refDocQuery = load(refHtml);
const table = refDocQuery("table.ref_table").eq(0);
table.append(refDocQuery("table.ref_table").eq(1).children().not("thead"));

const template = (await readFile("index.html")).toString();
const out = load(template);
out("#ref").replaceWith(table);

const outPath = "build/index.html";
await writeFile(outPath, out.html());

await Promise.all(["index.js", "index.css"].map((f) => cp(f, `build/${f}`)));
