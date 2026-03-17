# UI Coding Standards

## Component Library

**All UI components must use shadcn/ui exclusively.**

- Do NOT create custom UI components (buttons, inputs, dialogs, cards, etc.)
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.)
- Every UI element must come from the shadcn/ui component registry
- Install new components via: `npx shadcn@latest add <component-name>`
- Installed components live in `components/ui/` — do not modify them

## Date Formatting

Date formatting must use **date-fns**. All dates displayed to users must follow this format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the format string `do MMM yyyy` with date-fns:

```ts
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
format(new Date("2025-08-02"), "do MMM yyyy"); // "2nd Aug 2025"
format(new Date("2026-01-03"), "do MMM yyyy"); // "3rd Jan 2026"
format(new Date("2024-06-04"), "do MMM yyyy"); // "4th Jun 2024"
```

Do NOT use `toLocaleDateString`, `Intl.DateTimeFormat`, `dayjs`, `moment`, or any other date library.
