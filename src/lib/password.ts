import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";

import {
  promisify,
} from "util";


const scrypt =
  promisify(scryptCallback);


const KEY_LENGTH = 64;


export async function hashPassword(
  password: string
): Promise<string> {

  const salt =
    randomBytes(16).toString("hex");


  const derivedKey =
    (await scrypt(
      password,
      salt,
      KEY_LENGTH
    )) as Buffer;


  return [
    "scrypt",
    salt,
    derivedKey.toString("hex"),
  ].join("$");

}


export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {

  const parts =
    storedHash.split("$");


  if (
    parts.length !== 3 ||
    parts[0] !== "scrypt"
  ) {

    return false;

  }


  const salt =
    parts[1];

  const storedKey =
    parts[2];


  if (
    !salt ||
    !storedKey
  ) {

    return false;

  }


  const derivedKey =
    (await scrypt(
      password,
      salt,
      KEY_LENGTH
    )) as Buffer;


  const storedKeyBuffer =
    Buffer.from(
      storedKey,
      "hex"
    );


  if (
    derivedKey.length !==
    storedKeyBuffer.length
  ) {

    return false;

  }


  return timingSafeEqual(
    derivedKey,
    storedKeyBuffer
  );

}
