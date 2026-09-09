import { prisma } from "../db";

export function slugify(text: string): string {
  const slug = (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except whitespace and hyphens
    .replace(/[\s_-]+/g, "-") // replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens

  return slug || "org";
}

export const generateSlug = slugify;

export async function generateUniqueOrgSlug(name: string, excludeOrgId?: string): Promise<string> {
  const baseSlug = slugify(name);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.organization.findFirst({
      where: {
        slug: candidate,
        ...(excludeOrgId ? { id: { not: excludeOrgId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}
