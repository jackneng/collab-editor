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