export type {};

declare global {
	interface Array<T> {
		at(index: number): T | undefined;
	}
}

type Op = {
	element: HTMLTableRowElement;
	mnemonic: string;
	op1?: string;
	op2?: string;
};

const ops: Op[] = [];

const debounce = (f: (...args: any[]) => void, delay: number) => {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => f(...args), delay);
	};
};

const filter = (op: Op, query: string): boolean => {
	const opOk = (o: string | undefined, q: string | undefined) => {
		if (!q) return true;
		if (q === "_") return true;
		if (!o) return false;
		switch (q) {
			case "_":
				return true;
			case "r":
				return o.startsWith("r");
			case "m":
				return o.startsWith("m") || o.startsWith("r/m");
			case "i":
				return o.startsWith("i");
			default:
				return o.startsWith(q);
		}
	};
	if (query !== "" && (op.mnemonic == "invalid" || op.mnemonic == "null"))
		return false;
	const m = query.split(" ")[0];
	const op1 = query.split(" ").at(1);
	const op2 = query.split(" ").at(2);
	const mnemOk = op.mnemonic.toLowerCase().includes(m.toLowerCase());
	const op1Ok = opOk(op.op1, op1);
	const op2Ok = opOk(op.op2, op2);
	return mnemOk && op1Ok && op2Ok;
};

const applyFilter = (query: string) => {
	for (const op of ops) {
		const show = filter(op, query);
		op.element.style.visibility = show ? "visible" : "collapse";
	}
};

document.querySelectorAll("tbody tr").forEach((e) => {
	const op = {
		element: e as HTMLTableRowElement,
		mnemonic: (e.children[10] as HTMLElement).innerText,
		op1: (e.children[11] as HTMLElement).innerText,
		op2: (e.children[12] as HTMLElement).innerText,
	};
	if (op.mnemonic === "") {
		op.element.remove();
		return;
	}
	ops.push(op);
});
console.debug(ops);

document.getElementById("filter")!.addEventListener(
	"input",
	debounce((e) => {
		applyFilter((e.target as HTMLInputElement).value);
	}, 20),
);
