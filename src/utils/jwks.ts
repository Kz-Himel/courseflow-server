import { createRemoteJWKSet } from "jose-cjs";

export const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);