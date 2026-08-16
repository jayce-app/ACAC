# Austin County Association of Contractors

Public website for the Austin County Association of Contractors (ACAC).

## Pages

- **Home** — Vision, About Us, and Goals
- **Members** — Public directory of vetted members (empty until contractors are approved)
- **Lounge** — Application, login, Members Lounge with bid board, blacklist, and discussions
- **Permits** — Links to Austin County and municipal permit resources

## Develop

```bash
npm install
npm run dev
```

## Board login (Members Lounge testing)

- Email: `board@acac.local`
- Password: `integrity`

Membership, bids, and blacklist data are stored in the browser (`localStorage`) for this demo.
Approved members (except the board test account) appear on the public Members page.
