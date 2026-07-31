# Taste

## Communication
- Gives implementation tasks by pasting the exact backend endpoint URL and the raw API response envelope (e.g., `{isError, dataModel, statusCode, success, message}`), expecting the assistant to wire up the call and type DTOs from the pasted response shape. Confidence: 0.7
- Writes terse, minimal task instructions (e.g., "call this API" plus a URL) rather than detailed specs, leaving the wiring and conventions to the assistant. Confidence: 0.6

## Coding style
- Expects new backend calls to follow the project's layered convention: a service function in `src/services/*.service.ts`, typed request/response DTOs in `src/dtos/req|res`, a react-query mutation hook in `src/hooks/*.ts`, then wiring in the component — mirroring sibling modules (e.g., the audit-template publish pattern). Confidence: 0.6
- Prefers using the backend's dedicated action endpoints over flag-based fields like `isPublished` when the backend provides them, but applies this per module rather than uniformly: the inspection template publish goes through `POST /api/InspectionTemplate/{id}/publish` with a `{userId, subCompanyId}` payload, while the audit module was explicitly reverted to flag-based publish (user asked to remove the `publishSavedTemplate` helper from the audit module). Confidence: 0.5

## Workflow & tooling
- Uses Figma as the design source for UI implementation: asks to add the Figma MCP server to the tool config, pastes Figma design links (with `node-id` and `&m=dev`) as the spec, and expects the assistant to implement the design (layout, colors, typography, chart style) from it. Confidence: 0.6
# Coding Style & Architecture

- Prefers prop-driven component design over creating separate components for each visual variant; favors using props (e.g., `title`, `subtitle`, config options) to handle UI differences rather than introducing a new component for every design variation. Confidence: 0.9

- Values codebase cleanliness through deduplication of similarly shaped components across modules (e.g., merging copy-paste card components into shared, generic ones). Confidence: 0.8
