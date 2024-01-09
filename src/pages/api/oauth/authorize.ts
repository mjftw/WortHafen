// pages/api/oauth/authorize.js

import { getServerAuthSession } from "~/server/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { Err, Ok, type Result } from "ts-results";

import { createAuthorizationToken } from "~/server/api/oauth";
import { type Session } from "next-auth";

export default async function authorize(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // TODO: Check the ClientId and ClientSecret from request before accepting this request

  const maybeRedirectUrl = getRedirectUrl(req);
  if (maybeRedirectUrl.err) {
    console.log(maybeRedirectUrl.val);
    res.status(400).send("Bad request");
    return;
  }
  const redirectUrl = maybeRedirectUrl.val;

  const session = await getServerAuthSession({ req, res });

  if (!session) {
    return await unauthenticatedFlow(req, res);
  }

  return await authenticatedFlow(req, res, session, redirectUrl);
}

async function authenticatedFlow(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  redirectUrl: URL,
) {
  const authorizationToken = await createAuthorizationToken(session.user.id);
  redirectUrl.searchParams.set("code", authorizationToken.code);

  // Redirect to the client's callback URL with the authorization code
  res.redirect(redirectUrl.toString());
}

async function unauthenticatedFlow(req: NextApiRequest, res: NextApiResponse) {
  const initialUrl = req.url;

  if (!initialUrl) {
    console.log("Invalid initial URL");
    res.status(400).send("Bad request");
    return;
  }

  // Encode the current query parameters
  // Redirect to the sign-in page with the original query parameters
  res.redirect(
    `/api/auth/signin?callbackUrl=${encodeURIComponent(initialUrl.toString())}`,
  );
  return;
}

function getRedirectUrl(req: NextApiRequest): Result<URL, string> {
  const redirectUrlQuery = req.query.redirect_uri;
  const invalidUrlError = Err("Invalid redirect_uri query parameter");

  if (typeof redirectUrlQuery !== "string") {
    return invalidUrlError;
  }

  try {
    const url = new URL(redirectUrlQuery);
    return Ok(url);
  } catch (err) {
    return invalidUrlError;
  }
}
