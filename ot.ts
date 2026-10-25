export type InsertOperation = {
    type: "insert";
    pos: number;
    text: string;
}

export type DeleteOperation = {
    type: "delete";
    pos: number;
    length: number;
};

export type Operation =
    | InsertOperation
    | DeleteOperation;


export function applyOperation(
    document: string,
    operation: Operation
): string {
    if (operation.type === "insert") {
        const { pos, text } = operation;
        if (!Number.isInteger(pos) || pos<0 || pos>document.length) {
            throw new Error("Invalid insert position");
        }

        return document.slice(0, pos) + text + document.slice(pos);
    }

    if (operation.type === "delete") {
        const { pos, length } = operation;
        if (
            !Number.isInteger(pos) || !Number.isInteger(length) || 
            pos<0 ||length<0 || pos+length>document.length
        ) {
            throw new Error("Invalid delete range");
        }

        return document.slice(0, pos) + document.slice(pos+length);
    }

    throw new Error("Invalid operation");
}

export function transformOperation(
    operation: Operation,
    against: Operation
): Operation {
    if (against.type === "insert") {
        // Against another insertion
        const insertedLength = against.text.length;

        if (operation.type === "insert") {
            if (operation.pos > against.pos) {
                return { ...operation, pos: operation.pos+insertedLength };
            }

            if (operation.pos < against.pos) {
                return operation;
            }

            const operationComesFirst = operation.text.localeCompare(against.text) < 0;
            return {
                ...operation,
                pos: operationComesFirst ? operation.pos : operation.pos + insertedLength
            }
        }

        // delete
        if (operation.pos >= against.pos) {
            return { ...operation, pos: operation.pos+insertedLength };
        }
        return operation;

    } else {
        // Against another deletion
        const deleteStart = against.pos;
        const deleteEnd = against.pos+against.length;

        if (operation.type === "insert") {
            // If we insert

            if (operation.pos <= deleteStart) {
                return operation;
            }
            if (operation.pos >= deleteEnd) {
                return {
                    ...operation,
                    pos: operation.pos-against.length
                };
            }
            return { ...operation, pos: deleteStart };

        } else {
            // If we delete
            const start = operation.pos;
            const end = operation.pos+operation.length;

            if (end <= deleteStart) {
                return operation;
            }
            if (start >= deleteEnd) {
                return {
                    ...operation,
                    pos: operation.pos-against.length
                }
            }

            // overlaping deletions
            const overlapStart = Math.max(start, deleteStart);
            const overlapEnd = Math.min(end, deleteEnd);
            const overlap = Math.max(0, overlapEnd-overlapStart);

            if (start < deleteStart) {
                return {
                    ...operation,
                    length: operation.length-overlap
                }
            } else {
                return {
                    ...operation,
                    pos: deleteStart,
                    length: Math.max(0, operation.length-overlap)
                }
            }
        }
    }
}