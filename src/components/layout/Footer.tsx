export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-white">Elica</span>
            </div>
            <p className="text-sm leading-relaxed">
              Plataforma de turnos médicos online. Reservá tus citas de forma
              rápida y sencilla, las 24 horas del día.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">Teléfono: </span>
                <a
                  href="tel:+541112345678"
                  className="hover:text-white transition-colors"
                >
                  (011) 1234-5678
                </a>
              </li>
              <li>
                <span className="text-gray-400">Correo electrónico: </span>
                <a
                  href="mailto:info@elica.com.ar"
                  className="hover:text-white transition-colors"
                >
                  info@elica.com.ar
                </a>
              </li>
              <li>
                <span className="text-gray-400">Dirección: </span>
                Av. Corrientes 1234, CABA
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Horarios de atención</h3>
            <ul className="space-y-2 text-sm">
              <li>Lunes a viernes: 9:00 - 18:00</li>
              <li>Sábados: 9:00 - 13:00</li>
              <li>Domingos y feriados: Cerrado</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Elica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
