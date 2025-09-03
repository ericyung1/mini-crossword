import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
