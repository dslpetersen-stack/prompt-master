# Prompt Master

En mod til Claude Code. Den sætter knappen **Prompt Master** i båndet lige over tekstfeltet.

1. Skriv en hurtig prompt i tekstfeltet.
2. Tryk **Prompt Master**. Din tekst bliver omskrevet til en klarere prompt og lagt i tekstfeltet.
   Intet bliver sendt. Du læser, retter og trykker selv send.
3. **Fortryd** lægger din oprindelige tekst tilbage. **Vis forbedret** henter forbedringen igen.
   Det, der står i feltet, når du skifter, gemmes først, så dine egne rettelser ikke går tabt.

Reglerne for omskrivningen: din hensigt og dit sprog bevares, der bliver ikke fundet på fakta,
og der indsættes [pladsholdere], hvor vigtige oplysninger mangler.

Omskrivningen bruger Sonnet-modellen via sessionens egen adgang og tæller med i sessionens forbrug.

## Installation

Prompt Master virker i Claude Code i terminalen, hvor tekstfeltet er Claude Codes eget.
(I desktop-appens sky-sessioner kan en mod ikke vise knapper eller udfylde tekstfeltet.)

Skriv dette i tekstfeltet i en Claude Code-session i terminalen:

```
/plugin install prompt-master --marketplace dslpetersen-stack/prompt-master
```

Svar `y` til at tilføje marketplace, og vælg derefter "user" (gælder i alle dine sessioner) med Enter.

Eller direkte fra terminalen (uden at starte Claude først):

```bash
claude plugin install prompt-master --marketplace dslpetersen-stack/prompt-master
```
