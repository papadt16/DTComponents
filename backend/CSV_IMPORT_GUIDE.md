# Bulk product import — CSV guide

`sample-products-template.csv` now covers a much wider spread of categories
(Microcontrollers, Development Boards, Sensors, ICs, Passives, Modules,
Displays, LEDs, Tools, Transistors, Diodes, Switches, Motors & Drivers,
Power & Batteries, Connectors, Cables & Wires, Enclosures, Audio, Camera &
Vision) — a general electronics-retailer breadth, not copied from any
specific competitor's catalog.

**Important — pricing:** rows that already had real prices from the
original template kept them. Every newly added row has `price,stock` set
to `0,0` as a placeholder — these need your real supplier cost and stock
count before (or after) import. I didn't invent prices for these, since a
wrong number here is worse than an obviously-fake one.

## How categories work now

The Shop page's category sidebar is no longer a hardcoded list in the
code — it's pulled live from `GET /products/categories`, which returns
whatever distinct category values actually exist in the database. That
means:

- Any category name you use in a CSV import (or type into the admin
  product form) will automatically appear as a filter option on the
  storefront — no code change needed.
- Keep category names **consistent** across rows (e.g. always
  `"Power & Batteries"`, not sometimes `"Power"` and sometimes
  `"Batteries"`) or you'll end up with near-duplicate filters.

## Workflow

1. Open `sample-products-template.csv` in Excel/Sheets.
2. Fill in real `price` and `stock` for the `0,0` rows (delete any rows
   you don't want to carry).
3. Add more rows for anything missing — same six columns, `img` can stay
   blank (falls back to a placeholder image) or hold a Cloudinary/hosted
   image URL.
4. Import via Admin → Products → bulk import.
