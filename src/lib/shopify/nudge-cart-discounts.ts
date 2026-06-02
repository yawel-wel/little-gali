/**
 * Shopify sometimes returns pre-discount cart totals right after cartLinesAdd.
 * Re-submitting line quantities (unchanged) forces discount recalculation — same
 * effect as editing qty in checkout and returning.
 */
export async function nudgeShopifyCartDiscounts(cartId: string): Promise<boolean> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!storeDomain || !accessToken) {
    return false;
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": accessToken,
  };

  const linesQuery = `
    query cartLinesForNudge($id: ID!) {
      cart(id: $id) {
        lines(first: 20) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
    }
  `;

  const linesRes = await fetch(
    `https://${storeDomain}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: linesQuery,
        variables: { id: cartId },
      }),
    },
  );

  const linesJson = await linesRes.json();
  const edges = linesJson.data?.cart?.lines?.edges as
    | Array<{ node: { id: string; quantity: number } }>
    | undefined;

  if (!edges?.length || edges.length < 2) {
    return false;
  }

  const updateMutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        userErrors {
          message
        }
      }
    }
  `;

  const updateRes = await fetch(
    `https://${storeDomain}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: updateMutation,
        variables: {
          cartId,
          lines: edges.map(({ node }) => ({
            id: node.id,
            quantity: node.quantity,
          })),
        },
      }),
    },
  );

  const updateJson = await updateRes.json();
  const errors = updateJson.data?.cartLinesUpdate?.userErrors as
    | Array<{ message: string }>
    | undefined;

  if (errors?.length) {
    console.warn("cartLinesUpdate nudge failed:", errors[0]?.message);
    return false;
  }

  return true;
}
