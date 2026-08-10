import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

import {
  prisma,
} from "@/lib/prisma";

import {
  scryptSync,
  timingSafeEqual,
} from "crypto";


function verifyPassword(
  password: string,
  storedHash: string
): boolean {

  const parts =
    storedHash.split(":");


  if (parts.length !== 2) {
    return false;
  }


  const [
    salt,
    key,
  ] = parts;


  const derivedKey =
    scryptSync(
      password,
      salt,
      64
    );


  const storedKey =
    Buffer.from(
      key,
      "hex"
    );


  if (
    storedKey.length !==
    derivedKey.length
  ) {
    return false;
  }


  return timingSafeEqual(
    storedKey,
    derivedKey
  );

}


export const {
  handlers,
  signIn,
  signOut,
  auth,
} =
  NextAuth({

    providers: [

      Credentials({

        credentials: {

          email: {
            label: "Email",
            type: "email",
          },

          password: {
            label: "Password",
            type: "password",
          },

        },


        async authorize(
          credentials
        ) {

          const email =
            typeof credentials?.email === "string"
              ? credentials.email
                  .trim()
                  .toLowerCase()
              : "";


          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";


          if (
            !email ||
            !password
          ) {
            return null;
          }


          const user =
            await prisma.user.findUnique({

              where: {
                email,
              },

            });


          if (!user) {
            return null;
          }


          /*
           * Users must be explicitly approved
           * before they can log in.
           */

          if (
            user.status !==
            "ACTIVE"
          ) {
            return null;
          }


          /*
           * Accounts without a password cannot
           * authenticate with credentials.
           */

          if (
            !user.passwordHash
          ) {
            return null;
          }


          const validPassword =
            verifyPassword(
              password,
              user.passwordHash
            );


          if (!validPassword) {
            return null;
          }


          return {

            id:
              user.id,

            name:
              user.name,

            email:
              user.email,

            role:
              user.role,

          };

        },

      }),

    ],


    session: {
      strategy: "jwt",
    },


    callbacks: {

      async jwt({
        token,
        user,
      }) {

        if (user) {

          token.id =
            user.id;

          token.role =
            user.role;

        }


        return token;

      },


      async session({
        session,
        token,
      }) {

        if (
          session.user
        ) {

          session.user.id =
            typeof token.id === "string"
              ? token.id
              : "";


          session.user.role =
            typeof token.role === "string"
              ? token.role
              : "USER";

        }


        return session;

      },

    },


    pages: {
      signIn: "/login",
    },

  });
