import { render } from "@testing-library/react";
import App from "./App";

test("Smoke bomb App test", () => {
  render(<App />);
  expect(true).toBeTruthy();
});
