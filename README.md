# Sandstorm Group — Website

Premium marketing site for **Sandstorm Group**, a strategic sales & marketing partner.
*Precision in Every Grain.*

## Pages

`index` · `about` · `categories` · `brands` · `partner` · `contact` · `quote` · `news`

## Stack

Static HTML + CSS + vanilla JS — no build step, host anywhere (Vercel, Netlify, GitHub Pages, cPanel).

- **Fonts**: self-hosted (Playfair Display, Montserrat, Cormorant Garamond) in `assets/fonts/`
- **Animations**: GSAP + ScrollTrigger (vendored in `assets/js/vendor/`), IntersectionObserver reveals, `prefers-reduced-motion` respected
- **Hero**: looping dune video (`assets/video/hero.mp4`) with static poster fallback
- **Forms**: no backend — submissions open a pre-filled WhatsApp message to the business number, with an email fallback

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- Contact details (WhatsApp numbers, emails, Facebook) live in the page HTML and `assets/js/main.js` (`WA_NUMBER`, `SALES_EMAIL`).
- `Sandstorm assets temp/` holds the original source assets (brand board, raw logo, footage). The site uses optimized copies from `assets/` — the temp folder can be removed once no longer needed.
