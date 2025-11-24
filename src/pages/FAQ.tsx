import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const influencerFAQ = [
    {
      id: "inf-1",
      question: "Comment proposer une offre sur la plateforme ?",
      answer: "Pour proposer une offre, rendez-vous sur votre tableau de bord influenceur et cliquez sur 'Créer une offre'. Remplissez les détails de votre prestation, fixez votre prix et publiez votre offre. Elle sera visible par tous les commerçants."
    },
    {
      id: "inf-2", 
      question: "Comment retirer mes gains ?",
      answer: "Accédez à la section 'Revenus' de votre profil. Vous pouvez demander un retrait une fois que vos prestations sont validées. Les paiements sont traités sous 2-7 jours ouvrés."
    },
    {
      id: "inf-3",
      question: "Comment vérifier mon identité ?",
      answer: "La vérification d'identité se fait via Stripe Identity. Cliquez sur 'Vérifier mon identité' dans votre profil et suivez les instructions. Vous devrez fournir une pièce d'identité valide."
    },
    {
      id: "inf-4",
      question: "Comment recevoir et traiter une commande ?",
      answer: "Vous recevrez une notification par email et sur la plateforme dès qu'un commerçant passe commande. Consultez les détails dans votre section 'Commandes' et commencez la prestation selon les consignes fournies."
    },
    {
      id: "inf-5",
      question: "Que faire si un commerçant n'est pas satisfait ?",
      answer: "Communiquez d'abord avec le commerçant via notre système de messagerie. Si le problème persiste, vous pouvez ouvrir un litige dans la section 'Litiges'. Notre équipe médiera pour trouver une solution équitable."
    },
    {
      id: "inf-6",
      question: "Comment modifier ou supprimer une offre ?",
      answer: "Dans votre tableau de bord, accédez à 'Mes offres'. Cliquez sur l'offre que vous souhaitez modifier et utilisez les boutons 'Modifier' ou 'Supprimer'. Attention : vous ne pouvez pas supprimer une offre avec des commandes en cours."
    }
  ];

  const merchantFAQ = [
    {
      id: "mer-1",
      question: "Comment passer une commande ?",
      answer: "Parcourez le catalogue d'influenceurs, sélectionnez celui qui correspond à vos besoins, choisissez son offre et cliquez sur 'Commander'. Remplissez les détails de votre campagne et procédez au paiement sécurisé."
    },
    {
      id: "mer-2",
      question: "Comment fonctionne la validation d'une prestation ?",
      answer: "Une fois la prestation livrée par l'influenceur, vous avez 7 jours pour la valider. Vérifiez que tout correspond à vos attentes et cliquez sur 'Valider la prestation'. Le paiement sera alors libéré à l'influenceur."
    },
    {
      id: "mer-3",
      question: "Puis-je annuler une commande ?",
      answer: "Vous pouvez annuler une commande dans les 24h suivant la commande si l'influenceur n'a pas encore commencé. Après ce délai, contactez l'influenceur ou ouvrez un litige si nécessaire."
    },
    {
      id: "mer-4",
      question: "Comment communiquer avec un influenceur ?",
      answer: "Utilisez notre système de messagerie intégré. Cliquez sur 'Messages' dans votre tableau de bord ou sur le profil de l'influenceur pour démarrer une conversation. Toutes les communications sont tracées pour votre sécurité."
    },
    {
      id: "mer-5",
      question: "Que faire si je ne suis pas satisfait du travail ?",
      answer: "Contactez d'abord l'influenceur pour demander des modifications. Si aucun accord n'est trouvé, vous pouvez refuser la prestation et ouvrir un litige. Notre équipe examinera le cas et prendra une décision équitable."
    },
    {
      id: "mer-6",
      question: "Comment suivre mes commandes en cours ?",
      answer: "Rendez-vous dans la section 'Mes commandes' de votre tableau de bord. Vous y verrez le statut de chaque commande, les délais de livraison et pourrez communiquer avec vos influenceurs."
    },
    {
      id: "mer-7",
      question: "Comment gérer mes factures et paiements ?",
      answer: "Toutes vos factures sont disponibles dans la section 'Facturation'. Les paiements sont sécurisés via Stripe. Vous recevrez un reçu par email après chaque transaction."
    }
  ];

  const filterFAQ = (faqList: typeof influencerFAQ) => {
    if (!searchTerm) return faqList;
    return faqList.filter(
      item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-teal-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              F.A.Q
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur le fonctionnement de notre plateforme
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* FAQ Tabs */}
        <Tabs defaultValue="influencers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="influencers" className="text-sm sm:text-base py-3 px-2 sm:px-3">
              <span className="hidden sm:inline">🎯 Pour les</span>
              <span className="sm:hidden">🎯</span>
              <span className="ml-1">Influenceurs</span>
            </TabsTrigger>
            <TabsTrigger value="merchants" className="text-sm sm:text-base py-3 px-2 sm:px-3">
              <span className="hidden sm:inline">🛍️ Pour les</span>
              <span className="sm:hidden">🛍️</span>
              <span className="ml-1">Commerçants</span>
            </TabsTrigger>
          </TabsList>

          {/* Influencers FAQ */}
          <TabsContent value="influencers">
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {filterFAQ(influencerFAQ).map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-b border-border/50">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-2 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {filterFAQ(influencerFAQ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune question trouvée pour "{searchTerm}"
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Merchants FAQ */}
          <TabsContent value="merchants">
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {filterFAQ(merchantFAQ).map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-b border-border/50">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-2 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {filterFAQ(merchantFAQ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune question trouvée pour "{searchTerm}"
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Votre question n'est pas ici ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter !
            </p>
            <Link to="/contact">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contacter le Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;