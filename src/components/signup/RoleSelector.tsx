
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Building } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Je suis un(e)...</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRole === "influencer" ? "ring-2 ring-pink-500 bg-pink-50" : ""
          }`}
          onClick={() => onRoleChange("influencer")}
        >
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-pink-500" />
            <h4 className="font-semibold mb-2">Influenceur/se</h4>
            <p className="text-sm text-gray-600">
              Je veux proposer mes services et collaborer avec des marques
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRole === "merchant" ? "ring-2 ring-teal-500 bg-teal-50" : ""
          }`}
          onClick={() => onRoleChange("merchant")}
        >
          <CardContent className="p-6 text-center">
            <Building className="w-12 h-12 mx-auto mb-3 text-teal-500" />
            <h4 className="font-semibold mb-2">Commerçant/e</h4>
            <p className="text-sm text-gray-600">
              Je représente une marque et je cherche des influenceurs
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
