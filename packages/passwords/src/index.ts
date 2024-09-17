async function sha256(data: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(data)

    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return hashHex
}

/**
 * Function to generate a hashed password from a given password and salt.
 * @param password The password to be hashed.
 * @param salt An optional salt for hashing the password.
 * @returns The hashed password.
 */
function passwordFromSalt(password: string, salt?: string): string {
    return sha256(password + (salt || "")).toString()
}

/**
 * Lightweight promise-based password hasher alternative to bcrypt.
 */
export class PasswordHasher {
    private readonly layers: number
    private static instance: PasswordHasher

    /**
     * Creates an instance of the PasswordHasher.
     * @param layers The number of times a password is hashed.
     * @throws Error if layers is not a number or is less than 1.
     */
    private constructor(layers: number) {
        this.layers = layers
        if (typeof layers !== "number") {
            throw new Error("password layers need to be a number")
        }
        if (layers < 1) {
            throw new Error("layers must be at least 1")
        }
    }

    public static getInstance(): PasswordHasher {
        if (!PasswordHasher.instance) {
            PasswordHasher.instance = new PasswordHasher(12)
        }
        return PasswordHasher.instance
    }

    /**
     * Hashes the given password asynchronously or synchronously.
     * @param password The password to hash.
     * @param salt An optional salt.
     * @returns the hash of the password
     */
    public async hash(password: string, salt?: string): Promise<string> {
        let finalHash: string
        let virtual = passwordFromSalt(password, salt)
        const layer = this.layers

        for (let i = 0; i < layer; i++) {
            const virtualHash = await sha256(virtual)
            virtual = virtualHash.toString()
        }

        const virtualFinalHash = await sha256(virtual)
        finalHash = virtualFinalHash.toString()
        return finalHash as string
    }

    /**
     * Compares a password with its hash to verify if they match.
     * @param password The password to be compared.
     * @param hash The hash of the password to be compared against.
     * @param salt An optional salt.
     * @returns True if the password matches the hash.
     */
    public async compare(password: string, hash: string, salt?: string): Promise<boolean> {
        const valid = await this.hash(password, salt) === hash
        return valid
    }
}
