import type { SiteUserDto } from "@/dtos/res/user-response.dto";
import { readUserProfileUrl } from "@/dtos/res/user-response.dto";

/**
 * Profile photos for the people named on an incident.
 *
 * Only the affected person is stored with a user id. Responders, witnesses,
 * routing members and sign-off rows carry a name and nothing else, so there is
 * no id to look them up by — but they were picked from the site roster when the
 * incident was filed, so their name matches a real user's.
 *
 * One roster fetch therefore covers every person on the page. Matching on name
 * is looser than an id, and two employees who genuinely share a name would
 * resolve to the same photo; that is accepted here because the alternative is
 * no photo for anyone but the affected person, and because the roster is scoped
 * to a single site.
 *
 * A name that matches nobody — a contractor or visitor typed as free text, who
 * has no account by definition — simply has no entry, and the caller falls back
 * to initials.
 */
export type PeoplePhotoIndex = ReadonlyMap<string, string>;

export const EMPTY_PEOPLE_PHOTO_INDEX: PeoplePhotoIndex = new Map();

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildPeoplePhotoIndex(
  users: readonly SiteUserDto[],
): PeoplePhotoIndex {
  const index = new Map<string, string>();

  for (const user of users) {
    const photo = readUserProfileUrl(user);
    if (!photo) {
      continue;
    }

    const name = normalizeName(user.fullName ?? "");
    // First writer wins: the roster is ordered by name, so a duplicate is the
    // same person twice far more often than two different people.
    if (name && !index.has(name)) {
      index.set(name, photo);
    }

    const email = normalizeName(user.email ?? "");
    if (email && !index.has(email)) {
      index.set(email, photo);
    }
  }

  return index;
}

/**
 * The photo for one person, by whichever of their name or id the row carries.
 * Returns `null` when nothing matches, which is the initials case.
 */
export function lookupPeoplePhoto(
  index: PeoplePhotoIndex,
  ...candidates: readonly (string | null | undefined)[]
): string | null {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const hit = index.get(normalizeName(candidate));
    if (hit) {
      return hit;
    }
  }

  return null;
}
