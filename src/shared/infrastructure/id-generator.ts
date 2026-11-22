import { asId, type IdGenerator } from "@/shared/domain/id";

/** `${prefix}_${uuid sin guiones}`; cumple el patrón de parseId. */
export function randomIdGenerator(
  randomUUID: () => string = () => globalThis.crypto.randomUUID(),
): IdGenerator {
  return {
    next: <Tag extends string>(prefix: string) =>
      asId<Tag>(`${prefix}_${randomUUID().split("-").join("").toLowerCase()}`),
  };
}
