// @ts-check

/**
 * @typedef Op
 * @property element {Element}
 * @property mnemonic {string}
 * @property op1? {string}
 * @property op2? {string}
 */

/** @type Op[] */
const ops = [];

/**
 * @param op {Op}
 * @param query {string}
 * @returns bool
 */
const filter = (op, query) => {
	if (query !== "" && (op.mnemonic == "invalid" || op.mnemonic == "null"))
		return false;
	const m = query.split(" ")[0];
	return op.mnemonic.toLowerCase().includes(m.toLowerCase());
};

/**
 * @param query {string}
 */
const applyFilter = (query) => {
	for (const op of ops) {
		const show = filter(op, query);
		op.element.style.visibility = show ? "visible" : "collapse";
	}
	// document.getElementById('table1').offsetHeight;
};

document.querySelectorAll("tbody tr").forEach((e) => {
	const full = e.children.length > 5;
	const startIdx = full ? 10 : 0;
	/** @type Op */
	const op = {
		element: e,
		mnemonic: e.children[startIdx].innerText,
		op1: e.children[startIdx + 1].innerText,
		op2: e.children[startIdx + 2].innerText,
	};
	if (op.mnemonic === "") {
        op.element.parentElement.remove()
		return;
	}
	ops.push(op);
});
console.debug(ops);

document.getElementById("filter").addEventListener("input", (e) => {
	applyFilter(e.target.value);
});
