import { supabase } from '@/lib/supabase';
import { createProductSchema, updateProductSchema, productQuerySchema } from '@/validations/productValidation';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';

export class ProductController {
  static async getAll(queryParams: any) {
    try {
      const validated = productQuerySchema.parse(queryParams);
      const { page, per_page, search, status, vendor, type, start_date, end_date } = validated;

      let query = supabase
        .from('products')
        .select(`
          *,
          options:product_options(*),
          variants:product_variants(
            *,
            inventory:inventory_items(*)
          )
        `, { count: 'exact' });

      if (search) {
        query = query.or(`title.ilike.%${search}%,vendor.ilike.%${search}%,product_type.ilike.%${search}%`);
      }

      if (status) query = query.eq('status', status);
      if (vendor && !search) query = query.ilike('vendor', `%${vendor}%`);
      if (type && !search) query = query.ilike('product_type', `%${type}%`);

      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Products fetched successfully', data, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      if (error.name === 'ZodError') return sendError('Validation failed', error.errors, 400);
      logger.error('ProductController.getAll', error);
      return sendError(error.message || 'Failed to fetch products');
    }
  }

  static async getById(idOrHandle: string) {
    try {
      const isUuid = idOrHandle.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          options:product_options(*),
          variants:product_variants(
            *,
            inventory:inventory_items(*),
            option_values:product_option_values(
              *,
              option:product_options(name)
            )
          )
        `)
        .eq(isUuid ? 'id' : 'handle', idOrHandle)
        .single();

      if (error) throw error;
      if (!data) return sendError('Product not found', null, 404);
      return sendSuccess('Product fetched successfully', data);
    } catch (error: any) {
      logger.error('ProductController.getById', error);
      return sendError(error.message || 'Failed to fetch product');
    }
  }

  static async create(body: any) {
    try {
      const validated = createProductSchema.parse(body);
      const { options, variants, ...productData } = validated;

      // Automatically set published_at if status is active
      const finalProductData = {
        ...productData,
        published_at: productData.status === 'active' ? new Date().toISOString() : null
      };

      const { data: product, error: pError } = await supabase.from('products').insert(finalProductData).select().single();
      if (pError) throw pError;

      const results: any = { ...product, options: [], variants: [] };
      const optionMap: Record<string, string> = {};

      if (options && options.length > 0) {
        const { data: insertedOptions, error: oError } = await supabase.from('product_options').insert(options.map(opt => ({ ...opt, product_id: product.id }))).select();
        if (oError) throw oError;
        results.options = insertedOptions;
        insertedOptions.forEach(opt => { optionMap[opt.name] = opt.id; });
      }

      if (variants && variants.length > 0) {
        for (const variantData of variants) {
          const { option_values, inventory, ...vData } = variantData;
          const { data: variant, error: vError } = await supabase.from('product_variants').insert({ ...vData, product_id: product.id }).select().single();
          if (vError) throw vError;

          await supabase.from('inventory_items').insert({
            variant_id: variant.id,
            sku: variant.sku,
            cost: inventory?.cost || 0,
            country_code_of_origin: inventory?.country_code_of_origin || null,
            harmonized_system_code: inventory?.harmonized_system_code || null,
            tracked: inventory?.tracked ?? true
          });

          if (option_values && option_values.length > 0) {
            const valuesToInsert = option_values.map(ov => ({
              variant_id: variant.id,
              option_id: optionMap[ov.option_name],
              value: ov.value
            })).filter(ov => ov.option_id);
            if (valuesToInsert.length > 0) await supabase.from('product_option_values').insert(valuesToInsert);
          }
          results.variants.push(variant);
        }
      }
      return sendSuccess('Product created successfully', results, null, 201);
    } catch (error: any) {
      logger.error('ProductController.create', error);
      return sendError(error.message || 'Failed to create product');
    }
  }

  static async update(id: string, body: any) {
    try {
      const validated = updateProductSchema.parse(body);
      const { options, variants, ...productData } = validated;

      // Handle published_at logic for updates
      let finalProductData = { ...productData };
      if (productData.status) {
        if (productData.status === 'active') {
          // Only set published_at if it's not already set
          const { data: current } = await supabase.from('products').select('published_at').eq('id', id).single();
          if (!current?.published_at) {
            finalProductData.published_at = new Date().toISOString();
          }
        } else {
          // If moving away from active, clear published_at
          finalProductData.published_at = null;
        }
      }

      const { data: product, error: pError } = await supabase.from('products').update(finalProductData).eq('id', id).select().single();
      if (pError) throw pError;
      if (!product) return sendError('Product not found', null, 404);

      if (options) {
        await supabase.from('product_options').delete().eq('product_id', id);
        await supabase.from('product_options').insert(options.map(opt => ({ ...opt, product_id: id })));
      }

      if (variants) {
        await supabase.from('product_variants').delete().eq('product_id', id);
        const { data: currentOptions } = await supabase.from('product_options').select('*').eq('product_id', id);
        const optionMap: Record<string, string> = {};
        currentOptions?.forEach(opt => { optionMap[opt.name] = opt.id; });

        for (const variantData of variants) {
          const { option_values, inventory, ...vData } = variantData;
          const { data: variant, error: vError } = await supabase.from('product_variants').insert({ ...vData, product_id: id }).select().single();
          if (vError) throw vError;

          await supabase.from('inventory_items').insert({
            variant_id: variant.id,
            sku: variant.sku,
            cost: inventory?.cost || 0,
            country_code_of_origin: inventory?.country_code_of_origin || null,
            harmonized_system_code: inventory?.harmonized_system_code || null,
            tracked: inventory?.tracked ?? true
          });

          if (option_values && option_values.length > 0) {
            const valuesToInsert = option_values.map(ov => ({
              variant_id: variant.id,
              option_id: optionMap[ov.option_name],
              value: ov.value
            })).filter(ov => ov.option_id);
            if (valuesToInsert.length > 0) await supabase.from('product_option_values').insert(valuesToInsert);
          }
        }
      }
      return sendSuccess('Product updated successfully', product);
    } catch (error: any) {
      logger.error('ProductController.update', error);
      return sendError(error.message || 'Failed to update product');
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return sendSuccess('Product deleted successfully');
    } catch (error: any) {
      logger.error('ProductController.delete', error);
      return sendError(error.message || 'Failed to delete product');
    }
  }

  static async getSummary() {
    try {
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: totalVariants } = await supabase.from('product_variants').select('*', { count: 'exact', head: true });
      const { data: outOfStock } = await supabase.from('inventory_levels').select('id').lte('on_hand', 0);

      return sendSuccess('Product summary fetched successfully', {
        totalProducts: totalProducts || 0,
        totalVariants: totalVariants || 0,
        outOfStock: outOfStock?.length || 0,
        totalValue: 0
      });
    } catch (error: any) {
      logger.error('ProductController.getSummary', error);
      return sendError('Failed to fetch summary');
    }
  }
}
