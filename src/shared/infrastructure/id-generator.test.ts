import { describe, expect, it } from "vitest";
import { parseId } from "@/shared/domain/id";
import { randomIdGenerator } from "./id-generator";

describe("randomIdGenerator", () => {
  it("el id generado pasa parseId y lleva el prefijo", () => {
    const id = randomIdGenerator(() => "123e4567-e89b-12d3-a456-426614174000").next("prj");
    expect(id).toBe("prj_123e4567e89b12d3a456426614174000");
    expect(parseId(id).ok).toBe(true);
  });

  it("con el generador por defecto produce ids distintos y válidos", () => {
    const gen = randomIdGenerator();
    const a = gen.next("par");
    const b = gen.next("par");
    expect(a).not.toBe(b);
    expect(parseId(a).ok).toBe(true);
  });
});
