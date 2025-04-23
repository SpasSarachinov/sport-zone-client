import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">За SportZone</h3>
            <p className="text-secondary-300">
              Вашият надежден партньор за качествена спортна екипировка и аксесоари.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Бързи Връзки</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-secondary-300 hover:text-white">
                  Продукти
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-300 hover:text-white">
                  За Нас
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Контакти</h3>
            <ul className="space-y-2 text-secondary-300">
              <li>Телефон: +359 888 123 456</li>
              <li>Имейл: info@sportzone.bg</li>
              <li>Адрес: ул. Спортна 123, София</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
          <p>&copy; {new Date().getFullYear()} SportZone. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 