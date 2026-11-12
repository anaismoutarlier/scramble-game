# GitHub Copilot System Instructions

## Global Core Behaviors

- Always adhere strictly to the Next.js App Router conventions and Tailwind CSS design tokens defined in this workspace.
- Prioritize semantic HTML and performance optimization (e.g., using `next/image` and `next/font`).
- **DO NOT** hardcode specific pixel values where Tailwind responsive layout utilities or standard spacing scales (e.g., `space-y-4`, `p-6`) are expected, unless it is a rigid graphic constraint.
- **DO NOT** hardcode specific rem values where Tailwind sizing or text sizing utility classes or standard sizing scales (e.g., `text-xl`, `max-w-5xl`, `leading-tight`) are expected, unless it is a rigid graphic constraint.
- **NEVER** generate monolithic components. Always break down complex features into atomic, modular Next.js components, hooks, and functions.

## Automatic Skill Discovery & Activation

You have access to specialized workspace skills located in the `.copilot/skills/` directory. You must proactively scan and execute these rulesets when their conditions are met:

### 1. Figma MCP Translation Skill

- **Trigger Condition:** Activate this skill automatically whenever the user mentions "Figma", "MCP", provides a Figma node/file URL, or asks to translate UI designs, components, layouts, or wireframes into code.
- **Location:** `.copilot/skills/figma-mcp/SKILL.md`
- **Execution Rule:** Read the `SKILL.md` file at the path above before generating any layout structure, components, or styles. Follow its negative guardrails (e.g., no hardcoded hex values, explicit auto-layout to Tailwind mappings) and output formats without exception.
