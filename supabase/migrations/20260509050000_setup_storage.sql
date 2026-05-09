-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the product-images bucket
CREATE POLICY "Allow public read on product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow public insert access to the product-images bucket
CREATE POLICY "Allow public insert on product-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- Allow public update access to the product-images bucket
CREATE POLICY "Allow public update on product-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product-images');

-- Allow public delete access to the product-images bucket
CREATE POLICY "Allow public delete on product-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');
