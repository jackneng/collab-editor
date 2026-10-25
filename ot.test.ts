import { test } from "node:test";
import assert from "node:assert/strict";

import { applyOperation, transformOperation } from "./ot";

// Test applyOperation
test("insert at the beginning", () => {
    assert.equal(
        applyOperation("ABC", {
            type: "insert",
            pos: 0,
            text: "X"
        }),
        "XABC"
    )
})

test("insert in the middle", () => {
    assert.equal(
        applyOperation("ABC", {
            type: "insert",
            pos: 1,
            text: "X",
        }),
        "AXBC"
    );
});

test("insert at the end", () => {
    assert.equal(
        applyOperation("ABC", {
            type: "insert",
            pos: 3,
            text: "X",
        }),
        "ABCX"
    );
});


test("delete 1 char", () => {
    assert.equal(
        applyOperation("ABC", {
            type: "delete",
            pos: 1,
            length: 1,
        }),
        "AC"
    );
});

test("delete multi chars", () => {
    assert.equal(
        applyOperation("ABCDEFG", {
            type: "delete",
            pos: 2,
            length: 3,
        }),
        "ABFG"
    );
});

test("invalid insertion pos", () => {
    assert.throws(() =>
        applyOperation("ABC", {
            type: "insert",
            pos: 10,
            text: "X",
        })
    );
});

test("rejects invalid deletion ranges", () => {
    assert.throws(() =>
        applyOperation("ABC", {
            type: "delete",
            pos: -1,
            length: 1,
        })
    );

    assert.throws(() =>
        applyOperation("ABC", {
            type: "delete",
            pos: 2,
            length: 2,
        })
    );

    assert.throws(() =>
        applyOperation("ABC", {
            type: "delete",
            pos: 1,
            length: -1,
        })
    );
});

test("rejects non-integer positions and lengths", () => {
    assert.throws(() =>
        applyOperation("ABC", {
            type: "insert",
            pos: 1.5,
            text: "X",
        })
    );

    assert.throws(() =>
        applyOperation("ABC", {
            type: "delete",
            pos: 1,
            length: 1.5,
        })
    );
});


// Test transformOperation
test("concurrent insertions converge", () => {
  const initial = "ABC";

  const opA = {
    type: "insert",
    pos: 1,
    text: "X",
  } as const;

  const opB = {
    type: "insert",
    pos: 1,
    text: "Y",
  } as const;

  const BPrime = transformOperation(opB, opA);
  const APrime = transformOperation(opA, opB);

  const result1 = applyOperation(
    applyOperation(initial, opA),
    BPrime
  );

  const result2 = applyOperation(
    applyOperation(initial, opB),
    APrime
  );

  assert.equal(result1, result2);
  assert.equal(result1, "AXYBC");
});

test("concurrent overlapping deletions converge", () => {
    const initial = "ABCDEFGHIJ";

    const opA = {
        type: "delete",
        pos: 2,
        length: 4
    } as const;

    const opB = {
        type: "delete",
        pos: 4,
        length: 4
    } as const;

    const BPrime = transformOperation(opB, opA);
    const APrime = transformOperation(opA, opB);

    const result1 = applyOperation(
        applyOperation(initial, opA),
        BPrime
    );

    const result2 = applyOperation(
        applyOperation(initial, opB),
        APrime
    );

    assert.equal(result1, result2);
    assert.equal(result1, "ABIJ");
})


test("concurrent non-overlapping deletions converge", () => {
    const initial = "ABCDEFGHIJ";

    const opA = {
        type: "delete",
        pos: 1,
        length: 2
    } as const;

    const opB = {
        type: "delete",
        pos: 7,
        length: 2
    } as const;

    const BPrime = transformOperation(opB, opA);
    const APrime = transformOperation(opA, opB);

    const result1 = applyOperation(
        applyOperation(initial, opA),
        BPrime
    );

    const result2 = applyOperation(
        applyOperation(initial, opB),
        APrime
    );

    assert.equal(result1, result2);
    assert.equal(result1, "ADEFGJ");
})


test("concurrent A contains B deletions converge", () => {
    const initial = "ABCDEFGHIJ";

    const opA = {
        type: "delete",
        pos: 2,
        length: 5
    } as const;

    const opB = {
        type: "delete",
        pos: 3,
        length: 2
    } as const;

    const BPrime = transformOperation(opB, opA);
    const APrime = transformOperation(opA, opB);

    const result1 = applyOperation(
        applyOperation(initial, opA),
        BPrime
    );

    const result2 = applyOperation(
        applyOperation(initial, opB),
        APrime
    );

    assert.equal(result1, result2);
    assert.equal(result1, "ABHIJ");
})


test("concurrent identical deletions converge", () => {
    const initial = "ABCDEFGHIJ";

    const opA = {
        type: "delete",
        pos: 2,
        length: 3
    } as const;

    const opB = {
        type: "delete",
        pos: 2,
        length: 3
    } as const;

    const BPrime = transformOperation(opB, opA);
    const APrime = transformOperation(opA, opB);

    const result1 = applyOperation(
        applyOperation(initial, opA),
        BPrime
    );

    const result2 = applyOperation(
        applyOperation(initial, opB),
        APrime
    );

    assert.equal(result1, result2);
    assert.equal(result1, "ABFGHIJ");
})

test("insertion before deletion", () => {
    const initial = "ABCDE";

    const ins = {
        type: "insert",
        pos: 1,
        text: "X"
    } as const;

    const del = {
        type: "delete",
        pos: 2,
        length: 2
    } as const;

    // insert first, transform delete
    const delPrime = transformOperation(del, ins);
    const result1 = applyOperation(
        applyOperation(initial, ins),
        delPrime
    );

    // delete first, transform insert
    const insPrime = transformOperation(ins, del);
    const result2 = applyOperation(
        applyOperation(initial, del),
        insPrime
    );

    assert.equal(result1, result2);
    assert.equal(result1, "AXBE");
})
