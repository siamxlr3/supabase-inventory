const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://stafjypxneprkezmtfpa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YWZqeXB4bmVwcmtlem10ZnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjk1NDgsImV4cCI6MjA5MzcwNTU0OH0.nRSkOTcZSn02EJLutMbzaB0pvStW9NGs-6ssBBFmcjY'
);

async function checkData() {
  console.log('--- Order Line Items ---');
  const { data: lineItems } = await supabase.from('order_line_items').select('id, product_variant_id, title');
  console.log(JSON.stringify(lineItems, null, 2));

  console.log('\n--- Inventory Items ---');
  const { data: invItems } = await supabase.from('inventory_items').select('id, variant_id');
  console.log(JSON.stringify(invItems, null, 2));

  console.log('\n--- Missing Links ---');
  if (lineItems) {
    for (const li of lineItems) {
      if (li.product_variant_id) {
        const found = invItems?.find(ii => ii.variant_id === li.product_variant_id);
        if (!found) {
          console.log(`MISSING: Line Item ${li.id} (Variant ${li.product_variant_id} - ${li.title}) has no inventory item!`);
        }
      }
    }
  }
}

checkData();
