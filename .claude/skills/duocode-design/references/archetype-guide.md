# Website Archetype Guide

> **How to use**: The `PrepareResult` JSON includes an `archetype` field. Read the section for that archetype to know what page sections to create, what the primary CTA should be, and how to structure the design. The archetype determines **WHAT** to build; the `frontend-design` skill determines **HOW** to style it.

> **Demo features**: All interactive features (ordering, booking, cart, etc.) are **frontend prototypes**. They should be fully interactive UI components, but clicking the final action (submit, checkout, book) shows a demo confirmation: "此功能将在正式版中启用 / This feature will be available in the production version."

---

## Archetype 1: MENU + ORDER

**Used by**: Restaurants, cafes, bakeries, food trucks, catering, bars, kopitiam

**Primary goal**: Get visitors to browse the menu and place an order or make a reservation.

**Primary CTA**: "View Menu" / "Lihat Menu" / "查看菜单" / "查看菜單"

### Required Sections
- **Hero**: Full-bleed food photography. The food IS the hero — make it appetizing.
- **Menu**: Categorized items with names, descriptions, and prices. NEVER use a PDF menu. Photos next to items when available. Use `content.menu.categories[]` data.
- **Hours**: Operating hours prominently displayed, including holiday schedules.
- **Location**: Address + embedded map + directions link (Waze preferred in Malaysia).
- **Contact**: Click-to-call + WhatsApp as primary contact.
- **Reviews**: Google reviews with star ratings.

### Recommended Sections
- **Ordering**: Links to delivery platforms (GrabFood, FoodPanda, ShopeeFood) or WhatsApp ordering. Use `content.ordering` data.
- **Reservations**: Table reservation via date picker prototype. Use `content.reservations` data.
- **Gallery**: Food photography carousel.
- **Trust Bar**: Halal certification, hygiene rating, years in business.

### Demo Features to Build
1. **Interactive menu browser**: Categorized tabs/accordion, item cards with photos and prices, expandable descriptions.
2. **Add-to-cart prototype**: "Add" button on menu items → floating cart icon with count → cart drawer showing selected items with quantity +/- → "Place Order" button → demo confirmation modal.
3. **Table reservation picker**: Date picker + time slot selector + party size → "Reserve" button → demo confirmation.

### Conversion Elements
- Menu with visible prices (no PDFs)
- "Order Now" / "Reserve Table" in sticky header
- WhatsApp link for direct ordering
- Operating hours impossible to miss
- Food photography as social proof

### Design Guidance
Food photography is the star. Use full-bleed hero with best food image. The menu should feel browsable — categorized, not a wall of text. Put photos next to dishes when available. Ordering CTA should feel natural. Warm, inviting color palette. Organic/rounded shapes.

---

## Archetype 2: BOOKING + SERVICES

**Used by**: Salons, spas, barbershops, clinics, dental, physiotherapy, veterinary, pet grooming, tuition centers, driving schools

**Primary goal**: Get visitors to book an appointment or service.

**Primary CTA**: "Book Now" / "Tempah Sekarang" / "立即预约" / "立即預約"

### Required Sections
- **Hero**: Professional ambience imagery. Clean, trustworthy feel.
- **Services**: Catalog with title, description, duration, and price per service. Use `content.services[]` data.
- **Hours**: Walk-in availability + appointment hours.
- **Location**: Address + parking info + public transport options.
- **Contact**: WhatsApp for quick questions + phone.
- **Reviews**: Client testimonials with ratings.

### Recommended Sections
- **Staff**: Team profiles with photo, role, specialties, experience. Use `content.staff[]` data. Clients book with specific people.
- **Gallery / Before-After**: Visual proof of work quality. Use `content.beforeAfter[]` for comparison slider or `content.portfolio` for gallery.
- **Trust Bar**: Certifications, insurance panels accepted (clinic), years of experience.
- **FAQ**: Common questions about services, pricing, preparation. Use `content.faq[]` data.

### Demo Features to Build
1. **Service browser**: Card grid with service name, duration badge, price, description. Filter by category if multiple.
2. **Booking flow**: Select service → pick staff member (optional) → date picker → time slot grid → contact info form → "Confirm Booking" → demo confirmation.
3. **Staff profile cards**: Photo + name + role + specialties. Click to see full bio.

### Conversion Elements
- "Book Now" button visible on every section
- Service prices clearly listed (transparency = trust)
- Staff photos and bios (personal connection)
- Before/after gallery (especially beauty, dental)
- Cancellation policy stated (reduces booking friction)

### Design Guidance
Clean, professional, trust-forward. Services are the centerpiece with clear pricing and durations. Staff profiles humanize the business. For beauty: elegant, aspirational aesthetic. For clinic: calming, clinical trust signals with prominent credentials. For pet: warm, playful feel.

---

## Archetype 3: LEAD GENERATION + TRUST

**Used by**: Professional services (lawyers, accountants, consultants), home services (plumbing, electrical, cleaning, renovation), automotive repair, tech repair, IT support

**Primary goal**: Get visitors to call, submit an inquiry, or request a quote.

**Primary CTA**: "Get Quote" / "Dapatkan Sebut Harga" / "获取报价" / "取得報價"

### Required Sections
- **Hero**: Value proposition + CTA. Confidence-inspiring imagery.
- **Services**: Overview of what's offered with clear descriptions. Use `content.services[]` data.
- **Credentials**: Certifications, licenses, years in business, team size. Use `content.credentials[]` data.
- **Contact**: Multiple channels — phone, WhatsApp, email, contact form. Multiple options = lower friction.
- **Reviews**: Testimonials focused on trust and reliability.

### Recommended Sections
- **FAQ**: Addresses common objections and questions. Use `content.faq[]` data.
- **Service Areas**: Geographic coverage with map. Use `content.serviceAreas` data.
- **Case Studies**: Project examples with before/after or results. Use `content.caseStudies[]` data.
- **Trust Bar**: Years in business, projects completed, certifications count, response time.

### Demo Features to Build
1. **Quick quote form**: Service type dropdown → brief description textarea → name + phone → "Get Quote" → demo confirmation with "We'll respond within 24 hours" message.
2. **Service area map**: Interactive area display showing coverage zones.
3. **FAQ accordion**: Expandable Q&A sections with smooth animation.

### Conversion Elements
- Credentials above the fold — unmissable
- Years in business prominently displayed
- Multiple contact methods (phone, WhatsApp, form)
- Case studies / project portfolio
- Response time guarantee ("Reply within 2 hours")

### Design Guidance
Trust-heavy. Credentials should be impossible to miss — above the fold. Social proof and certifications front and center. Service descriptions focus on expertise, not just listing. FAQ addresses objections. Contact form is simple (name, phone, brief message). For automotive/tech: show technical competence. For professional services: show authority and reliability.

---

## Archetype 4: E-COMMERCE + CATALOG

**Used by**: Clothing stores, electronics shops, florists, bookstores, pet shops, grocery, phone accessories, hardware stores

**Primary goal**: Get visitors to browse products and inquire/purchase.

**Primary CTA**: "Shop Now" / "Beli Sekarang" / "立即选购" / "立即選購"

### Required Sections
- **Hero**: Featured products or promotions. Eye-catching product photography.
- **Products**: Categorized catalog with photos, names, prices. Use `content.products.categories[]` data.
- **Contact**: WhatsApp for product inquiries + store location.
- **Reviews**: Customer reviews and ratings.

### Recommended Sections
- **Promotions**: Sale banners, bundle deals, seasonal offers.
- **Trust Bar**: Return policy, secure payment badges, delivery guarantee.
- **FAQ**: Shipping, returns, warranty questions.

### Demo Features to Build
1. **Product catalog**: Category tabs/filter → product grid with image, name, price → click for detail modal with multiple images, full description, stock status.
2. **Shopping cart**: "Add to Cart" button on products → cart drawer with items, quantities (+/-), subtotal → "Checkout" button → demo confirmation.
3. **Product search**: Search bar with auto-suggest filtering across products.

### Conversion Elements
- Clear product photography with multiple angles
- Transparent pricing with visible discounts
- "Add to Cart" prominent on product cards
- Trust badges (secure payment, return policy)
- Multiple payment methods displayed

### Design Guidance
Products front and center. Grid layout with clear category filters. Each product card: image, name, price, optional "Sale" badge. Shopping cart is interactive demo with quantity controls. Modern, clean layout. Vibrant accent colors for CTAs and promotions.

---

## Archetype 5: PORTFOLIO + GALLERY

**Used by**: Photographers, wedding planners, event decorators, DJs, makeup artists, interior designers

**Primary goal**: Showcase work quality and get inquiries for bookings.

**Primary CTA**: "View Our Work" / "Lihat Karya Kami" / "查看作品" / "查看作品"

### Required Sections
- **Hero**: Best work as hero image. Let the portfolio speak.
- **Portfolio**: Categorized image gallery. Use `content.portfolio.categories[]` data.
- **Services**: What's offered with descriptions. Use `content.services[]` data.
- **Contact**: Inquiry form for event-specific questions.
- **Reviews**: Client testimonials with event context.

### Recommended Sections
- **Packages**: Pricing tiers with feature comparison. Use `content.packages[]` data.
- **Trust Bar**: Events completed, years of experience, awards.
- **FAQ**: Booking process, availability, travel policy.

### Demo Features to Build
1. **Gallery with lightbox**: Masonry or grid layout → click for full-screen lightbox with navigation → category filter tabs.
2. **Package selector**: Side-by-side comparison cards with "Most Popular" badge → "Select Package" → inquiry form pre-filled with package name.
3. **Event inquiry form**: Event type + date + guest count + message → "Send Inquiry" → demo confirmation.

### Design Guidance
Visual-first. Gallery IS the hero — let images do the talking. Elegant typography. Packages table for pricing transparency. Inquiry form should capture event details. Soft, sophisticated color palette for weddings. Bold for events/DJs.

---

## Archetype 6: MEMBERSHIP + SCHEDULE

**Used by**: Gyms, yoga studios, martial arts schools, CrossFit, Pilates, sports facilities, dance studios, swimming pools

**Primary goal**: Get visitors to sign up for a free trial or membership.

**Primary CTA**: "Start Free Trial" / "Cuba Percuma" / "免费体验" / "免費體驗"

### Required Sections
- **Hero**: Energy/lifestyle imagery. Aspirational fitness photography.
- **Classes**: Weekly timetable/schedule. Use `content.classes[]` data.
- **Memberships**: Tier comparison with pricing. Use `content.memberships[]` data.
- **Hours**: Facility hours + peak times.
- **Location**: Address + facilities overview.
- **Contact**: Phone + WhatsApp for pricing inquiries.
- **Reviews**: Member transformation stories and testimonials.

### Recommended Sections
- **Trainers**: Instructor profiles with certifications. Use `content.trainers[]` data.
- **Gallery**: Facility photos, equipment, changing rooms.
- **Trust Bar**: Active members count, years established, certified trainers.

### Demo Features to Build
1. **Interactive weekly timetable**: Grid layout (days × time slots) → color-coded by class type → click for class details (instructor, level, duration) → "Book Class" → demo confirmation.
2. **Membership comparison**: 2-3 tier cards side-by-side → feature checkmarks → "Most Popular" badge → "Join Now" → demo confirmation.
3. **Free trial signup**: Name + phone + preferred class → "Start Free Trial" → demo confirmation with welcome message.

### Design Guidance
High-energy. Bold typography (Oswald, Montserrat). Dynamic imagery. Class schedule should be immediately scannable without login. Membership tiers side-by-side for easy comparison. Free trial is THE primary conversion — make it unmissable. Bold, vibrant color palette.

---

## Archetype 7: PROPERTY + LISTING

**Used by**: Hotels, hostels, homestays, resorts, real estate agencies, property management

**Primary goal**: Get visitors to browse listings and schedule a viewing or book a stay.

**Primary CTA**: "View Listings" / "Lihat Senarai" / "查看房源" / "查看房源"

### Required Sections
- **Hero**: Best property image with search/browse CTA.
- **Listings**: Featured property/room grid. Use `content.listings[]` data.
- **Contact**: Inquiry form + phone + WhatsApp.
- **Reviews**: Guest/client testimonials.

### Recommended Sections
- **Gallery**: Property/room photo galleries.
- **Trust Bar**: Properties managed, years of experience, satisfaction rate.
- **FAQ**: Booking process, deposit, check-in, amenities.

### Demo Features to Build
1. **Property/room browser**: Filter by type/price → grid of listing cards with image, title, price, key features → click for detail modal with image carousel + full specs + map.
2. **Listing inquiry**: Pre-filled with property name → preferred dates (for hospitality) or viewing date (for real estate) → contact info → "Send Inquiry" → demo confirmation.
3. **Image gallery**: Full-screen slideshow per listing.

### Design Guidance
Search-forward. Featured listings grid prominent. Each listing: image, title, price, key features. Elegant for hospitality, professional for real estate. High-quality photography is essential. Map integration for location context.

---

## Archetype 8: COMMUNITY + INFORMATION

**Used by**: Mosques, temples, churches, community centers, nonprofits, associations

**Primary goal**: Inform the community, encourage attendance, and facilitate donations.

**Primary CTA**: "Join Us" / "Sertai Kami" / "加入我们" / "加入我們"

### Required Sections
- **Hero**: Welcoming community imagery. Inclusive and warm.
- **Events**: Upcoming events list with dates and descriptions. Use `content.events[]` data.
- **Programs**: Community services and programs offered. Use `content.programs[]` data.
- **Contact**: Phone + WhatsApp + location.
- **Hours**: Service/prayer times + office hours.
- **Location**: Address + map + parking info.

### Recommended Sections
- **Announcements**: News and community updates. Use `content.announcements[]` data.
- **Donations**: Giving options with tiers. Use `content.donations` data.
- **Gallery**: Community event photos, facility tours.
- **Trust Bar**: Community members, years established, programs count.

### Demo Features to Build
1. **Events calendar**: Chronological list of upcoming events → click for details (time, location, description) → "Attend" button → demo confirmation.
2. **Donation selector**: Preset amount buttons (RM10, RM50, RM100, Custom) → "Donate" → demo confirmation with thank-you message.
3. **Program directory**: Card grid of available programs → click for details with schedule.

### Design Guidance
Welcoming, inclusive, warm. Community imagery with people. Organic color palette. Events calendar should be the focal point. Donation options available but never pushy — community first, giving second. For religious institutions: respectful, serene. For community centers: vibrant, active.

---

## Universal Rules (All Archetypes)

1. **Demo confirmation pattern**: When user clicks a final action (Order, Book, Submit, Donate), show a styled modal/toast: "✓ Demo Mode — 此功能将在正式版中启用 / This feature will be available in the production version". Style it to match the site theme.

2. **Mobile-first**: All interactive features must work on mobile. Touch targets ≥ 44×44px.

3. **WhatsApp integration**: Always include a WhatsApp button as an alternative contact method. Use `https://wa.me/{whatsappPrefix}{number}` format.

4. **Language switcher**: All content (including demo features) must work in all configured locales.

5. **SEO**: Use the correct Schema.org type from `business.schemaOrgType`. Add structured data for the archetype's key content (menu items for restaurants, services for salons, etc.).
