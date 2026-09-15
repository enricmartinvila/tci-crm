# The Cartel Insider → Attio

## Orden de importación
1. `Companies.csv`
2. `People.csv`
3. `Deals.csv`

## Companies
Importa `Companies.csv` como objeto **Companies**.

Mapeo recomendado:
- Company Name → Name
- Website → Website / Domains
- Category → custom attribute
- Priority → custom attribute
- YouTube Fit → number
- Instagram Fit → number
- Proven Creator Spend → number
- Thematic Fit → number
- Contactability → number
- Weighted Score → number
- Evidence of Creator Sponsorship → long text
- Comparable Channels → long text
- Personalization Hook → long text
- Likely Exclusivity / Conflict → long text
- Research / Evidence URL → URL
- Evidence Confidence → select/text
- Company Status → select
- Next Action → long text
- Last Contact → date
- Next Follow-up → date
- Notes → long text

Usa `Company Name` como identificador principal.

## People
Importa `People.csv` como objeto **People**.

Mapeo recomendado:
- Full Name → Name
- Email → Email
- Job Title → Job title
- Company → relación con Company existente
- LinkedIn / Route → LinkedIn / URL
- Contact Rank → number
- Employer / Agency → text
- Contact Type → select/text
- Why This Contact → long text
- Verification Confidence → select/text
- Source URL → URL
- Suggested Personalization → long text
- Outreach Status → select
- Last Contact → date
- Next Follow-up → date
- Notes → long text
- Is Placeholder → checkbox/select

### Importante
Las filas `TO RESEARCH` no son personas reales. Se conservan para que no pierdas los huecos de investigación.
Si prefieres un CRM limpio, filtra `Is Placeholder = Yes` y no las importes.

## Deals
Importa `Deals.csv` como objeto **Deals**.

Mapeo recomendado:
- Deal Name → Name
- Company → relación con Company existente
- Pipeline Stage → Stage
- Priority → custom attribute
- Category → custom attribute
- Weighted Score → number
- YouTube Fit → number
- Instagram Fit → number
- Next Action → long text
- Last Contact → date
- Next Follow-up → date
- Potential Exclusivity / Conflict → long text
- Research / Evidence URL → URL
- Notes → long text
- Deal Value → Value
- Currency → Currency
- Owner → Owner

## Pipeline recomendado
- Researching
- Ready to Contact
- Contacted
- Waiting Reply
- Follow-up
- Interested
- Media Kit Sent
- Negotiating
- Sponsor Won
- Not Now
- Lost

## Campos que añadiría en Attio desde ahora
A nivel Company:
- Primary Outreach Channel
- Official Creator Form
- Official Influencer Email
- Instagram DM Suitable
- Press Kit Required First
- Affiliate Program
- Paid Sponsorship Confirmed

## Flujo de trabajo
1. Abre una Company.
2. Revisa Priority + Personalization Hook.
3. Mira People relacionados y Contact Rank.
4. Registra el canal usado.
5. Cambia el Deal a `Contacted`.
6. Define `Next Follow-up`.
7. Cuando responda alguien, actualiza Company/Deal, no solo la persona.
8. Guarda formularios, emails oficiales, agencia, condiciones y exclusividades en el Deal.

## Cuando llegue el press kit
Añade a Company o Deal:
- YouTube subscribers
- Median views últimos 10
- Average views
- Views 28d / 90d
- Top countries
- Age / gender
- Instagram followers
- Instagram reach
- Average Reel views
- Proposed YouTube rate
- Proposed Instagram rate
- Bundle rate
