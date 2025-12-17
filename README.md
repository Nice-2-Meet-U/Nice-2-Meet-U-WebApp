This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
First run `npm install`
Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuration

The frontend reads these build-time environment variables (for example in `.env.local`). All three are required in every environment and must be `https://` URLs—builds will fail if they are missing or malformed:

```
NEXT_PUBLIC_FEEDBACK_BASE_URL=<https://your-feedback-service>
NEXT_PUBLIC_USER_BASE_URL=<https://your-user-service>
NEXT_PUBLIC_PROFILE_BASE_URL=<https://your-profile-service>
```

## Auth + Protected Profile Quickstart

- Visit `/auth/connect` to exercise auth flows against the Users service:
  - Sign up (`POST /auth/signup`) and log in (`POST /auth/login`) store the returned JWT locally.
  - “Continue with Google” links to `/auth/google`; callback handled at `/auth/google/callback` which stores `{ token, user }`.
  - “Me” calls `/auth/me` with `Authorization: Bearer <token>` (also sends cookies).
  - “Protected profile” calls `/profiles/me` on the profile service with the same token.
  - “Logout” calls `/auth/logout` and clears the stored token.
- Base URLs can be overridden via env vars above. The UI shows raw JSON responses for visibility.

### Google OAuth callback gotchas

- The frontend never controls the callback host; Google redirects to whatever your backend advertises at `/auth/google`. Make sure the backend env var (for example `GOOGLE_REDIRECT_URI`) is set to `https://nice2meetu.me/auth/google/callback` without a port in production.
- In Google Cloud Console, the Authorized redirect URI must match exactly: `https://nice2meetu.me/auth/google/callback`.
- `NEXT_PUBLIC_USER_BASE_URL` should also point to `https://nice2meetu.me` (no `:8000`) so the login button calls the correct backend host.
- If you still see a port (e.g., `:8000`) in the redirect URL, the backend process is still reading an old env value—check the runtime logs/env and redeploy with the corrected value.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
