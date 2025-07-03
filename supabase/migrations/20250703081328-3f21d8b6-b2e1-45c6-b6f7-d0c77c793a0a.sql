-- Fix the get_product_stats function to use correct data types
DROP FUNCTION IF EXISTS public.get_product_stats(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_product_stats(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS TABLE(product_id text, product_name text, mention_count bigint)
 LANGUAGE sql
AS $function$
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COUNT(pm.id) as mention_count
  FROM 
    product_types p
  LEFT JOIN 
    product_mentions pm ON p.id = pm.product_id AND pm.created_at BETWEEN start_date AND end_date
  GROUP BY 
    p.id, p.name
  ORDER BY 
    mention_count DESC;
$function$;