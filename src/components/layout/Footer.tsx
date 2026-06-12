import { Separator } from '../ui/separator';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <img src="/logo.svg" alt="Elica" className="h-8 w-auto mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Plataforma de turnos médicos online. Reservá tus citas de forma
              rápida y sencilla, las 24 horas del día.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <span>Teléfono: </span>
                <a href="tel:+541112345678" className="hover:text-primary-foreground transition-colors">(011) 1234-5678</a>
              </li>
              <li>
                <span>Correo electrónico: </span>
                <a href="mailto:info@elica.com.ar" className="hover:text-primary-foreground transition-colors">info@elica.com.ar</a>
              </li>
              <li>
                <span>Dirección: </span>
                Hermanos Ros 3246, Lanús Oeste
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Horarios de atención</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Lunes a viernes: 9:00 - 18:00</li>
              <li>Sábados: 9:00 - 13:00</li>
              <li>Domingos y feriados: Cerrado</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/10" />

        <div className="text-center text-sm text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} Elica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
