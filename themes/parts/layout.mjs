// CSS-only variants, switched by a class on <body> (s-frame-*, s-blocks-*, s-project-*).
export const frame = {
  plain: { label: 'Plain page', from: 'R11 and most R10 styles', css: '' },
  column: { label: 'Narrow column', from: 'R10 Ma', css: 'body.s-frame-column{--wrap:1040px}body.s-frame-column .grid4,body.s-frame-column .cols2{grid-template-columns:minmax(0,1fr)}body.s-frame-column .pcols{grid-template-columns:minmax(0,1fr);gap:24px}' },
  sheet: {
    label: 'Letter sheet', from: 'R10 Issue',
    css: 'body.s-frame-sheet{--wrap:880px}body.s-frame-sheet .wrap{background:var(--card);border-radius:var(--radius);box-shadow:var(--sh);margin:32px auto;padding:8px 56px 16px}body.s-frame-sheet .grid4{grid-template-columns:repeat(2,minmax(0,1fr))}body.s-frame-sheet .pcols{grid-template-columns:minmax(0,1fr);gap:24px}@media (max-width:720px){body.s-frame-sheet .wrap{margin:12px;padding:4px 20px 12px}body.s-frame-sheet .grid4{grid-template-columns:minmax(0,1fr)}}',
  },
  app: { label: 'Full-width app', from: 'R10 Product', css: 'body.s-frame-app{--wrap:1600px}body.s-frame-app .wrap{padding:0 32px}@media (max-width:720px){body.s-frame-app .wrap{padding:0 20px}}' },
};
export const blocks = {
  cards: { label: 'Cards', from: 'R11, R10 Soft, Chart, Candy, Product', css: '' },
  plain: { label: 'Plain rows', from: 'R10 Ink, Ma, Geometric, Poster, Hollow, Issue', css: 'body.s-blocks-plain .item.card,body.s-blocks-plain .rows.card{background:none;box-shadow:none;border-radius:0;padding-left:0;padding-right:0}body.s-blocks-plain .cols2 .item.card{border-top:1px solid var(--line)}' },
};
export const project = {
  columns: { label: 'Three columns', from: 'R11 and most R10 styles', css: '' },
  stacked: { label: 'One column', from: 'R10 Ma, Issue', css: 'body.s-project-stacked .pcols{grid-template-columns:minmax(0,1fr);gap:28px;max-width:760px}' },
};
