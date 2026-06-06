import Whop from "@whop/sdk";

const whop = new Whop({ apiKey: process.env.WHOP_API_KEY });

export const handler = async (event) => {
  const corsHeaders = {
      "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
            };

              // Handle preflight
                if (event.httpMethod === "OPTIONS") {
                    return { statusCode: 204, headers: corsHeaders, body: "" };
                      }

                        try {
                            const { userId } = await whop.verifyUserToken(
                                  new Headers(event.headers)
                                      );
                                          return {
                                                statusCode: 200,
                                                      headers: corsHeaders,
                                                            body: JSON.stringify({ userId }),
                                                                };
                                                                  } catch (e) {
                                                                      console.error("Whop token verification failed:", e.message);
                                                                          return {
                                                                                statusCode: 401,
                                                                                      headers: corsHeaders,
                                                                                            body: JSON.stringify({ error: "unauthorized" }),
                                                                                                };
                                                                                                  }
                                                                                                  };
