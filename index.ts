type Op = {
	element: HTMLTableRowElement;
	mnemonic: string;
	op1?: string;
	op2?: string;
};

const ops: Op[] = [];

const filter = (op: Op, query: string): boolean => {
	if (query !== "" && (op.mnemonic == "invalid" || op.mnemonic == "null"))
		return false;
	const m = query.split(" ")[0];
	return op.mnemonic.toLowerCase().includes(m.toLowerCase());
};

const applyFilter = (query: string) => {
	for (const op of ops) {
		const show = filter(op, query);
		op.element.style.visibility = show ? "visible" : "collapse";
	}
};

document.querySelectorAll("tbody tr").forEach((e) => {
	const full = e.children.length > 5;
	const startIdx = full ? 10 : 0;
	const op = {
		element: e as HTMLTableRowElement,
		mnemonic: (e.children[startIdx] as HTMLElement).innerText,
		op1: (e.children[startIdx + 1] as HTMLElement).innerText,
		op2: (e.children[startIdx + 2] as HTMLElement).innerText,
	};
	if (op.mnemonic === "") {
		op.element.parentElement!.remove();
		return;
	}
	ops.push(op);
});
console.debug(ops);

document.getElementById("filter")!.addEventListener("input", (e) => {
	applyFilter((e.target as HTMLInputElement).value);
});
