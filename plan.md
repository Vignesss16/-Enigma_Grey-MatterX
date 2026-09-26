# UI / Visual Design Direction

The UI should feel **futuristic, sleek, premium, and AI-native**, while still maintaining a sense of trust and clarity appropriate for a healthcare-related product.

## Overall Visual Style

- Start with a **clean white background**
- Use white as the primary canvas throughout the application
- Use very light gray surfaces for secondary sections
- Use subtle gradients rather than strong colorful backgrounds
- Use thin, elegant borders
- Use soft shadows and subtle depth
- Use generous whitespace
- Use large, modern typography
- Use rounded cards with refined corner radii
- Use minimal but meaningful icons
- Use subtle glassmorphism where appropriate
- Avoid excessive glassmorphism or overly colorful UI
- Avoid the typical "generic healthcare dashboard" appearance
- Avoid making the interface look childish or cartoonish

The overall feeling should be:

**Apple-like simplicity + futuristic AI product + premium healthcare technology**

---

## Color Direction

Primary background:

- White `#FFFFFF`

Secondary backgrounds:

- Very light gray
- Off-white
- Subtle neutral gradients

Text:

- Near-black / dark charcoal for primary text
- Muted gray for secondary text

Accent colors should be used sparingly.

Risk indicators can use:

- Green → lower concern
- Amber → caution
- Red → higher concern

These colors should primarily communicate status rather than dominate the interface.

---

## Futuristic Elements

Use subtle futuristic details such as:

- Animated gradient borders
- Soft glowing accents
- Minimal grid patterns
- Subtle animated particles where appropriate
- Smooth card hover effects
- Animated scanning indicators
- AI processing animations
- Gradient text for important AI-related headings
- Subtle light effects around primary CTAs
- Smooth page transitions

Do NOT overuse futuristic effects.

The interface should feel:

"Future technology made simple"

rather than:

"Sci-fi gaming interface."

---

## Hero Section

The landing page should immediately establish the futuristic visual identity.

Start with a **pure white background**.

Use a large headline with strong typography:

"Know what's in your food.
Know what it means for you."

Place a sleek interactive food analysis card beside or below the headline.

The card can include:

- Food image
- AI scanning indicator
- Ingredient detection
- Personalized risk indicator
- Nutrition information
- AI explanation

Add subtle animated elements around the card to communicate that the system is analyzing the food.

---

## Cards

Cards should use:

- White background
- Very subtle gray border
- Soft shadow
- 16–24px border radius
- Generous internal spacing

Example:

┌──────────────────────────────┐
│                              │
│  Chocolate Protein Bar       │
│                              │
│  🟠 Use Caution              │
│                              │
│  Added sugar       12g       │
│  Sodium            420mg     │
│                              │
│  Why this matters →         │
│                              │
└──────────────────────────────┘

Cards should feel lightweight and elegant rather than heavy.

---

## AI Analysis Animation

The scanning experience should be visually impressive.

Example:

Food Image
↓
Animated scanning line
↓
"Reading ingredients..."
↓
"Identifying nutritional information..."
↓
"Checking your profile..."
↓
"Preparing personalized insights..."

Use Framer Motion for these transitions.

The animation should feel like an advanced AI system processing information.

Keep it fast enough that users don't feel like they are waiting unnecessarily.

---

## Typography

Use a modern sans-serif font.

Recommended:

- Inter
- Geist
- Plus Jakarta Sans

Use strong typography hierarchy:

Large:

Hero headings

Medium:

Section headings

Small:

Supporting information

Avoid excessive bold text.

---

## Buttons

Primary CTA:

- Dark/black or refined accent
- Rounded
- Strong typography
- Subtle hover animation

Example:

`Scan Your Food →`

Secondary buttons:

- White background
- Thin border
- Dark text

Buttons should have smooth hover and press animations.

---

## Micro Interactions

Add subtle interactions throughout the application:

- Cards slightly lift on hover
- Buttons smoothly transition
- Risk indicators animate when appearing
- Progress indicators animate
- Navigation transitions smoothly
- Upload area reacts when an image is dragged over it
- Ingredient cards expand smoothly
- Dashboard numbers animate into view

Animations should be subtle and fast.

---

## Responsive Design

The UI must be designed mobile-first but should look excellent on desktop.

Desktop:

- Spacious dashboard
- Sidebar navigation
- Large analysis cards
- Two-column layouts where appropriate

Mobile:

- Bottom navigation
- Large scan button
- Stacked cards
- Easy-to-read results
- Touch-friendly controls

The application should feel like a **premium mobile health-tech product**, even when viewed on desktop.

---

## Design Principle

Every screen should follow this principle:

**Clean → Intelligent → Personalized → Actionable**

The UI should communicate that the application is not simply scanning ingredients.

It is:

**Understanding the food → Understanding the person → Connecting the two → Explaining the potential concern**

The final V1 should look polished enough to be presented directly to hackathon judges.