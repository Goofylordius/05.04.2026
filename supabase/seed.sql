insert into public.role_permissions (role, permission)
values
  ('admin', 'dashboard.view'),
  ('admin', 'crm.view'),
  ('admin', 'crm.manage'),
  ('admin', 'documents.view'),
  ('admin', 'documents.manage'),
  ('admin', 'calendar.view'),
  ('admin', 'calendar.manage'),
  ('admin', 'company.manage'),
  ('admin', 'security.manage'),
  ('admin', 'users.manage'),
  ('admin', 'audit.view'),
  ('sales', 'dashboard.view'),
  ('sales', 'crm.view'),
  ('sales', 'crm.manage'),
  ('sales', 'documents.view'),
  ('sales', 'documents.manage'),
  ('sales', 'calendar.view'),
  ('sales', 'calendar.manage'),
  ('sales', 'security.manage'),
  ('viewer', 'dashboard.view'),
  ('viewer', 'crm.view'),
  ('viewer', 'documents.view'),
  ('viewer', 'calendar.view'),
  ('viewer', 'security.manage')
on conflict do nothing;

insert into public.company_profile (
  id,
  legal_name,
  vat_id,
  tax_number,
  iban,
  bic,
  invoice_email,
  invoice_footer,
  billing_address
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Klaro Vertriebssysteme GmbH',
  'DE318761245',
  '47/928/12045',
  'DE69500105170648489890',
  'INGDDEFFXXX',
  'buchhaltung@klarocrm.de',
  'Geschaeftsfuehrung: Mara Winter. Amtsgericht Berlin-Charlottenburg, HRB 219443 B.',
  jsonb_build_object(
    'line1', 'Friedrichstrasse 141',
    'postalCode', '10117',
    'city', 'Berlin',
    'country', 'Deutschland'
  )
)
on conflict (id) do nothing;

insert into public.customers (
  id,
  type,
  company_name,
  vat_id,
  email,
  phone,
  billing_address,
  shipping_address,
  industry,
  health_score
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'company',
    'Nordlicht Maschinenbau GmbH',
    'DE129837465',
    'einkauf@nordlicht.example',
    '+49 40 2210 400',
    jsonb_build_object(
      'line1', 'Schanzenstrasse 14',
      'postalCode', '20357',
      'city', 'Hamburg',
      'country', 'Deutschland'
    ),
    jsonb_build_object(
      'line1', 'Werkstrasse 4',
      'postalCode', '21465',
      'city', 'Reinbek',
      'country', 'Deutschland'
    ),
    'Maschinenbau',
    88
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'company',
    'Helios Energie Consulting AG',
    'DE255009832',
    'office@helios.example',
    '+49 89 3051 88',
    jsonb_build_object(
      'line1', 'Leopoldstrasse 23',
      'postalCode', '80802',
      'city', 'Muenchen',
      'country', 'Deutschland'
    ),
    null,
    'Energie',
    72
  )
on conflict (id) do nothing;

insert into public.contacts (
  id,
  customer_id,
  first_name,
  last_name,
  email,
  phone,
  job_title
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Lena',
    'Kunz',
    'lena.kunz@nordlicht.example',
    '+49 40 2210 440',
    'Leitung Einkauf'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Mina',
    'Vogt',
    'mina.vogt@helios.example',
    '+49 89 3051 27',
    'Senior Consultant'
  )
on conflict (id) do nothing;

insert into public.deals (
  id,
  customer_id,
  title,
  stage,
  value_cents,
  probability,
  expected_close_date,
  notes
)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Servicevertrag Nordlicht 2026',
    'negotiation',
    1860000,
    74,
    '2026-04-26',
    'Rahmenvertrag inklusive SLA und Schulungspaket.'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'CRM Rollout Helios West',
    'proposal',
    2485000,
    58,
    '2026-05-18',
    'Angebot liegt beim Vorstand.'
  )
on conflict (id) do nothing;
