import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'prompt-master',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false },
} as const

const RAW = 'lav en mail til kunde om faktura'
const BETTER = 'Skriv en kort mail til [kundens navn] om faktura [fakturanummer].'

// Et falsk tekstfelt og en falsk model står i stedet for Claude under testen.
function fakeEngine(on: any, reply: { isAnswered: boolean; text?: string; reason?: string }) {
  const s = { box: RAW, submitted: 0, modelCalls: 0 }
  on('prompt.read', () => ({ value: { text: s.box, cursor: s.box.length } }))
  on('prompt.fill', (_: unknown, e: { text: string }) => {
    s.box = e.text
    return { isFilled: true }
  })
  on('prompt.submit', () => {
    s.submitted += 1
    return {}
  })
  on('model.complete', () => {
    s.modelCalls += 1
    return { value: { ...reply, usage: { input_tokens: 1, output_tokens: 1 } } } as any
  })
  return s
}

for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
  test(`forbedr, fortryd og vis igen – uden at sende (${surface})`, async ($, on) => {
    const s = fakeEngine(on, { isAnswered: true, text: '```\n' + BETTER + '\n```' })
    const ui = await $.ui.mount({ ...BAND, surface } as any)

    // Før: kun Prompt Master-knappen, ingen Fortryd.
    expect(await ui.find({ type: 'Button', key: 'improve' } as any)).toBeTruthy()
    expect(await ui.find({ type: 'Button', key: 'swap' } as any)).toBeFalsy()

    await ui.press({ key: 'improve' } as any)
    expect(s.box).toBe(BETTER) // kodeblokken er fjernet
    expect(s.submitted).toBe(0) // intet sendt

    // Brugeren retter selv i den forbedrede tekst, og trykker så Fortryd.
    s.box = BETTER + ' Tak.'
    await ui.press({ key: 'swap' } as any)
    expect(s.box).toBe(RAW)

    // "Vis forbedret" giver den forbedrede tekst MED brugerens rettelse tilbage.
    await ui.press({ key: 'swap' } as any)
    expect(s.box).toBe(BETTER + ' Tak.')
    expect(s.submitted).toBe(0)
    await ui.unmount()
  })
}

test('tomt tekstfelt: ingen modelkald, besked i stedet', async ($, on) => {
  const s = fakeEngine(on, { isAnswered: true, text: BETTER })
  s.box = '   '
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as any)
  await ui.press({ key: 'improve' } as any)
  expect(s.modelCalls).toBe(0)
  expect(s.box).toBe('   ')
  expect((await ui.find({ type: 'Text', text: /Skriv først/ } as any))?.text).toBeTruthy()
  await ui.unmount()
})

test('modellen fejler: din tekst er urørt', async ($, on) => {
  const s = fakeEngine(on, { isAnswered: false, reason: 'api-error' })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as any)
  await ui.press({ key: 'improve' } as any)
  expect(s.box).toBe(RAW)
  expect((await ui.find({ type: 'Text', text: /urørt/ } as any))?.text).toBeTruthy()
  await ui.unmount()
})

test('Claudes spørgeskema har forrang: ingen knapper', async ($, on) => {
  fakeEngine(on, { isAnswered: true, text: BETTER })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop', props: { hasSurvey: true, isCollapsed: false } } as any)
  expect(await ui.find({ type: 'Button', key: 'improve' } as any)).toBeFalsy()
  await ui.unmount()
})

test('du skriver videre, mens modellen arbejder: din nye tekst overskrives ikke', async ($, on) => {
  const s = { box: RAW }
  on('prompt.read', () => ({ value: { text: s.box, cursor: s.box.length } }))
  on('prompt.fill', (_: unknown, e: { text: string }) => {
    s.box = e.text
    return { isFilled: true }
  })
  on('model.complete', () => {
    s.box = RAW + ' og husk rykker' // brugeren tastede videre undervejs
    return { value: { isAnswered: true, text: BETTER, usage: { input_tokens: 1, output_tokens: 1 } } } as any
  })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as any)
  await ui.press({ key: 'improve' } as any)
  expect(s.box).toBe(RAW + ' og husk rykker')
  expect((await ui.find({ type: 'Text', text: /ændrede teksten undervejs/ } as any))?.text).toBeTruthy()
  await ui.unmount()
})
