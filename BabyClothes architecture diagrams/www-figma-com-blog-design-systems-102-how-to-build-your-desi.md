[Skip to main content](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#main)

April 8, 2024

# Design system 102: How to build a design system

![](https://cdn.sanity.io/images/599r6htc/regionalized/2eb34f5b7e52a346c312911336726e861203bd65-600x600.jpg?w=600&h=600&q=75&fit=max&auto=format)

Chad BergmanDesigner Advocate, Figma

- [Insights](https://www.figma.com/blog/insights/)
- [Design systems](https://www.figma.com/blog/design-systems/)
- [Career & education](https://www.figma.com/blog/career-and-education/)
- [Design](https://www.figma.com/blog/design/)
- [UI/UX](https://www.figma.com/blog/ui-ux/)
- [Productivity](https://www.figma.com/blog/productivity/)

![Geometric art with parallel lines, circles, and waves in yellow, green, orange, and blue.](https://cdn.sanity.io/images/599r6htc/regionalized/8d2066390bdf4d6cfdef7783d6c86874253e5458-3264x1836.png?w=1632&h=918&q=75&fit=max&auto=format)

It’s time to build your design system! We’ll walk you through the basics of creating a system tailored to your unique goals and challenges, whether building from scratch or starting with existing pieces.

## Share Design system 102: How to build a design system

Artwork by [Cynthia Alfonso](https://www.instagram.com/zyn_vaites/)

Table of contents

1. [Lay the groundwork](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-1-lay-the-groundwork)
2. [Define your foundations](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-2-define-your-foundations)
3. [Build your design system in Figma](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-3-build-your-design-system-in-figma)

Table of contents

1. [Lay the groundwork](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-1-lay-the-groundwork)
2. [Define your foundations](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-2-define-your-foundations)
3. [Build your design system in Figma](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#step-3-build-your-design-system-in-figma)

A well-crafted design system is a powerful tool for teams looking to create cohesive, scalable, and efficient processes. By establishing a shared language and a library of reusable components, a design system ensures consistency across your products, speeds up your workflow, and frees up your team to focus on solving user problems.

In this guide, we’ll break down the process of building a design system into clear, actionable steps. From defining your principles and laying the groundwork to creating and organizing your design assets, we’ll cover best practices and real-world examples to help you create a system that empowers your team and elevates your product.

[![Abstract artwork featuring orange organic shapes and green zigzag patterns on a blue background.](https://cdn.sanity.io/images/599r6htc/regionalized/27db1d8f2eb3257c620306f5d87fd62db037c6eb-3264x1836.png?w=3264&h=1836&q=75&fit=max&auto=format)](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/)

This is the second part of our series on getting started with design systems. Check out our first part: [Design systems 101: What is a design system?](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/)

## [Step 1: Lay the groundwork](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#step-1-lay-the-groundwork)

Before diving into creating components and patterns, it’s important to understand why you’re building a design system and what problems you hope to solve. Maybe you’ve noticed inconsistency across platforms, time-consuming manual updates, or collaboration challenges between design and development teams.

Take a moment to clearly define your goals by answering these key questions:

- Why do you want a design system?
- What specific problems will it solve?
- How will you know if it’s successfully solving those problems?

Config 2024: Design systems best practices \| Figma - YouTube

Tap to unmute

[Config 2024: Design systems best practices \| Figma](https://www.youtube.com/watch?v=MJTCfSFLUGE) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=MJTCfSFLUGE)

![](https://cdn.sanity.io/images/599r6htc/regionalized/5b6d531eaf0852b4f4c48316c84b449777dd822c-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

Our [design systems talk from Config 2024](https://youtu.be/MJTCfSFLUGE?si=EUZ3bTfEr4STeT3z) highlights many points in this article, from defining standards, finding champions, working with developers early and often, and more.

Remember, design systems aren’t one-size-fits-all. They exist on a spectrum, from simple component collections for small teams to comprehensive systems for enterprise organizations. The key is to create a system that makes sense for your specific situation and can evolve as your needs change.

### [Take stock of what you have](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#take-stock-of-what-you-have)

Once you’ve aligned on your goals, take a closer look at your existing product landscape. Gather examples of your UI across different platforms and devices, including interactive states and alternate versions. Screenshots are your best friend here! Capture examples of your product across different platforms and devices, and don’t forget to include any interactive states or alternate versions. Chances are, you’ll start to notice patterns and consistencies that can serve as the starting point for your design system.

Don’t forget to inventory your codebase as well. Engineers may have already created reusable components that aren't documented in your design files. Look for patterns in your production code—repeated UI elements, standardized CSS variables, or shared components that developers have built. This technical audit helps bridge the gap between design and development by ensuring your design system builds upon existing engineering work rather than creating parallel systems.

### [Organize and evaluate](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#organize-and-evaluate)

With your inventory in hand, organize your examples into categories and evaluate the big picture. What does your current design language look like? Are there inconsistencies or redundancies that could be streamlined?

Keep an eye out for areas where your product feels disjointed or where designers and developers are solving the same problems in different ways. These are often signals that your user experience could be improved through a more cohesive design system.

### [Find your champions](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#find-your-champions)

Building a design system is a team effort. Seek out people who are passionate about design consistency across your organization—not just from the design team, but also developers, product managers, and other stakeholders. Getting diverse perspectives will help ensure your design system meets the needs of your entire product team, not just one discipline.

Developers are particularly valuable allies, as they’ll be implementing the components in code and can provide insights on technical feasibility and maintenance considerations from the start. And remember, many successful design systems start with a team of one!

### [Choose your approach](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#choose-your-approach)

There are two main ways to approach building your design system: starting from scratch with a custom solution, or adopting an existing framework and adapting it to your needs.

Building from scratch allows you to tailor the system to your unique requirements, but requires more time and resources upfront. Using an [existing framework](https://www.designsystems.com/open-design-systems/) can help you get up and running faster, but may require more customization to fit your specific use case.

There’s no right or wrong answer—it depends on your team’s capabilities, bandwidth, and long-term goals. Don’t be afraid to start small and evolve over time.

### [Align with company goals](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#align-with-company-goals)

Make sure your design system initiative aligns with your overall company objectives. Consider factors like timing, resources, and leadership buy-in. Your earlier audit will come in handy here; use your findings to help build the case for how a design system will support key business goals.

Design systems require ongoing investment, so it’s important to secure stakeholder support early on. Tying your system to tangible business benefits, like faster time-to-market or improved developer productivity, can go a long way in getting the resources and buy-in you need.

[![Stylized illustration of a workflow with abstract shapes, checkmarks, and arrows depicting a dynamic design process.](https://cdn.sanity.io/images/599r6htc/regionalized/3f62721e30969913c9814279da6b1e05b6cc3ff4-3264x1836.jpg?w=3264&h=1836&q=75&fit=max&auto=format)](https://www.figma.com/blog/an-insiders-guide-to-a-seamless-figma-migration/)

Thinking about making the switch? Designer Advocate Clara Ujiie’s “ [An insider’s guide to a seamless Figma migration](https://www.figma.com/blog/an-insiders-guide-to-a-seamless-figma-migration/)” has resources, tips, and tools for transitioning to Figma.

### [Define your guiding principles](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#define-your-guiding-principles)

With the groundwork in place, define a set of guiding principles that will serve as a north star for your system. Your principles should establish the purpose and values driving your system, and ensure that every decision ladders up to your organization’s broader goals. Aim for a small set of memorable, actionable statements that can be easily referenced and applied.

In an ideal world, you’d define your principles right at the start. But in practice, they often emerge later in the process, or evolve as your system matures. That’s okay! The important thing is that once you have them, you make sure everyone is aware of and aligned with them. They’ll make future decisions much clearer.

This series builds on our [Introduction to design systems course](https://help.figma.com/hc/en-us/articles/14552802134807), which follows the Habitz team as they [establish their core principles](https://www.youtube.com/watch?v=pwzYVIgga2c) and translate them into concrete design guidelines.

Here are a few tips for crafting effective design principles:

1. **Start with the “why.”** What core belief or value is driving this principle?
2. **Be specific.** Provide concrete examples and guidelines for how to apply the principle in practice.
3. **Keep it actionable.** Principles should translate into tangible practices for both designers and developers.

Let’s say accessibility is a core priority for your team. A principle around designing for inclusivity might include guidelines like accounting for different vision and hearing abilities, testing contrast and legibility, or following the [latest accessibility standards](https://www.w3.org/). The more specific and actionable, the better.

[![Three cards read Professional, Approachable, Thoughtful with icons and smaller text.](https://cdn.sanity.io/images/599r6htc/regionalized/cefa0d4e9196cc2b3e6a71434e724222021aeb72-800x298.png?w=800&h=298&q=75&fit=max&auto=format)](https://www.figma.com/community/file/817913152610525667)

Discover your principles with your team [using this FigJam template](https://www.figma.com/community/file/817913152610525667).

Leverage the wealth of knowledge within your organization as the foundation for your design principles. Take a look at existing resources like brand standards, voice and tone guides, or engineering best practices. Work with cross-functional partners to ensure your principles reflect both design and development values, creating a shared foundation that everyone can rally behind.

Define your design system's principles - Lesson 2 part 1 : Introduction to design systems - YouTube

Tap to unmute

[Define your design system's principles - Lesson 2 part 1 : Introduction to design systems](https://www.youtube.com/watch?v=pwzYVIgga2c) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=pwzYVIgga2c)

![](https://cdn.sanity.io/images/599r6htc/regionalized/135c5787cd0707a690cc57a5b1fca3907427090d-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

## [Step 2: Define your foundations](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#step-2-define-your-foundations)

The foundations of your design system are the essential visual and functional elements that form its base. They include elements like accessibility, color, typography, iconography, illustration, and dimensions. These elements work together to create a strong, consistent design language that’s easy for people to use and understand.

[![Screenshot of Figma, showing a layout for a financial application. The design includes buttons with labels such as 'Done', 'OK', 'Continue', and 'Retry' under a section titled 'progress', and 'Create account', 'New goal', 'Link my bank' under 'startTask', as well as 'Add cash', 'Invest in AMZN', 'Cash out' under 'startTransaction'. On the left side, a sidebar lists design elements like 'Shadow', 'Elevation', 'Color', and 'Typography' with a nested 'actionLibrary' containing UI components.](https://cdn.sanity.io/images/599r6htc/regionalized/2651199d44b563858d3e0626aaf79dd6146dd2c6-2725x1508.jpg?w=2725&h=1508&q=75&fit=max&auto=format)](https://www.figma.com/customers/how-stash-builds-financial-products-customers-trust/)

Learn [how Stash builds financial products that customers can trust](https://www.figma.com/customers/how-stash-builds-financial-products-customers-trust/) by using Figma components and Ditto to ship out copy updates—speeding up their work by 20% and saving over 12,000 hours.

### [Make your design accessible to everyone](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#make-your-design-accessible-to-everyone)

Accessibility means making sure everyone can use and understand your product, regardless of their abilities. This is everyone’s responsibility, and it should be a core part of your design system principles.

When creating your design system, consider elements like font sizes, color contrast, and how components are labeled and organized. It’s important to communicate both how and why your design system assets are intended to be used when creating accessible experiences. By prioritizing accessibility from the beginning and providing clear guidelines for both designers and developers, you lay the foundation for a more inclusive product.

[![Promotional graphic for the all-new Stark plugin for Figma titled 'Supercharge Accessibility.' It showcases interface snapshots with accessibility tools for contrast checking, typography, and alt-text suggestions. The tagline states, 'All the tools designers, developers, PMs, and accessibility experts need to design accessible software products from the start.' The background is a gradient of purple with decorative yellow squiggles and a red heart doodle.](https://cdn.sanity.io/images/599r6htc/regionalized/ab5a29d9bf94abcff4c3f5736cb1c87f60f3ba9c-1920x960.png?w=1920&h=960&q=75&fit=max&auto=format)](https://www.figma.com/community/plugin/732603254453395948)

Try [Stark’s Contrast & Accessibility plugin](https://www.figma.com/community/plugin/732603254453395948) to help you streamline your accessibility workflow. To ensure your colors are accessible, explore [plugins in the Figma Community](https://www.figma.com/community/search?resource_type=plugins&sort_by=relevancy&query=color+contrast&editor_type=all&price=all&creators=all) and follow [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/).

### [Choose colors that work well together](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#choose-colors-that-work-well-together)

Color is a powerful tool in design. When selecting colors for your design system, aim for a balanced palette that works across different modes (like dark mode) and platforms.

[![Screenshot showcasing the 'Ultimate color palette system' by Untitled UI, featuring an extensive array of organized color swatches and names on a user interface design template.](https://cdn.sanity.io/images/599r6htc/regionalized/adc78700ef28c0defcf97bc5f4740b57f516dad0-1920x960.png?w=1920&h=960&q=75&fit=max&auto=format)](https://www.figma.com/community/file/1029506782158027808/ultimate-color-palette-system-untitled-ui)

Check out this [Ultimate color palette system](https://www.figma.com/community/file/1029506782158027808/ultimate-color-palette-system-untitled-ui) from Untitled UI, a purposeful set of neatly-organized color styles—the perfect starting point for any brand or project.

To simplify your color palette, look at your team’s existing designs and consolidate similar shades. A good rule of thumb is to start with 60% neutral colors, 30% primary colors, and 10% secondary or accent colors. This balance provides enough flexibility while maintaining visual coherence.

### [Pick typography that’s easy to read and fits your brand](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#pick-typography-that-s-easy-to-read-and-fits-your)

Typography is another key element of your design foundation. Choose fonts that are easy to read, match your brand personality, and work well together. Pay attention to details like [letter spacing, weight, and line height](https://www.designsystems.com/typography-guides/) to create a pleasant reading experience.

Establish a consistent set of font sizes and line heights when defining your **type scale**, commonly set around a base size of 16 pixels. You may also want to organize your type scale by its intended application in mind, such as ‘display’ or ‘title,’ or opt for a more primitive naming such as ‘heading-100.’

[![Graphic showing the 'Typescale' tool with an example of a typographic scale from large to small text, using the phrase 'The quick brown fox jumps over the lazy dog,' against a vibrant yellow background.](https://cdn.sanity.io/images/599r6htc/regionalized/7442a27c20f463eeaf75ac81927a15d3be5fe6c0-1920x960.png?w=1920&h=960&q=75&fit=max&auto=format)](https://www.figma.com/community/plugin/967802396210455992)

For **type scale**, use plugins like [Typescale](https://www.figma.com/community/plugin/967802396210455992) by Sam Smith, or [Scaaale](https://www.figma.com/community/plugin/892543384437155629) (with three A’s) by Nicolas Massi.

### [Use elevation to create visual hierarchy](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#use-elevation-to-create-visual-hierarchy)

Elevation refers to the use of shadows, layers, and transparency to create depth and order in your design. For example, cards can appear slightly raised off the page, or a dialog box might become a focal point by seeming to float above everything else through the use of shadows.

Elevation can help you structure your design, guiding users to understand which elements are primary and which are secondary, in an intuitive way.

### [Create consistent and meaningful icons](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#create-consistent-and-meaningful-icons)

Explore [this complete guide to iconography](https://www.designsystems.com/iconography-guide/) by illustrator and icon designer Bonnie Kate Wolf on DesignSystems.com.

Icons are small visual symbols that communicate ideas and actions quickly. A well-designed **icon system** strengthens your brand identity and improves usability. Make sure your icons are clear, consistent, and maintain their meaning even when styled differently.

Use an icon grid to ensure consistent sizing and alignment, and provide descriptive names and search terms to make them easy to find and use for both designers and developers.

[![An image displaying a collection of colorful, stylized icons laid out on physical tiles, with a soft, pastel gradient overlay. The word 'Iconography' is prominently displayed in large black text, with 'FOUNDATIONS' in smaller text to the left side, indicating a focus on the fundamental aspects of icon design.](https://cdn.sanity.io/images/599r6htc/regionalized/4a2917fb40c037b561f182a1f586bfed1db0495f-1600x960.png?w=1600&h=960&q=75&fit=max&auto=format)](https://www.figma.com/community/file/836835755999342788/microsoft-fluent-system-iconography)

See how the Microsoft team uses [their Fluent icon system](https://www.figma.com/community/file/836835755999342788/microsoft-fluent-system-iconography) across their products. The Fluent icons include rounded corners, simplified shapes, and come in regular and filled.

### [Apply tokens using variables and styles](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#apply-tokens-using-variables-and-styles)

Tokens, variables, and styles - Update: Introduction to design systems - YouTube

Tap to unmute

[Tokens, variables, and styles - Update: Introduction to design systems](https://www.youtube.com/watch?v=JyCmacSyDY4) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=JyCmacSyDY4)

![Image of a cylindrical stack of green, yellow, and red striped disks, creating a layered effect, against an orange background.](https://cdn.sanity.io/images/599r6htc/regionalized/c2ec7935a7200553532c040462f10487fe4ab1cf-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

Watch our lesson on applying [tokens, variables, and styles](https://www.youtube.com/watch?v=JyCmacSyDY4), part of our introduction to design systems course.

**Variables vs. styles**

Variables in Figma store single values such as colors, whereas styles hold more complex information, such as gradients, and are better for detailed, multi-layered designs. [Learn more](https://help.figma.com/hc/en-us/articles/15871097384471-The-difference-between-variables-and-styles).

In Figma, you can use [variables](https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables) and styles to create a consistent and scalable design system. They are most commonly categorized into two primary types:

- **Primitives:** These are your design system’s basic building blocks, like colors, spacing, and sizing. They form the foundations of your design but aren’t used directly in components or layouts.
- **Semantic:** These provide a meaningful context for how a variable or style should be used. For example, you may have a color variable called“color-background-warning” to convey a sense of urgency or potential danger.

Figma tutorial: Intro to variables - YouTube

Tap to unmute

[Figma tutorial: Intro to variables](https://www.youtube.com/watch?v=1ONxxlJnvdM) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=1ONxxlJnvdM)

![](https://cdn.sanity.io/images/599r6htc/regionalized/d963492804d6cd64e730c464bdb4e44f3f41e096-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

Watch [Figma tutorial: Intro to variables](https://www.youtube.com/watch?v=1ONxxlJnvdM) to better understand how variables work, and how to use them to represent design tokens and account for different modes and themes.

Creating a shared language between design and code is essential for tokens to be effective. When designers and developers use the same naming conventions and token structure, it becomes much easier to maintain consistency across both design files and code implementation. This alignment ensures that design decisions flow seamlessly into development.

When naming your variables and styles, use clear and consistent conventions. Design system contributor Nathan Curtis [suggests](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676) combining a base (like color or size) with modifiers (like variant or state) to create names that are easy to understand and use.

This naming consistency extends to code as well. [Understanding basic syntax patterns used by developers](https://www.youtube.com/watch?v=t2bMxHk7D5k) can help designers create more implementation-friendly variable names. For example, using kebab-case (with hyphens) for CSS variables or camelCase for JavaScript variables can make the translation from design to code much smoother.

Solving Problems with JavaScript: Variable Code Syntax \| Figma - YouTube

Tap to unmute

[Solving Problems with JavaScript: Variable Code Syntax \| Figma](https://www.youtube.com/watch?v=t2bMxHk7D5k) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

0:00Time elapsed 0 seconds/4:20Time duration 4 minutes, 20 seconds

[Watch on YouTube](https://www.youtube.com/watch?v=t2bMxHk7D5k)

### [Use layout grids and spacing to create visual harmony](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#use-layout-grids-and-spacing-to-create-visual)

Layout grids, spacing, and sizing (referred to collectively as “spatial systems”) are like the invisible glue that holds your design together. They create a sense of structure, consistency, and visual harmony that makes your product feel polished and professional.

- **Layouts:** Define how your design adapts to different screen sizes and devices, ensuring a consistent experience across all platforms.
- **Grids:** Use column grids, baseline grids, and modular grids to align elements consistently and create a clear visual hierarchy.
- **Spacing:** Define consistent spacing units to control the distances between elements and create a balanced, readable layout.

When thinking about spatial systems, consider how your layout decisions will translate to code implementation. Discussing with developers how grid systems are implemented in your frontend framework—whether it’s CSS Grid, Flexbox, or a UI framework—can help ensure your design decisions are technically feasible and efficiently implemented.

**Why is eight a recurring number in design systems?** It’s simple—the majority of device breakpoints are divisible by eight, making it an ideal base unit for grids, spacing, and typography.

Learn more about [spacing, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/) from Elliot Dahl, Head of Product Design at Hightouch, on DesignSystems.com.

Many types of grids can be used to create the backbone of your layout:

- **Column grids** divide the screen into vertical sections, making it easy to align elements and maintain a consistent look across different devices.
- [**Baseline grids**](https://www.figma.com/best-practices/everything-you-need-to-know-about-layout-grids/) control the vertical spacing between elements, typically aligning with the baseline of your text.
- **Modular grids** combine both column and row divisions to create a flexible structure for more complex layouts.

[![This image shows a comparison between two types of baseline grids used in graphic design. On the top, there is a setting panel labeled "Rows" with options for Count (100), Color (red with hex code #FF0000 at 10% opacity), Type (Top), Height (16), Offset (0), and Gutter (16). To the right, a graphic demonstrates a baseline grid that highlights line heights with red horizontal stripes spaced evenly apart against a white background, corresponding to the settings.  Below, there is a similar setting panel with the same options but the color opacity is set to 30%. To the right of this panel, there is another grid graphic, this time showing a baseline grid that highlights baselines with solid red lines on a white background, indicating where the baseline of text would align, also corresponding to the settings in the panel.  Both grids illustrate tools that designers use to ensure consistent vertical rhythm and spacing in their layouts.](https://cdn.sanity.io/images/599r6htc/regionalized/63e1e589154290bde7d0d35d96bde2673924470c-2156x1532.webp?rect=0,1,2156,1531&w=804&h=571&q=75&fit=max&auto=format)](https://www.figma.com/best-practices/everything-you-need-to-know-about-layout-grids/#types-of-grids)

The grid settings above illustrate how you can take different approaches to styling a baseline grid.

**Responsive design** is an approach to building for screens that takes into consideration a diversity of devices, optimizing for an optimal viewing experience across each.

By providing pre-built layout components and templates, your design system can help teams create **responsive and adaptive designs** more efficiently. These components can be built with a set of predefined breakpoints that determine how the layout changes at different screen sizes, ensuring visual consistency while making implementation straightforward for developers.

Counterpoint: Do you even need a grid? Design Systems Architect Donnie D’Amato [makes the case for thinking outside the grid](https://gridless.design/).

However, just having a system in place doesn’t guarantee that everyone will use it perfectly. It’s like having a recipe book—it’s super helpful, but it’s up to the chef to follow the instructions and create a delicious meal. That’s why it’s so important for designers to understand and embrace the spatial system. When designers understand why consistent spacing and layout matter, they’re more likely to create designs that look and feel great for users.

Define your design system's foundations - Lesson 2 part 2 : Introduction to design systems - YouTube

Tap to unmute

[Define your design system's foundations - Lesson 2 part 2 : Introduction to design systems](https://www.youtube.com/watch?v=o9CloFonY0E) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=o9CloFonY0E)

![](https://cdn.sanity.io/images/599r6htc/regionalized/ec5d64028b37122d7bbb948e2efdb44ba4de9196-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

## [Step 3: Build your design system in Figma](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#step-3-build-your-design-system-in-figma)

Building a design system in Figma is all about creating a consistent, efficient, and scalable way of working across your entire project. Here's a step-by-step guide to help you get started:

### [Take a closer look at your existing designs](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#take-a-closer-look-at-your-existing-designs)

Remember that [initial audit you did](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/#take-stock-of-what-you-have)? It’s time to revisit that alongside your code audit. Start by mapping your design elements to existing code components wherever possible. This alignment ensures you’re building on the foundation your developers have already established rather than creating parallel systems.

Component properties - YouTube

Tap to unmute

[Component properties](https://www.youtube.com/watch?v=EA0NbEOrpuo) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=EA0NbEOrpuo)

![](https://cdn.sanity.io/images/599r6htc/regionalized/94a257614468eb378d2a2dacc4e0c12da8bf4b0b-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

[In this Figma tip](https://www.youtube.com/watch?v=EA0NbEOrpuo), Designer Advocate Lauren Andres goes over what component properties are and how to create them.

[**Component properties**](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties) are the changeable aspects of a component. You can define which parts of a component others can change by tying them to specific design properties.

Define your variables and styles based on what’s already implemented in production to minimize inconsistencies between design intent and technical reality. Then, define your **components**—the pre-made building blocks that you can reuse throughout your designs, from simple buttons to complex modals.

### [Choose clear and consistent names](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#choose-clear-and-consistent-names)

When naming your components and variables, choose names that reflect their function, rather than how they look or how they’re coded. Use **semantic naming** that reflects the meaning and purpose of the element. For example, “color-warning” for an alert message or “surface-primary” for the main background color.

This approach to naming creates a [shared language that bridges design and development](https://www.figma.com/blog/the-shared-language-of-props/)

### [The shared language of props](https://www.figma.com/blog/the-shared-language-of-props/)

[Component properties differ across design files and coding frameworks. How can we translate and align them to help designers and developers work better together?](https://www.figma.com/blog/the-shared-language-of-props/)

. While designers might focus on visual variants like size and color, developers are concerned with behavioral props like accessibility attributes and event handlers. Creating alignment on how these properties are named ensures smoother handoffs and fewer implementation errors.

When it comes to **naming cases**, talk with your development team to learn about any existing conventions in your organization that you could align with. Hyphens (like “primary-button”) and camel case (like “primaryButton”) tend to be the most commonly used approaches.

### [Organize your Figma library](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/\#organize-your-figma-library)

Hear how Onfido, a technology company that helps businesses with verification, [organizes their design system teams, projects, and files](https://www.youtube.com/watch?v=b0BsybgcaI8&t=8s).

One of the great things about Figma is that you can share **libraries** across different files and projects. This means that everyone on your team can access the same set of styles and components, no matter what they’re working on.

When setting up your library, think about what structure will work best for your team. You might want to keep everything in a single file, or split things up into multiple files for different parts of your project. Consider how both your design team and your development team will be using the library.

To streamline the handoff process, consider using [Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect) to directly link your design components to code implementation. This powerful tool surfaces design systems code from your codebase within Figma, making it easier for both designers and developers to maintain consistency between design and implementation without leaving the Figma environment.

[![A dark-themed graphic highlighting 'Design system structure' with a sidebar titled 'Best practices' and elements such as 'Alert', 'Header', 'Footer', and 'Textarea' linked by a flow diagram.](https://cdn.sanity.io/images/599r6htc/regionalized/2d3a9345a5a8c096225f4d201bb57ccd0bd4f0a3-1920x960.png?w=1920&h=960&q=75&fit=max&auto=format)](https://www.figma.com/community/file/985175703891677674)

Looking for guidance on structuring your design system? Check out [this Community file](https://www.figma.com/community/file/985175703891677674) from Figma Designer Advocate Luis Ouriach for recommendations on how to build out your design system for teams, projects, and files.

Remember, building a design system in Figma is an ongoing process that will grow and evolve along with your team. Start by laying a strong foundation, and encourage everyone—designers and developers alike—to contribute and help improve your design system over time.

If you want to learn more about the nitty-gritty of building a design system in Figma, check out our [step-by-step walkthrough](https://help.figma.com/hc/en-us/articles/14548865734679-Lesson-3-Build-your-design-system) and the video below.

Build your design system - Lesson 3 : Introduction to design systems - YouTube

Tap to unmute

[Build your design system - Lesson 3 : Introduction to design systems](https://www.youtube.com/watch?v=0XSLMGh8yhM) [Figma](https://www.youtube.com/channel/UCQsVmhSa4X-G3lHlUtejzLA)

![thumbnail-image](https://yt3.ggpht.com/hpQ7ZiwllkzteQwrc_TSbuOeP7D9S0n6lVrHTuhCmfJI9wAhvqsIdWrXPj6jJnxkVkZMIy1A=s68-c-k-c0x00ffffff-no-rj)

Figma771K subscribers

[Watch on](https://www.youtube.com/watch?v=0XSLMGh8yhM)

![](https://cdn.sanity.io/images/599r6htc/regionalized/5b6d531eaf0852b4f4c48316c84b449777dd822c-2560x1440.png?w=2560&h=1440&q=75&fit=max&auto=format)

✉️ [Sign up for our editorial newsletter](https://www.figma.com/blog/newsletter/) for more design systems tips and ideas!

And if you have any other questions or topics you’d like to learn about, give us a shout on Twitter at [@figma](https://www.twitter.com/figma). We’re always happy to help! Learn more about how Figma helps teams drive consistency, scale designs, and maintain parity with development using our [design systems features](https://www.figma.com/design-systems/?utm_source=Shortcut&utm_medium=Blog&utm_campaign=ds_102&utm_content=ds_102) and [request a demo](https://www.figma.com/request-a-demo/?utm_source=Shortcut&utm_medium=Blog&utm_campaign=ds_102&utm_content=ds_102).

## Subscribe to Figma’s editorial newsletter

Enter email\*

I agree to opt-in to Figma's mailing list.\*

By clicking “Subscribe” you agree to our [TOS](https://www.figma.com/tos/) and [Privacy Policy](https://www.figma.com/privacy/).

- [![Abstract artwork featuring orange organic shapes and green zigzag patterns on a blue background.](<Base64-Image-Removed>)![Abstract artwork featuring orange organic shapes and green zigzag patterns on a blue background.](https://cdn.sanity.io/images/599r6htc/regionalized/27db1d8f2eb3257c620306f5d87fd62db037c6eb-3264x1836.png?w=528&h=297&q=75&fit=max&auto=format)\\
\\
**Design system 101: What is a design system?**](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/)



  - [Insights](https://www.figma.com/blog/insights/)
  - [Design systems](https://www.figma.com/blog/design-systems/)
  - [Career & education](https://www.figma.com/blog/career-and-education/)
  - [Design](https://www.figma.com/blog/design/)
  - [UI/UX](https://www.figma.com/blog/ui-ux/)
  - [Productivity](https://www.figma.com/blog/productivity/)

- [![](<Base64-Image-Removed>)![](https://cdn.sanity.io/images/599r6htc/regionalized/829eff3112679648cd51df7c04bc0fa7800921c5-3264x1836.png?w=528&h=297&q=75&fit=max&auto=format)\\
\\
**Design system 103: Design system documentation that drives adoption**](https://www.figma.com/blog/design-systems-103-documentation-that-drives-adoption/)



  - [Insights](https://www.figma.com/blog/insights/)
  - [Design systems](https://www.figma.com/blog/design-systems/)
  - [Writing](https://www.figma.com/blog/writing/)
  - [Design](https://www.figma.com/blog/design/)
  - [Engineering](https://www.figma.com/blog/engineering/)
  - [UI/UX](https://www.figma.com/blog/ui-ux/)
  - [Figma Design](https://www.figma.com/blog/figma-design/)

- [![An abstract digital illustration featuring interconnected geometric shapes in a vibrant color palette. The composition consists of tall, three-dimensional blue structures resembling columns or beams, arranged in a staggered pattern. These structures have angular extensions that are connected by thin orange rods, creating a web-like effect. Two large yellow circular and rectangular shapes are present in the background, possibly resembling the sun and a doorway, set against a green textured backdrop. The artwork has a mechanical and architectural feel, with a surreal, almost kinetic energy.](<Base64-Image-Removed>)![An abstract digital illustration featuring interconnected geometric shapes in a vibrant color palette. The composition consists of tall, three-dimensional blue structures resembling columns or beams, arranged in a staggered pattern. These structures have angular extensions that are connected by thin orange rods, creating a web-like effect. Two large yellow circular and rectangular shapes are present in the background, possibly resembling the sun and a doorway, set against a green textured backdrop. The artwork has a mechanical and architectural feel, with a surreal, almost kinetic energy.](https://cdn.sanity.io/images/599r6htc/regionalized/b1a13c19d71e63015c4d7734066cf5259fb6e894-3264x1836.png?w=528&h=297&q=75&fit=max&auto=format)\\
\\
**Design system 104: Making metrics matter**](https://www.figma.com/blog/design-systems-104-making-metrics-matter/)



  - [Insights](https://www.figma.com/blog/insights/)
  - [Design systems](https://www.figma.com/blog/design-systems/)
  - [Career & education](https://www.figma.com/blog/career-and-education/)
  - [Design](https://www.figma.com/blog/design/)
  - [UI/UX](https://www.figma.com/blog/ui-ux/)
  - [Productivity](https://www.figma.com/blog/productivity/)

## Create and collaborate with Figma

[Get started for free](https://www.figma.com/signup?locale=en-us)