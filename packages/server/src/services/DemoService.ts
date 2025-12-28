/**
 * Demo Service
 * Runs demo workflows to generate sample execution data
 */
import type { EventStore } from "@xray/sdk";
import { XRaySession, XRayStepBuilder } from "@xray/sdk";

// Mock data and functions (simplified versions from demo package)
interface Product {
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  category?: string;
}

const referenceProduct: Product = {
  asin: "B08XYZ123",
  title: "Stainless Steel Water Bottle 32oz",
  price: 24.99,
  rating: 4.5,
  reviews: 1250,
  category: "Kitchen & Dining",
};

// Mock LLM functions
function mockLLMGenerateKeywords(title: string, category: string): string[] {
  const words = title.toLowerCase().split(/\s+/);
  const keywords = [
    ...words.filter((w) => w.length > 3),
    category.toLowerCase(),
    "water bottle",
    "stainless steel",
  ];
  return [...new Set(keywords)].slice(0, 5);
}

function mockLLMReasoning(title: string): string {
  return `Extracted key terms from product title "${title}" to create search keywords for finding similar products.`;
}

// Mock products
const mockProducts: Product[] = [
  { asin: "B001", title: "Insulated Water Bottle 32oz", price: 22.99, rating: 4.6, reviews: 890 },
  { asin: "B002", title: "Stainless Steel Water Bottle 24oz", price: 19.99, rating: 4.4, reviews: 1200 },
  { asin: "B003", title: "Double Wall Water Bottle 32oz", price: 26.99, rating: 4.7, reviews: 2100 },
  { asin: "B004", title: "Leak Proof Water Bottle 32oz", price: 23.99, rating: 4.5, reviews: 950 },
  { asin: "B005", title: "BPA Free Water Bottle 32oz", price: 21.99, rating: 4.3, reviews: 750 },
];

async function generateKeywords(xray: XRaySession, product: Product): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const keywords = mockLLMGenerateKeywords(product.title, product.category || "");
  const reasoning = mockLLMReasoning(product.title);

  await xray.step("keyword_generation", (step: XRayStepBuilder) => {
    step.input({
      product_title: product.title,
      category: product.category || "Unknown",
    });
    step.output({ keywords, model: "gpt-4" });
    step.reasoning(reasoning);
  });

  return keywords;
}

async function searchCandidates(xray: XRaySession, keywords: string[], limit: number = 50): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const candidates = mockProducts.slice(0, limit);

  await xray.step("candidate_search", (step: XRayStepBuilder) => {
    step.input({ keywords, limit });
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
    step.reasoning(`Fetched top ${candidates.length} results by relevance`);
  });

  return candidates;
}

async function filterAndRank(xray: XRaySession, candidates: Product[], referenceProduct: Product): Promise<Product | null> {
  const priceMin = referenceProduct.price * 0.5;
  const priceMax = referenceProduct.price * 2.0;
  const minRating = 3.8;
  const minReviews = 100;

  const qualified = candidates.filter((candidate) => {
    return (
      candidate.price >= priceMin &&
      candidate.price <= priceMax &&
      candidate.rating >= minRating &&
      candidate.reviews >= minReviews
    );
  });

  if (qualified.length === 0) {
    await xray.step("filter_and_rank", (step: XRayStepBuilder) => {
      step.input({
        candidates_count: candidates.length,
        reference_product: {
          asin: referenceProduct.asin,
          title: referenceProduct.title,
          price: referenceProduct.price,
          rating: referenceProduct.rating,
          reviews: referenceProduct.reviews,
        },
      });
      step.filters({
        price_range: { min: priceMin, max: priceMax, rule: "0.5x - 2x of reference price" },
        min_rating: { value: minRating, rule: "Must be at least 3.8 stars" },
        min_reviews: { value: minReviews, rule: "Must have at least 100 reviews" },
      });
      step.output({ total_evaluated: candidates.length, passed: 0, failed: candidates.length });
      step.reasoning("No candidates passed all filters");
    });
    return null;
  }

  const best = qualified.sort((a, b) => b.reviews - a.reviews)[0];

  await xray.step("filter_and_rank", (step: XRayStepBuilder) => {
    step.input({
      candidates_count: candidates.length,
      reference_product: {
        asin: referenceProduct.asin,
        title: referenceProduct.title,
        price: referenceProduct.price,
        rating: referenceProduct.rating,
        reviews: referenceProduct.reviews,
      },
    });
    step.filters({
      price_range: { min: priceMin, max: priceMax, rule: "0.5x - 2x of reference price" },
      min_rating: { value: minRating, rule: "Must be at least 3.8 stars" },
      min_reviews: { value: minReviews, rule: "Must have at least 100 reviews" },
    });
    step.select(best.asin, `Highest review count (${best.reviews}) with strong rating (${best.rating}★)`);
    step.output({
      total_evaluated: candidates.length,
      passed: qualified.length,
      failed: candidates.length - qualified.length,
      selected_competitor: {
        asin: best.asin,
        title: best.title,
        price: best.price,
        rating: best.rating,
        reviews: best.reviews,
      },
    });
    step.reasoning(`Applied filters to narrow from ${candidates.length} to ${qualified.length} candidates. Selected best match.`);
  });

  return best;
}

async function runCompetitorSelection(store: EventStore, executionName: string): Promise<string> {
  const xray = new XRaySession({
    name: executionName,
    store,
  });

  try {
    const keywords = await generateKeywords(xray, referenceProduct);
    const candidates = await searchCandidates(xray, keywords, 50);
    await filterAndRank(xray, candidates, referenceProduct);
    await xray.complete();
    return xray.getId();
  } catch (error) {
    await xray.complete();
    throw error;
  }
}

export class DemoService {
  constructor(private store: EventStore) {}

  async runDemo(count: number = 3): Promise<{ executionIds: string[]; message: string }> {
    const executionIds: string[] = [];
    const executions = Array.from({ length: count }, (_, i) => `competitor_selection_${Date.now()}_${i + 1}`);

    for (const execName of executions) {
      try {
        const id = await runCompetitorSelection(this.store, execName);
        executionIds.push(id);
        // Small delay between executions
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to run ${execName}:`, error);
      }
    }

    return {
      executionIds,
      message: `Successfully generated ${executionIds.length} demo execution(s)`,
    };
  }
}

