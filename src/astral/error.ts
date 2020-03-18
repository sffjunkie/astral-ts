class KeyError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class ValueError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class MathError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export { KeyError, ValueError, MathError };
