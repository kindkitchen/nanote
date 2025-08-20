const subtle = crypto.subtle;
const NAME_OF_THE_ALGORITHM = "RSA-OAEP";
const NAME_OF_THE_HASH = "SHA-256";
const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();
const { privateKey, publicKey } = await subtle.generateKey(
  {
    name: NAME_OF_THE_ALGORITHM,
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: { name: NAME_OF_THE_HASH },
  },
  true,
  ["encrypt", "decrypt"],
);
const public_key_to_export = await subtle.exportKey("jwk", publicKey);
const imported_public_key = await subtle.importKey(
  "jwk",
  JSON.parse(JSON.stringify(public_key_to_export)),
  {
    name: NAME_OF_THE_ALGORITHM,
    hash: NAME_OF_THE_HASH,
  },
  true,
  ["encrypt"],
);

if (String(publicKey) !== String(imported_public_key)) {
  throw "Public key and it's imported version should be different";
}

const message = "Hello world!";
const cipher = await subtle.encrypt(
  NAME_OF_THE_ALGORITHM,
  imported_public_key,
  text_encoder.encode(message),
);

if (message === text_decoder.decode(cipher)) {
  throw "Encrypted message should be unreadable";
}

const decrypted = await subtle.decrypt(
  NAME_OF_THE_ALGORITHM,
  privateKey,
  cipher,
);

if (
  message !== text_decoder.decode(decrypted)
) {
  throw "Cipher should be decrypted to original message";
}
