/**
 * Step 3: Filter & Rank Selection
 */
import type { XRaySession } from "@xray/sdk";
import type { Product } from "../data/mockProducts";

interface RankedCandidate extends Product {
  score: number;
  scoreBreakdown: {
    reviewCountScore: number;
    ratingScore: number;
    priceProximityScore: number;
  };
}

export async function filterAndRank(
  xray: XRaySession,
  candidates: Product[],
  referenceProduct: Product
): Promise<Product | null> {
  // Calculate filter ranges
  const priceMin = referenceProduct.price * 0.5;
  const priceMax = referenceProduct.price * 2.0;
  const minRating = 3.8;
  const minReviews = 100;

  // Filter qualified candidates
  const qualified = candidates.filter((candidate) => {
    const pricePassed = candidate.price >= priceMin && candidate.price <= priceMax;
    const ratingPassed = candidate.rating >= minRating;
    const reviewsPassed = candidate.reviews >= minReviews;
    return pricePassed && ratingPassed && reviewsPassed;
  });

  if (qualified.length === 0) {
    await xray.step("filter_and_rank", (step) => {
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
        price_range: {
          min: priceMin,
          max: priceMax,
          rule: "0.5x - 2x of reference price",
        },
        min_rating: {
          value: minRating,
          rule: "Must be at least 3.8 stars",
        },
        min_reviews: {
          value: minReviews,
          rule: "Must have at least 100 reviews",
        },
      });

      step.evaluate(candidates, (candidate) => {
        const pricePassed = candidate.price >= priceMin && candidate.price <= priceMax;
        const ratingPassed = candidate.rating >= minRating;
        const reviewsPassed = candidate.reviews >= minReviews;

        return {
          price_range: {
            passed: pricePassed,
            detail: pricePassed
              ? `$${candidate.price.toFixed(2)} is within $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`
              : `$${candidate.price.toFixed(2)} is outside range $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`,
          },
          min_rating: {
            passed: ratingPassed,
            detail: ratingPassed
              ? `${candidate.rating} >= ${minRating}`
              : `${candidate.rating} < ${minRating} threshold`,
          },
          min_reviews: {
            passed: reviewsPassed,
            detail: reviewsPassed
              ? `${candidate.reviews} >= ${minReviews}`
              : `${candidate.reviews} < ${minReviews} minimum`,
          },
        };
      });

      step.output({
        total_evaluated: candidates.length,
        passed: 0,
        failed: candidates.length,
      });
      step.reasoning("No candidates passed all filters");
    });
    return null;
  }

  // Rank qualified candidates
  const ranked: RankedCandidate[] = qualified.map((candidate) => {
    // Normalize scores (0-1)
    const maxReviews = Math.max(...qualified.map((c) => c.reviews));
    const reviewCountScore = candidate.reviews / maxReviews;

    const maxRating = Math.max(...qualified.map((c) => c.rating));
    const ratingScore = candidate.rating / maxRating;

    // Price proximity: closer to reference is better
    const priceDiff = Math.abs(candidate.price - referenceProduct.price);
    const maxPriceDiff = Math.max(
      ...qualified.map((c) => Math.abs(c.price - referenceProduct.price))
    );
    const priceProximityScore = 1 - priceDiff / (maxPriceDiff || 1);

    // Weighted total score
    const totalScore =
      reviewCountScore * 0.5 + ratingScore * 0.3 + priceProximityScore * 0.2;

    return {
      ...candidate,
      score: totalScore,
      scoreBreakdown: {
        reviewCountScore,
        ratingScore,
        priceProximityScore,
      },
    };
  });

  // Sort by score (descending)
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];

  await xray.step("filter_and_rank", (step) => {
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
      price_range: {
        min: priceMin,
        max: priceMax,
        rule: "0.5x - 2x of reference price",
      },
      min_rating: {
        value: minRating,
        rule: "Must be at least 3.8 stars",
      },
      min_reviews: {
        value: minReviews,
        rule: "Must have at least 100 reviews",
      },
    });

    step.evaluate(candidates, (candidate) => {
      const pricePassed = candidate.price >= priceMin && candidate.price <= priceMax;
      const ratingPassed = candidate.rating >= minRating;
      const reviewsPassed = candidate.reviews >= minReviews;

      return {
        price_range: {
          passed: pricePassed,
          detail: pricePassed
            ? `$${candidate.price.toFixed(2)} is within $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`
            : `$${candidate.price.toFixed(2)} is outside range $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`,
        },
        min_rating: {
          passed: ratingPassed,
          detail: ratingPassed
            ? `${candidate.rating} >= ${minRating}`
            : `${candidate.rating} < ${minRating} threshold`,
        },
        min_reviews: {
          passed: reviewsPassed,
          detail: reviewsPassed
            ? `${candidate.reviews} >= ${minReviews}`
            : `${candidate.reviews} < ${minReviews} minimum`,
        },
      };
    });

    step.select(best.asin, `Highest overall score (${best.score.toFixed(2)}) - top review count (${best.reviews}) with strong rating (${best.rating}★)`);

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
      ranking_summary: ranked.slice(0, 5).map((r, idx) => ({
        rank: idx + 1,
        asin: r.asin,
        title: r.title,
        score: r.score,
      })),
    });

    step.reasoning(
      `Applied price, rating, and review count filters to narrow candidates from ${candidates.length} to ${qualified.length}. Selected best match based on review count, rating, and price proximity.`
    );
  });

  return best;
}
