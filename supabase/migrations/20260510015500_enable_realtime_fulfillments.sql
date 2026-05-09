-- Enable Realtime for fulfillment tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.fulfillment_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fulfillments;
