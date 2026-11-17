// Firebase's own type declarations don't expose getReactNativePersistence
// through the platform-agnostic "types" condition of its package exports
// (it only exists in the "react-native" condition's own .d.ts, which sits
// as a sibling — not a child — of the generic "types" entry, so TypeScript's
// conditional-exports resolution never reaches it). The function itself
// resolves correctly at runtime via Metro, which does honor the
// "react-native" condition — this file only restores its type signature
// for `tsc`, copied verbatim from @firebase/auth's own source
// (src/platform_react_native/persistence/react_native.d.ts).
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
