# KimiKupu Architecture Migration Plan
## Phase 2: Shared Component Library Implementation

This document outlines the complete migration plan to make PangaKupu fully compatible with KimiKupu's architecture by implementing KimiKupu's shared component system.

## Current Status
✅ **Phase 1 Complete**: Basic KimiKupu structure replicated
- Header.tsx copied to exact location (src/Header.tsx)
- scrollPrevention.css copied to src/styles/
- @bcgov/bc-sans dependency installed
- App.tsx container structure updated to match KimiKupu pattern
- Import paths aligned with KimiKupu structure

## Architecture Analysis

### KimiKupu Shared Component Architecture

#### 1. Modal System
**Location**: `/src/components/modals/`
**Components**:
- `BaseModal.tsx` - Core modal wrapper using Headless UI
- `InfoModal.tsx` - Game instructions modal
- `LanguageSelectionModal.tsx` - Complex language/game settings modal
- `StatsModal.tsx` - Game statistics modal
- `AboutModal.tsx` - About/credits modal

**Dependencies**:
- `@headlessui/react` (Dialog, Transition)
- `@heroicons/react/outline` (XCircleIcon)

**Key Features**:
- Consistent modal styling and animations
- Overlay backdrop with opacity transitions
- Responsive design (mobile/desktop)
- Keyboard/click-outside closing
- Standardized close button placement

#### 2. Language Infrastructure
**Core Hooks**:
- `useLanguage.ts` - Game language management
- `useInterfaceLanguage.ts` - UI text localization
- `useWordLength.ts` - Word length configuration

**Language System Components**:
- Language registry system (`/src/languages/registry.ts`)
- Interface language registry (`/src/languages/interface/interfaceRegistry.ts`)
- Language loaders for dynamic loading
- Translation system with fallbacks

**Features**:
- Multi-language game wordlists (Hawaiian, Māori, Tahitian, Samoan)
- Multi-language UI translations
- Dynamic word length support (5/6 letters)
- Local storage persistence
- Definition system integration

#### 3. Statistics System
**Location**: `/src/lib/stats.ts` + `/src/lib/localStorage.ts`

**Components**:
- Game statistics tracking
- Multi-language stat separation
- Win distribution histograms
- Streak tracking
- Success rate calculations
- Local storage persistence per language/word length

**Key Features**:
- Language-specific stats (`hawaiian_5`, `hawaiian_6`, etc.)
- Win distribution arrays
- Current/best streak tracking
- Configurable max attempts based on word length

#### 4. Game Configuration
**System**: Centralized config management
- Word length options (5-letter, 6-letter)
- Max attempts calculation based on word length
- Storage key management
- Feature flags (definitions, etc.)

## Migration Implementation Plan

### Step 1: Modal System Implementation
**Target**: Create shared modal infrastructure

**Tasks**:
1. **Install Dependencies**
   ```bash
   npm install @headlessui/react @heroicons/react
   ```

2. **Copy Modal Components**
   - Copy `/src/components/modals/BaseModal.tsx`
   - Copy modal components (InfoModal, LanguageSelectionModal, StatsModal, AboutModal)
   - Ensure proper import paths

3. **Integration Points**
   - Update PangaKupu game to use modal system
   - Replace existing modals/dialogs with KimiKupu modals
   - Connect modal triggers to game UI

### Step 2: Language Infrastructure Implementation
**Target**: Implement KimiKupu's language management system

**Tasks**:
1. **Language Registry System**
   - Copy `/src/languages/registry.ts`
   - Copy `/src/languages/interface/interfaceRegistry.ts`
   - Copy language loader systems
   - Copy interface translation files

2. **Language Hooks**
   - Copy `useLanguage.ts`
   - Copy `useInterfaceLanguage.ts` 
   - Copy `useWordLength.ts`
   - Implement in PangaKupu game components

3. **Language Data Integration**
   - Adapt PangaKupu word lists to KimiKupu format
   - Implement unified word system
   - Add interface translations for crossword-specific terms
   - Configure language-specific features

### Step 3: Statistics System Implementation
**Target**: Implement KimiKupu's stats and storage system

**Tasks**:
1. **Stats Infrastructure**
   - Copy `/src/lib/stats.ts`
   - Copy `/src/lib/localStorage.ts`
   - Copy statistics components (Histogram, Progress, StatBar)

2. **Storage Integration**
   - Implement multi-language stats separation
   - Migrate existing PangaKupu stats to new format
   - Add language/word-length specific persistence

3. **Stats UI Integration**
   - Implement stats modal in PangaKupu
   - Add win distribution displays
   - Add streak tracking UI

### Step 4: Game Configuration System
**Target**: Implement centralized configuration

**Tasks**:
1. **Config System**
   - Create `/src/config/gameConfig.ts`
   - Define word length options
   - Configure max attempts logic
   - Set up storage keys

2. **Feature Integration**
   - Implement variable word lengths in PangaKupu
   - Add definition system support
   - Configure crossword-specific features

### Step 5: UI Component Library
**Target**: Standardize UI components

**Tasks**:
1. **Grid Components**
   - Copy Cell, Grid, Row components
   - Adapt for crossword layout
   - Maintain KimiKupu styling

2. **Keyboard Components**
   - Copy Keyboard and Key components
   - Integrate with PangaKupu's special characters
   - Maintain macron support

3. **Alert System**
   - Copy Alert components
   - Integrate with PangaKupu game feedback

### Step 6: Final Integration & Testing
**Target**: Complete KimiKupu architecture compatibility

**Tasks**:
1. **App Structure Alignment**
   - Update PangaKupu App.tsx to match KimiKupu exactly
   - Implement proper provider hierarchy
   - Configure routing if needed

2. **Game Logic Integration**
   - Connect PangaKupu crossword logic with KimiKupu infrastructure
   - Implement language switching in crossword
   - Add stats tracking to crossword game

3. **Testing & Validation**
   - Test all modal functionality
   - Test language switching
   - Test statistics tracking
   - Test responsive design
   - Test local storage persistence

## File Structure After Migration

```
/src/
├── Header.tsx                    ✅ (Complete)
├── App.tsx                      ✅ (Complete)
├── styles/
│   └── scrollPrevention.css     ✅ (Complete)
├── components/
│   ├── modals/                  🟡 (Pending)
│   │   ├── BaseModal.tsx
│   │   ├── InfoModal.tsx
│   │   ├── LanguageSelectionModal.tsx
│   │   ├── StatsModal.tsx
│   │   └── AboutModal.tsx
│   ├── grid/                    🟡 (Pending)
│   │   ├── Grid.tsx
│   │   ├── Cell.tsx
│   │   └── [other grid components]
│   ├── keyboard/                🟡 (Pending)
│   │   ├── Keyboard.tsx
│   │   └── Key.tsx
│   ├── stats/                   🟡 (Pending)
│   │   ├── Histogram.tsx
│   │   ├── Progress.tsx
│   │   └── StatBar.tsx
│   └── alerts/                  🟡 (Pending)
│       └── Alert.tsx
├── hooks/                       🟡 (Pending)
│   ├── useLanguage.ts
│   ├── useInterfaceLanguage.ts
│   └── useWordLength.ts
├── languages/                   🟡 (Pending)
│   ├── registry.ts
│   ├── loader.ts
│   ├── interface/
│   │   ├── interfaceRegistry.ts
│   │   ├── loader.ts
│   │   └── data/
│   │       ├── en.json
│   │       ├── haw.json
│   │       └── [other language files]
│   └── [word files]
├── lib/                         🟡 (Pending)
│   ├── stats.ts
│   └── localStorage.ts
├── config/                      🟡 (Pending)
│   └── gameConfig.ts
└── [existing PangaKupu components]
```

## Implementation Order

1. **Modal System** (Highest Priority)
   - Provides immediate UI consistency
   - Required for settings/language selection
   - Foundation for other features

2. **Language Infrastructure** (High Priority)
   - Core functionality for multi-language support
   - Enables proper localization
   - Required for language-specific stats

3. **Statistics System** (Medium Priority)
   - Enhances user experience
   - Provides game progression tracking
   - Supports language-specific analytics

4. **Configuration System** (Medium Priority)
   - Enables advanced features
   - Supports variable word lengths
   - Centralizes game settings

5. **UI Component Library** (Lower Priority)
   - Provides styling consistency
   - Can be implemented incrementally
   - Non-critical for core functionality

## Success Criteria

- [ ] PangaKupu uses identical modal system to KimiKupu
- [ ] Full language switching support in PangaKupu
- [ ] Statistics tracking per language/word-length
- [ ] Local storage persistence matches KimiKupu format
- [ ] Responsive design consistent with KimiKupu
- [ ] All KimiKupu infrastructure components reusable
- [ ] PangaKupu codebase can be moved to KimiKupu directory without conflicts

## Risk Mitigation

1. **Incremental Implementation**: Implement one system at a time
2. **Fallback Support**: Maintain existing functionality during migration
3. **Testing at Each Step**: Verify each component before proceeding
4. **Code Backup**: Maintain working state throughout migration
5. **Dependency Management**: Ensure all required packages are installed

This architecture migration will result in a unified codebase where PangaKupu shares the exact same infrastructure as KimiKupu, enabling seamless integration and shared development.