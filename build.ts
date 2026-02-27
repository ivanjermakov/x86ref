import { execSync } from "child_process";
import { existsSync } from "fs";
import { type Cheerio, load } from "cheerio";
import type { Element } from "domhandler";
import { cp, mkdir, readFile, writeFile } from "fs/promises";

// biome-ignore format:
const jccMnemonics = ["JA", "JAE", "JB", "JBE", "JC", "JCXZ", "JECXZ", "JRCXZ", "JE", "JG", "JGE", "JL", "JLE", "JNA", "JNAE", "JNB", "JNBE", "JNC", "JNE", "JNG", "JNGE", "JNL", "JNLE", "JNO", "JNP", "JNS", "JNZ", "JO", "JP", "JPE", "JPO", "JS", "JZ", "JA", "JAE", "JB", "JBE", "JC", "JE", "JZ", "JG", "JGE", "JL", "JLE", "JNA", "JNAE", "JNB", "JNBE", "JNC", "JNE", "JNG", "JNGE", "JNL", "JNLE", "JNO", "JNP", "JNS", "JNZ", "JO", "JP", "JPE", "JPO", "JS", "JZ"];

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
const ref = load(refHtml);
const header = ref("table.ref_table thead").eq(0);

const template = (await readFile("index.html")).toString();
const out = load(template);
const outTable = out("#ref");
outTable.append(header);

const tbody = out("<tbody>");
const rows = ref(".ref_table tbody");
for (const row of rows) {
	let firstTr: Element;
	for (const tr of ref(row).find("tr")) {
		firstTr ??= tr;
		ref(tr)
			.find("td")
			.each((_, td) => {
				delete td.attribs.rowspan;
				return true;
			});
		let newTr: Cheerio<any> = ref(tr);
		if (tr.attribs.class === "nbb") {
			newTr = ref("<tr>");
			const tds = out(firstTr).find("td").clone();
			newTr.append(tds.slice(0, 10));
			newTr.append(tr.children);
			newTr.append(tds.slice(15));
			tbody.append(newTr);
		} else {
			tbody.append(tr);
		}
		const nameTd = ref(ref(newTr).find("td")[10]);
		const mnemonic = nameTd.text();
		if (
			mnemonic !== "" &&
			mnemonic !== "invalid" &&
			mnemonic !== "no mnemonic"
		) {
			const fcMnem = jccMnemonics.includes(mnemonic)
				? "jcc"
				: mnemonic.toLowerCase();
			nameTd.html(
				`<td><a href="https://www.felixcloutier.com/x86/${fcMnem}">${mnemonic}</a></td>`,
			);
		}
	}
}
outTable.append(tbody);

const outPath = "build/index.html";
await writeFile(outPath, out.html());

await cp("index.css", "build/index.css");

const command = `tsgo --target esnext --moduleResolution node index.ts --outDir build`;
execSync(command, { stdio: "inherit" });
