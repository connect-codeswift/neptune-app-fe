import type { SiteUserDto } from "@/dtos/res/user-response.dto";
import { readUserProfileUrl } from "@/dtos/res/user-response.dto";

/**
 * Who the people named on an incident actually are — their real name and photo.
 *
 * Only the affected person is stored with a user id. Responders, witnesses,
 * routing members and sign-off rows carry a name and nothing else, so there is
 * no id to look them up by — but they were picked from the site roster when the
 * incident was filed, so their name matches a real user's. One roster fetch
 * therefore covers every person on the page, keyed by id, name and email.
 *
 * The roster is deliberately the source rather than `GET /users/{id}`, which is
 * restricted to Ehs_Director, Ehs_Lead and Ehs_Manager. A Supervisor or Worker
 * calling that gets a 403, so resolving the affected person through it left
 * exactly those roles looking at "Name not recorded" on incidents everyone else
 * could read. `GET /sites/{siteId}/users` is open to all five roles.
 *
 * Matching on name is looser than an id, and two employees who genuinely share
 * a name would resolve to the same person; that is accepted because the roster
 * is scoped to a single site, and because the alternative is no name and no
 * photo for anyone but the affected person.
 *
 * A name matching nobody — a contractor or visitor typed as free text, who has
 * no account by definition — simply has no entry, and the caller falls back to
 * whatever the record itself says.
 */
export type PeopleDirectoryEntry = Readonly<{
  name: string;
  photoUrl: string | null;
}>;

export type PeoplePhotoIndex = ReadonlyMap<string, PeopleDirectoryEntry>;

export const EMPTY_PEOPLE_PHOTO_INDEX: PeoplePhotoIndex = new Map();

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildPeoplePhotoIndex(
  users: readonly SiteUserDto[],
): PeoplePhotoIndex {
  const index = new Map<string, PeopleDirectoryEntry>();

  for (const user of users) {
    const name = (user.fullName ?? "").trim();
    const entry: PeopleDirectoryEntry = {
      name,
      photoUrl: readUserProfileUrl(user) || null,
    };

    // Id first: it is the only key that identifies rather than describes, and
    // it is what the affected person is stored as.
    const id = String(user.id);
    if (user.id > 0 && !index.has(id)) {
      index.set(id, entry);
    }

    // First writer wins on the looser keys: the roster is ordered by name, so a
    // duplicate is the same person twice far more often than two people.
    const nameKey = normalizeKey(name);
    if (nameKey && !index.has(nameKey)) {
      index.set(nameKey, entry);
    }

    const emailKey = normalizeKey(user.email ?? "");
    if (emailKey && !index.has(emailKey)) {
      index.set(emailKey, entry);
    }
  }

  return index;
}

/** The first roster entry matching any of the given id/name/email candidates. */
export function lookupPeoplePerson(
  index: PeoplePhotoIndex,
  ...candidates: readonly (string | null | undefined)[]
): PeopleDirectoryEntry | null {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const hit = index.get(normalizeKey(candidate));
    if (hit) {
      return hit;
    }
  }

  return null;
}

/**
 * The photo for one person, by whichever of their name or id the row carries.
 * `null` when nothing matches, which is the initials case.
 */
export function lookupPeoplePhoto(
  index: PeoplePhotoIndex,
  ...candidates: readonly (string | null | undefined)[]
): string | null {
  return lookupPeoplePerson(index, ...candidates)?.photoUrl ?? null;
}
