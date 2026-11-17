// Hvad Prompt Master husker i sessionen ($.state).
export type Showing = 'improved' | 'original'

export type Status =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'error'; message: string }

declare module 'claude-code' {
  interface PluginState {
    'prompt-master': {
      /** Din oprindelige tekst, gemt før omskrivningen. null = intet at fortryde. */
      original: string | null
      /** Den forbedrede tekst (inkl. dine egne rettelser i den). */
      improved: string | null
      /** Hvilken af de to der står i tekstfeltet lige nu. */
      showing: Showing
      status: Status
    }
  }
}
