import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email"

// Build providers array conditionally
const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            const user = await prisma.user.findUnique({
                where: {
                    email: credentials.email,
                },
            })

            if (!user || !user.password) {
                return null
            }

            const isPasswordValid = await compare(
                credentials.password,
                user.password
            )

            if (!isPasswordValid) {
                return null
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        },
    }),
]

// Google Provider removed as per requirement

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
    },
    providers,
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        }
    },
    events: {
        async createUser(message) {
            console.log("EVENT: createUser triggered", message)
            const { user } = message
            if (user.email && user.name) {
                console.log("EVENT: Sending welcome email to", user.email)
                await sendWelcomeEmail(user.email, user.name)
            } else {
                console.log("EVENT: Missing email or name", user)
            }
        }
    }
}
