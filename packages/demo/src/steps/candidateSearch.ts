/**
 * Step 2: Candidate Search (Mock API)
 */
import type { XRaySession } from "@xray/sdk";
import { mockProducts, type Product } from "../data/mockProducts";

export async function searchCandidates(
  xray: XRaySession,
  keywords: string[],
  limit: number = 50
): Promise<Product[]> {
  // Simulate API search delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock search: return products that match keywords
  const candidates = mockProducts
    .filter((p) => {
      const titleLower = p.title.toLowerCase();
      return (
        titleLower.includes("water") &&
        titleLower.includes("bottle") &&
        !titleLower.includes("brush") &&
        !titleLower.includes("replacement") &&
        !titleLower.includes("carrier")
      );
    })
    .slice(0, limit);

  await xray.step("candidate_search", (step) => {
    step.input({
      keywords,
      limit,
    });

    step.output({
      total_results: mockProducts.length,
      candidates_fetched: candidates.length,
      candidates: candidates.map((c) => ({
        asin: c.asin,
        title: c.title,
        price: c.price,
        rating: c.rating,
        reviews: c.reviews,
      })),
    });

    step.reasoning(
      `Fetched top ${candidates.length} results by relevance; ${mockProducts.length} total matches found`
    );
  });

  return candidates;
}

