# PangaKupu Development Guidelines

## Conversational style
- Please be semi-formal and pleasant.
- Do not be hyperbolic with praise for what we're working on.
- Question my assumptions and decisions regarding development when needed
- If I ask you questions about problems or how to approach development, do not begin editing or creating code without consulting me
- Do not commit or publish changes without asking me first
- Do not proclaim you have fixed a problem unless you are 100% certain it is. Otherwise, just state you have identified and attempted to fix a problem but futher testing is needed
- Address me as "Keola" sometimes, if you like, but please don't get repetitive. Perhaps use it mostly when you are presenting an idea that you feel strongly about and I will take it as a sign that I need to consider it in depth.

## Architecture Principles

- Always keep in mind that any changes made to PangaKupu will need to be migrated to KimiKupu, so if you are making changes to files that originated in KimiKupu but were copied here for testing, those changes must be made in the KimiKupu file when we eventually migrate. Document this where necessary
- Always keep in mind the idea that as many graphical elements as possible and their dependencies be shared from a single source of truth for consistency. The header, overall menu structure, background, etc, knowing that these are just the first of a suite of language tools to be developed.

### Styling Requirements
- **NO CSS CLASSES** - Use only React Native compatible inline styles
- **NO className attributes** - Everything must work with React Native StyleSheet
- **Numeric values only** - Use `fontSize: 16` not `'16px'`, `letterSpacing: 0.3` not `'0.3px'`
- **No browser-specific properties** - Avoid `textSizeAdjust`, `WebkitTextSizeAdjust`, etc.
- **Inline styles for all components** - Prepare for native app conversion

### Cross-Platform Compatibility
- All styling must be React Native compatible
- Use StyleSheet-like object patterns: `const styles = { container: { ... } }`
- Font families: `'BCSans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'`

## Project Acronyms & References

- **KK** = KimiKupu (the template/reference app)
- **PK** = PangaKupu (this project)
- **RM** = Reo Moana (my umbrella organization)
- **RMCW** = Reo Moana Code Works (unit of RM specifically focused on language and technology projects)
- **DDG** = DuckDuckGo (browser testing reference)
- **haw** = Hawaiian language
- **mao** = Māori language
- **tah** = Tahitian language
- **sam** = Sāmoa language
- **ton** = Tonga language
- **fij** = Fijian language

## Shared Component Architecture
- PangaKupu should use the same component patterns as KimiKupu
- Header component should be shared/consistent between projects
- Modal system: BaseModal, InfoModal, AboutModal pattern
- Language infrastructure with hooks and registries

## Modifying data files
- Whenever you need to edit large data files, such as wordlists, translation files, etc., please consider if this is a task that may be repeated, that would be done quickly and more efficiently with a local python script and can that would cut down on the amount of time you must spend doing it online. We have already done this for some tasks.
- If it is clearly a one-time task that is so unique it might not need to be repeated, no need to do this.

## Font & Text Guidelines
- Use BC Sans font family consistently
- Character width calculations: Use 0.85em for text spacing (prevents overlap)
- Cross-browser consistency: Use numeric pixel values, not pt or em for fontSize
- Text alignment: Prevent overlap between "Reo Moana" and game name text

## Testing Requirements
- Test on both Chrome and DuckDuckGo for font consistency
- Verify mobile touch interactions don't cause button drift
- Ensure letter wheel buttons stay locked in position

## Commit Standards
- Suggest commits after completing each major task but don't do it until I say so.
- Use descriptive commit messages with architectural context
- Include React Native compatibility notes in commits

## Development Workflow
- Use TodoWrite for task tracking on complex multi-step work
- Deploy after significant changes when requested
- Maintain development server on port 8080
- Always look for and suggest ways of optimizing screen space and improving the UIX in both functionality and appearance.