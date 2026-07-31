# Coding Style & Architecture

- Prefers prop-driven component design over creating separate components for each visual variant; favors using props (e.g., `title`, `subtitle`, config options) to handle UI differences rather than introducing a new component for every design variation. Confidence: 0.9

- Values codebase cleanliness through deduplication of similarly shaped components across modules (e.g., merging copy-paste card components into shared, generic ones). Confidence: 0.8
