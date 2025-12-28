/**
 * Component test for StepCard
 */
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepCard } from "../../src/components/StepCard";
import type { XRayStep } from "@xray/sdk";

describe("StepCard", () => {
  const mockStep: XRayStep = {
    id: "step-1",
    name: "test_step",
    createdAt: Date.now(),
    input: { data: "test" },
    reasoning: "Test reasoning",
  };

  it("should render step name", () => {
    render(<StepCard step={mockStep} index={0} />);
    expect(screen.getByText("test_step")).toBeInTheDocument();
  });

  it("should render step number", () => {
    render(<StepCard step={mockStep} index={0} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should show reasoning when expanded", async () => {
    render(<StepCard step={mockStep} index={0} />);
    const card = screen.getByTestId("step-card");

    await act(async () => {
      fireEvent.click(card);
    });

    expect(screen.getByText("Test reasoning")).toBeInTheDocument();
  });
});

