import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/password";


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
           * Only active users can log in.
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


          /*
           * Passwords are stored and verified
           * using the shared implementation in
           * src/lib/password.ts.
           *
           * Format:
           *
           * scrypt$salt$derivedKey
           */

          const validPassword =
            await verifyPassword(
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

        /*
         * On initial sign-in, store the user ID.
         */

        if (user) {

          token.id =
            user.id;

        }


        /*
         * Always refresh role and status from
         * the database.
         *
         * This means role/status changes made
         * by an admin take effect for existing
         * sessions.
         */

        const userId =
          typeof token.id === "string"
            ? token.id
            : "";


        if (userId) {

          const currentUser =
            await prisma.user.findUnique({

              where: {
                id: userId,
              },

              select: {

                role: true,

                status: true,

              },

            });


          if (!currentUser) {

            token.id =
              "";

            token.role =
              "USER";

            token.status =
              "DISABLED";

          } else {

            token.role =
              currentUser.role;

            token.status =
              currentUser.status;

          }

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
