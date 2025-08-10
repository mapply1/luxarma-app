"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PlayCircle } from "lucide-react";

export default function TutorialPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/app">Tableau de Bord</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tutoriel</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <PlayCircle className="h-8 w-8 text-blue-600" />
          Comment utiliser mon app ?
        </h1>
        <p className="text-gray-600 text-lg">
          Regardez ce tutoriel interactif pour comprendre comment l'application fonctionne et découvrir toutes ses fonctionnalités.
        </p>
      </div>

              {/* Tutorial Card */}
        <Card className="border-gray-200">
          <CardContent>
            {/* Supademo Embed */}
            <div 
              style={{
                position: "relative", 
                boxSizing: "content-box", 
                maxHeight: "80vh", 
                width: "100%", 
                aspectRatio: "2.0220082530949104", 
                padding: "40px 0 40px 0"
              }}
              className="rounded-lg overflow-hidden shadow-lg border border-gray-200"
            >
              <iframe 
                src="https://app.supademo.com/embed/cme5q2qs11re6h3pyr5uz9hi3?embed_v=2&utm_source=embed" 
                loading="lazy" 
                title="Luxarma Demo" 
                allow="clipboard-write" 
                frameBorder="0" 
                style={{
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  width: "100%", 
                  height: "100%"
                }}
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
