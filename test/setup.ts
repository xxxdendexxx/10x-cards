import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Rozszerzenie matcherów vitest o customowe matchery z jest-dom
expect.extend(matchers as any);

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});
