const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://stafjypxneprkezmtfpa.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YWZqeXB4bmVwcmtlem10ZnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEyOTU0OCwiZXhwIjoyMDkzNzA1NTQ4fQ.HTDJRHcLWgx5liROFvJOSC2S1HRmwzseCHVL-pt292I';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
  console.log('Starting storage setup...');
  
  // 1. Create the bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('product-images', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('Bucket "product-images" already exists.');
    } else {
      console.error('Error creating bucket:', bucketError.message);
      return;
    }
  } else {
    console.log('Bucket "product-images" created successfully.');
  }

  // Note: RLS Policies for Storage are handled at the SQL level.
  // Since we are using the service role key for the setup, we can also try to run SQL if we had the access,
  // but usually creating a public bucket via service role is enough for reading.
  // However, for CLIENT-SIDE uploads (which we do via our API using the anon key), 
  // we still need the SQL policies I provided earlier.
  
  console.log('Setup complete. Please remember to run the SQL policies in your Supabase SQL Editor if you still get RLS errors.');
}

setupStorage();
