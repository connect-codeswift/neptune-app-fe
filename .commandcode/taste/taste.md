# Taste
See [taste/taste.md](taste/taste.md)
# Coding Style & Architecture

- Prefers prop-driven component design over creating separate components for each visual variant; favors using props (e.g., `title`, `subtitle`, config options) to handle UI differences rather than introducing a new component for every design variation. Confidence: 0.9

- Values codebase cleanliness through deduplication of similarly shaped components across modules (e.g., merging copy-paste card components into shared, generic ones). Confidence: 0.8

- Prefers building forms with the shared schema-driven `FormBuilder` component (declarative field configs with `required` flags, per-step schemas, `formId` + external submit buttons so built-in validation gates navigation) over hand-rolled form step components, even when a custom implementation already exists. Confidence: 0.9

- Prefers image uploads to go through the existing Cloudinary upload utility (storing returned secure URLs) rather than local-only previews/object URLs. Confidence: 0.8
