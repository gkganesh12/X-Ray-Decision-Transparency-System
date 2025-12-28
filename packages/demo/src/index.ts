/**
 * Demo Application Entry Point
 * Runs multiple competitor selection workflows to generate sample data
 */
import { runCompetitorSelection } from "./workflows/competitorSelection";

async function main() {
  console.log("=".repeat(60));
  console.log("X-Ray Decision Transparency System - Demo Application");
  console.log("=".repeat(60));

  // Run multiple executions to generate sample data
  const executions = [
    "competitor_selection_1",
    "competitor_selection_2",
    "competitor_selection_3",
  ];

  for (const execName of executions) {
    try {
      await runCompetitorSelection(execName);
      console.log("\n" + "-".repeat(60) + "\n");
      
      // Small delay between executions
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to run ${execName}:`, error);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Demo completed! Check the dashboard to view executions.");
  console.log("=".repeat(60));
  console.log("\nTo view results:");
  console.log("1. Start the API server: npm run server");
  console.log("2. Start the dashboard: npm run dashboard");
  console.log("3. Open http://localhost:5173 in your browser");
  console.log("\n");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

