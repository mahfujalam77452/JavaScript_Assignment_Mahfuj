# Assignment README

## Overview

This webpage was built from the provided design requirements with a focus on clean structure, responsiveness, and maintainable HTML/CSS.

Before starting the implementation, I reviewed and practiced the core HTML and CSS concepts that are commonly used in most frontend tasks. I then planned the page structure and translated the design into reusable HTML elements and CSS styles.

The implementation approach was:

- First, identify the major sections and layout of the design.
- Build the page structure using semantic HTML where appropriate.
- Use CSS Flexbox and Grid where they fit the layout requirements.
- Start with a clear desktop layout and adjust the design for smaller screens using responsive media queries.
- Reuse CSS patterns and classes where possible instead of creating unnecessary duplicate styles.
- Pay attention to spacing, typography, sizing, alignment, colors, and responsive behavior to make the implementation visually close to the reference design.
- Test the page at different viewport sizes and make adjustments where necessary.

During development, I used AI assistance, browser documentation, and other documentation/resources when I was stuck or needed clarification. I also used AI-generated code selectively for repetitive parts of the implementation, but reviewed, modified, and integrated the code myself according to the requirements of the assignment.

The goal was not simply to copy a complete solution, but to use these resources as development assistance while understanding and adapting the implementation.

## Breakpoints

The page uses responsive CSS media queries to adapt the layout to different screen sizes.

The main breakpoints used are:

- **Desktop:** `>= 1024px`
- **Tablet:** `768px – 1024px`
- **Mobile:** `< 768px`

The stylesheet uses `@media (min-width: 768px)` for tablet and
`@media (min-width: 1024px)` for desktop, so a viewport exactly 1024px wide
uses the desktop layout.

## Run Locally

Open `website.html` directly in a browser, or serve this folder with any
static HTTP server. No build step or dependency installation is required.

These breakpoints are not intended to represent every possible device width. They are used to make the main layout transitions predictable and keep the content usable across common desktop, tablet, and mobile screen sizes.

## Assumptions

- The provided design/reference was treated as the primary visual target.
- Where exact specifications were not provided, reasonable values for spacing, font sizes, dimensions, and responsive behavior were chosen based on the visual design.
- Standard web technologies (HTML and CSS) were used without introducing unnecessary frameworks or libraries.
- Images/assets were assumed to be available in the provided project structure or were handled according to the assignment requirements.
- Minor differences may exist between the implementation and the reference because exact design specifications such as original font files, measurements, or source assets were not always available.

## Limitations

- The implementation is primarily focused on matching the provided design and responsive behavior rather than implementing a complete production application.
- Some values were estimated when exact design specifications were unavailable.
- AI and documentation were used as supporting resources during development, particularly for troubleshooting, clarification, and repetitive implementation tasks. The resulting code was reviewed and adapted to fit the project.
- Browser rendering can cause small differences in typography, spacing, and element dimensions across different browsers and operating systems.

## Development Approach

I followed a learn-and-implement approach for this assignment. I first focused on understanding the HTML and CSS concepts that are most frequently used in real-world frontend development. After that, I analyzed the design, broke it into smaller sections, implemented each section, and refined the layout through testing.

When I encountered unfamiliar problems, I consulted documentation and AI tools to understand possible solutions. For repetitive tasks, I sometimes used AI-generated code as a starting point and then edited and integrated it myself.

This approach helped me complete the assignment while also reinforcing the underlying HTML/CSS concepts rather than relying entirely on generated code.
