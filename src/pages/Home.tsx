import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { specialtiesApi } from '../services/api';
import type { Specialty } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SpecialtyIcon } from '../components/ui/SpecialtyIcon';

export function Home() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    specialtiesApi
      .getAll()
      .then(setSpecialties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted/50 py-20 sm:py-28 px-6">
        {/* Glass accent blob */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              Reservá tu turno médico de forma simple
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              Elegí la especialidad, seleccioná tu médico preferido y reservá el
              horario que mejor se adapte a vos. Sin llamadas, sin esperas.
            </p>
            <Link to="/especialidades">
              <Button variant="secondary" size="lg">
                Reservar turno ahora
              </Button>
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <img src="/logo.svg" alt="" className="w-64 h-auto opacity-10" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Specialties Preview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Nuestras especialidades
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Contamos con un equipo de profesionales capacitados en diversas
            áreas de la salud para cuidar de vos y tu familia.
          </p>

          {loading && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="w-6 h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialties.map((specialty) => (
                  <Card key={specialty.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <SpecialtyIcon name={specialty.icon} className="w-6 h-6 text-primary" />
                        <CardTitle>{specialty.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{specialty.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link to="/especialidades">
                  <Button variant="outline">
                    Ver todas las especialidades
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Location */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted/50 py-16 px-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Dónde estamos</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Hermanos Ros 3246, Lanús Oeste, Provincia de Buenos Aires
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <iframe
              title="Ubicación Elica"
              src="https://maps.google.com/maps?width=100%25&height=400&hl=es&q=Hermanos%20Ros%203246%2C%20Lan%C3%BAs%20Oeste%2C%20Buenos%20Aires&t=&z=15&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="400"
              loading="lazy"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
