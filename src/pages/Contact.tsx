import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/common/ScrollReveal";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.functions.invoke('handle-contact-form', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject || "Nouveau message de contact",
          message: formData.message
        }
      });
      if (error) throw error;
      toast.success("Message envoyé avec succès ! Nous vous répondrons bientôt.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-gray-800">Contactez</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  notre équipe
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.2}>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Une question ? Un projet ? Notre équipe est là pour vous accompagner dans vos collaborations.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <ScrollReveal variant="fade-left" delay={0.1}>
              <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <Send className="w-6 h-6 mr-2 text-primary" />
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <Input placeholder="Votre prénom" value={formData.firstName} onChange={e => setFormData({
                      ...formData,
                      firstName: e.target.value
                    })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <Input placeholder="Votre nom" value={formData.lastName} onChange={e => setFormData({
                      ...formData,
                      lastName: e.target.value
                    })} required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input type="email" placeholder="votre@email.com" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet
                    </label>
                    <Input placeholder="Objet de votre message" value={formData.subject} onChange={e => setFormData({
                    ...formData,
                    subject: e.target.value
                  })} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea placeholder="Décrivez votre demande..." rows={6} value={formData.message} onChange={e => setFormData({
                    ...formData,
                    message: e.target.value
                  })} required />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            </ScrollReveal>

            {/* Contact Info */}
            
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Questions fréquentes
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal variant="fade-up" delay={0.1}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Comment devenir influenceur sur Collabmarket ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Il suffit de créer un compte gratuit, compléter votre profil et ajouter vos réseaux sociaux.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={0.2}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Quels sont les frais de commission ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Nous prélevons une commission de 5% sur chaque transaction réussie.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={0.3}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Comment sont traités les paiements ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Les paiements sont sécurisés et versés après validation du travail effectué.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={0.4}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Puis-je annuler une collaboration ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Oui, selon nos conditions d'utilisation, vous pouvez annuler avant le début de la prestation.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Contact;