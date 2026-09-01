import type { ReportIncidentFormState } from "@/forms/incident-module/form-state";
import type { ReportPhotoFile } from "@/forms/incident-module/attachments";

/**
 * Shape of the json stored in a saved draft.
 *
 * Bump this whenever a change would make an already-saved payload restore
 * *wrongly* rather than merely incompletely. Adding a field does not qualify:
 * the wizard fills anything missing from its own defaults, so an older payload
 * simply comes back with the new field empty. Renaming or repurposing one does,
 * because the old value would land somewhere it does not belong.
 */
export const REPORT_DRAFT_PAYLOAD_VERSION = 1;

/**
 * A photo as it is worth storing: everything the wizard needs to show it again,
 * and nothing that only meant something in the session that uploaded it.
 *
 * `previewUrl` is a `blob:` url pointing into the browser that created it. It is
 * dead the moment that page unloads, so persisting one guarantees a broken
 * thumbnail on resume. `isUploading` and `error` describe an upload that is over
 * by the time anything is saved.
 */
function toDraftPhoto(photo: ReportPhotoFile): ReportPhotoFile {
  const {
    previewUrl: _previewUrl,
    isUploading: _isUploading,
    error: _error,
    ...rest
  } = photo;

  return rest;
}

/**
 * The wizard state, ready to be stored.
 *
 * <p>Photos that never finished uploading are dropped rather than saved. They
 * have no `publicId`, so there is nothing on the server to restore them from,
 * and keeping the row would put a permanently broken attachment in front of the
 * reporter on every resume.</p>
 */
export function toDraftPayload(
  form: ReportIncidentFormState,
): Record<string, unknown> {
  const photos = (form.photos ?? [])
    .filter((photo) => !photo.isUploading && !photo.error && photo.publicId)
    .map(toDraftPhoto);

  return { ...form, photos };
}

/**
 * A stored payload, back into wizard state.
 *
 * <p>Returns a partial rather than a whole form on purpose: the caller merges it
 * over `createInitialReportFormState()`, so a payload written before a field
 * existed restores with that field at its default instead of `undefined`, which
 * is what would otherwise reach an input and turn it uncontrolled.</p>
 *
 * <p>Null means "do not restore this": either it is not an object, or it was
 * written by a version this build does not know how to read. Half-restoring a
 * report and letting someone submit whatever survived is worse than asking them
 * to start again.</p>
 */
export function fromDraftPayload(
  payload: unknown,
  payloadVersion: number,
): Partial<ReportIncidentFormState> | null {
  if (payloadVersion !== REPORT_DRAFT_PAYLOAD_VERSION) {
    return null;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return null;
  }

  return payload as Partial<ReportIncidentFormState>;
}
