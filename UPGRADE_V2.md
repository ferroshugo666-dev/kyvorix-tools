# Kyvorix 2.0 upgrade

## Added
- Shared professional interaction layer across all tools.
- Consistent download confirmation toast.
- Selected-file details and processing status feedback.
- Lightweight progress feedback without interfering with each converter's existing logic.
- Recently used tools stored locally.
- Favorite tools with local persistence.
- Popular workflow shortcuts on the homepage.
- Sticky translucent navigation and stronger focus/accessibility states.
- Corrected the WebP to JPG CSS transition typo.

## Notes
This upgrade intentionally keeps the existing conversion logic intact to avoid breaking working tools. The next technical phase should be a per-tool deep code audit (including multi-file/batch processing and before/after comparison where the tool output supports it).
