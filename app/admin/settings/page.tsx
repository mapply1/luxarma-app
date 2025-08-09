"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "iconoir-react";

// Dynamic import for better performance
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

export default function AdminSettingsPage() {
  return (
    <>
      <AdminCommandPalette />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          </div>
          <p className="text-gray-600">
            Configurez les paramètres de votre application
          </p>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-luxarma-text">Paramètres généraux</CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Configuration de base de l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-luxarma-text mb-2">Paramètres à venir</h3>
              <p className="text-luxarma-subtext">
                Les paramètres de configuration seront bientôt disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}