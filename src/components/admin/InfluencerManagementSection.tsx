import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, User, Mail, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InfluencerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  is_verified: boolean;
  verified_by_admin: boolean;
  identity_status: string;
  stripe_identity_status?: string;
}

export const InfluencerManagementSection = () => {
  const queryClient = useQueryClient();

  // Fetch influencers
  const { data: influencers, isLoading } = useQuery({
    queryKey: ['admin-influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url, created_at, is_verified, verified_by_admin, identity_status, stripe_identity_status')
        .eq('role', 'influenceur')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InfluencerProfile[];
    },
  });

  // Validate influencer manually
  const validateInfluencerMutation = useMutation({
    mutationFn: async (influencerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verified_by_admin: true,
          identity_status: 'verified'
        })
        .eq('id', influencerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      toast.success("Influenceur validé avec succès !");
    },
    onError: (error) => {
      console.error('Error validating influencer:', error);
      toast.error("Erreur lors de la validation de l'influenceur");
    },
  });

  const getVerificationStatus = (influencer: InfluencerProfile) => {
    if (influencer.verified_by_admin) {
      return { status: 'validated_admin', label: 'Validé par admin', color: 'bg-green-500' };
    }
    if (influencer.stripe_identity_status === 'verified') {
      return { status: 'validated_stripe', label: 'Validé par Stripe', color: 'bg-blue-500' };
    }
    if (influencer.is_verified) {
      return { status: 'verified', label: 'Vérifié', color: 'bg-green-500' };
    }
    return { status: 'pending', label: 'En attente', color: 'bg-yellow-500' };
  };

  const pendingInfluencers = influencers?.filter(i => !i.is_verified) || [];
  const verifiedInfluencers = influencers?.filter(i => i.is_verified) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gestion des influenceurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Influenceurs en attente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Influenceurs en attente de validation ({pendingInfluencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInfluencers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun influenceur en attente de validation
            </p>
          ) : (
            <div className="space-y-4">
              {pendingInfluencers.map((influencer) => (
                <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={influencer.avatar_url} />
                      <AvatarFallback>
                        {influencer.first_name?.[0]}{influencer.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {influencer.first_name} {influencer.last_name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {influencer.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(influencer.created_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      En attente
                    </Badge>
                    <Button
                      onClick={() => validateInfluencerMutation.mutate(influencer.id)}
                      disabled={validateInfluencerMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider le compte
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Influenceurs validés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Influenceurs validés ({verifiedInfluencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifiedInfluencers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun influenceur validé
            </p>
          ) : (
            <div className="space-y-4">
              {verifiedInfluencers.map((influencer) => {
                const status = getVerificationStatus(influencer);
                return (
                  <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={influencer.avatar_url} />
                        <AvatarFallback>
                          {influencer.first_name?.[0]}{influencer.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {influencer.first_name} {influencer.last_name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {influencer.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(influencer.created_at), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};