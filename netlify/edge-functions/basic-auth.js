export default async (request, context) => {
  const auth = request.headers.get("authorization");

  const username = Netlify.env.get("BASIC_AUTH_USER");
  const password = Netlify.env.get("BASIC_AUTH_PASS");

  const expected = "Basic " + btoa(`${username}:${password}`);

  if (auth !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Private Site"',
      },
    });
  }

  return context.next();
};

export const config = {
  path: "/*",
};