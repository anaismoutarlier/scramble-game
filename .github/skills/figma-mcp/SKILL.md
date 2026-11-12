---
name: figma-mcp
description: Defines operational rules and strict step-by-step instructions for utilizing the Figma Model Context Protocol (MCP) server within a Next.js environment to translate UI designs into Tailwind CSS components. Trigger this skill whenever the user asks to inspect, fetch, or implement Figma designs.
license: MIT
metadata:
    author: frontend-architect
    version: "1.0.0"
---

# Task

Analyze Figma designs via the Figma MCP server to accurately inspect layers, typography, layout structures, and spacing, then translate them into production-ready Next.js components utilizing TypeScript and Tailwind CSS.

# Boundaries & Negative Guardrails

- **NEVER** guess or hallucinate dimensions, hex codes, or spacing values. If a value cannot be retrieved via the MCP tool, explicitly ask the user for clarification.
- **DO NOT** hardcode specific pixel values where Tailwind responsive layout utilities or standard spacing scales (e.g., `space-y-4`, `p-6`) are expected, unless it is a rigid graphic constraint.
- **DO NOT** hardcode specific rem values where Tailwind sizing or text sizing utility classes or standard sizing scales (e.g., `text-xl`, `max-w-5xl`, `leading-tight`) are expected, unless it is a rigid graphic constraint.
- **NEVER** generate a monolithic component. Always break down complex Figma frames into atomic, modular Next.js components.
- **DO NOT** make unnecessary API calls. Read and store file nodes systematically rather than refetching the entire file tree repeatedly.
- **DO NOT** create custom join functions for Tailwind classnames. Use the `cn` function in `src/helpers`.

# Step-by-Step Workflow

1. **Initialization & Discovery**
    - Call the Figma MCP server to retrieve or inspect the target file metadata.
    - Map out the exact `Node ID` or component frame requested by the user.

2. **Design Token Analysis**
    - Inspect the selected node's visual properties: fill colors, typography styles, border radii, shadows, and layout constraints.
    - Map Figma color tokens to the project's existing themes (e.g., matching a brand hex code to `bg-brand-500`).

3. **Layout & Flow Evaluation**
    - Identify Auto Layout settings in Figma (e.g., horizontal/vertical layouts, gap spacing, alignment).
    - Direct-map Auto Layout properties to Tailwind Flexbox (`flex flex-row`, `flex-col`, `gap-X`, `items-center`) or CSS Grid utilities.

4. **Component Code Generation**
    - Generate a strictly typed Next.js component (`.tsx`) using React functional component syntax (`export function...`).
    - Implement clean semantic HTML tags (`<header>`, `<main>`, `<section>`, `<article>`, `<button>`) instead of generic nested `<div>` wrappers.
    - Embed standard accessible attributes (`aria-*`, correct image `alt` attributes, semantic header levels) observed or inferred from the design hierarchy.

5. **Resource Handling**
    - For all image layers, generate a Next.js `<Image />` component from `next/image`.
    - Specify necessary `src`, `alt`, `width`, and `height` dimensions fetched from the design layout attributes. Use responsive image dimensions whenever possible and appropriate.

6. **Responsive Design**
    - Prioritize responsive design. If different designs are given for different screen sizes, integrate them seamlessly. Otherwise, make common-sense adjustments to make sure the design is responsive and adaptable to different screen sizes. Enumerate any changes explicitly in the final report.

7. **Data Sources**
    - This project utilizes data from a Sanity.io CMS project. Whenever possible, map static values from the design onto the data shape from the Sanity type or query. If the mapping cannot be inferred, explicitly ask the user for clarification.

8. **Using Project Component Resources**
    - Whenever possible, utilize pre-existing project UI components (buttons, cards, etc). If an API change is reasonable and necessary to reuse a component, explicitly ask the user for clarification before proceeding.

9. **Using External UI resources**
    - For icons, use Lucide React icons. If other UI components are necessary and are not completely custom components, use shadcn/ui components and add styles and colors to match the project theme. They may be added to the project.

# Expected Output Format

When executing this skill, output your response in the following sequence:

1. **Design Summary Table**: A brief structural Markdown table listing the interpreted nodes, layout flows, and mapped design tokens.
2. **Next.js Implementation**: The fully written TypeScript React component file with optimized inline Tailwind CSS utility classes.
3. **Assumptions & Deviations**: A bulleted list highlighting any layout shifts made for production responsiveness or fallback values used.
