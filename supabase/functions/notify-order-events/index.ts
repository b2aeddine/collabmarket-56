import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, event, details } = await req.json();

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        offers(title),
        influencer:profiles!orders_influencer_id_fkey(first_name, last_name, email),
        merchant:profiles!orders_merchant_id_fkey(first_name, last_name, email, company_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    let notificationContent = '';
    let notificationTitle = '';
    let targetUserId = '';

    switch (event) {
      case 'order_created':
        // Notify influencer of new order
        targetUserId = order.influencer_id;
        notificationTitle = 'Nouvelle commande reçue';
        notificationContent = `${order.merchant?.company_name || order.merchant?.first_name} vous a envoyé une commande pour "${order.offers?.title}". Vous avez 48h pour l'accepter.`;
        break;

      case 'order_accepted':
        // Notify merchant that order was accepted
        targetUserId = order.merchant_id;
        notificationTitle = 'Commande acceptée';
        notificationContent = `${order.influencer?.first_name} a accepté votre commande pour "${order.offers?.title}".`;
        break;

      case 'order_refused':
        // Notify merchant that order was refused
        targetUserId = order.merchant_id;
        notificationTitle = 'Commande refusée';
        notificationContent = `${order.influencer?.first_name} a refusé votre commande pour "${order.offers?.title}". Votre paiement sera remboursé.`;
        break;

      case 'order_delivered':
        // Notify merchant that order was delivered
        targetUserId = order.merchant_id;
        notificationTitle = 'Prestation livrée';
        notificationContent = `${order.influencer?.first_name} a marqué la prestation "${order.offers?.title}" comme livrée. Vous avez 48h pour confirmer la réception.`;
        break;

      case 'order_contested':
        // Notify admin of contestation
        notificationTitle = 'Nouvelle contestation';
        notificationContent = `${order.influencer?.first_name} a contesté la commande "${order.offers?.title}". Intervention administrateur requise.`;
        
        // Get all admin users
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true);

        // Send notification to all admins
        if (admins && admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            type: 'order_contested',
            title: notificationTitle,
            content: notificationContent,
            related_id: orderId
          }));

          await supabase
            .from('notifications')
            .insert(adminNotifications);
        }
        break;

      case 'order_auto_cancelled':
        // Notify both parties
        const notifications = [
          {
            user_id: order.influencer_id,
            type: 'order_cancelled',
            title: 'Commande annulée automatiquement',
            content: `La commande pour "${order.offers?.title}" a été annulée car elle n'a pas été acceptée dans les délais.`,
            related_id: orderId
          },
          {
            user_id: order.merchant_id,
            type: 'order_cancelled',
            title: 'Commande annulée et remboursée',
            content: `Votre commande pour "${order.offers?.title}" a été annulée car l'influenceur n'a pas répondu. Vous serez remboursé.`,
            related_id: orderId
          }
        ];

        await supabase
          .from('notifications')
          .insert(notifications);
        break;

      case 'order_auto_completed':
        // Notify influencer that payment was released
        targetUserId = order.influencer_id;
        notificationTitle = 'Paiement libéré';
        notificationContent = `Le paiement pour la commande "${order.offers?.title}" a été automatiquement libéré après 48h.`;
        break;
    }

    // Insert notification for single user events
    if (targetUserId && notificationTitle && notificationContent) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: targetUserId,
          type: event,
          title: notificationTitle,
          content: notificationContent,
          related_id: orderId
        }]);
    }

    console.log(`Notification sent for event: ${event}, order: ${orderId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for ${event}` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});