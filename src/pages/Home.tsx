import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Добре дошли в SportZone</h1>
          <p className="hero-subtitle">
            Вашата дестинация за премиум спортна екипировка и аксесоари.
          </p>
          <Link to="/products" className="btn btn-primary hover:text-gray-300">
            Пазарувай сега
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Избрани Категории</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Football Category */}
          <Link to="/products?category=football" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800"
              alt="Футболна Екипировка"
              className="w-full"
            />
            <div className="category-card-content">
              <h3 className="category-title">Футбол</h3>
              <span className="text-sm">Разгледай Екипировка</span>
            </div>
          </Link>

          {/* Basketball Category */}
          <Link to="/products?category=basketball" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800"
              alt="Баскетболна Екипировка"
              className="w-full"
            />
            <div className="category-card-content">
              <h3 className="category-title">Баскетбол</h3>
              <span className="text-sm">Разгледай Екипировка</span>
            </div>
          </Link>

          {/* Tennis Category */}
          <Link to="/products?category=tennis" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800"
              alt="Тенис Екипировка"
              className="w-full"
            />
            <div className="category-card-content">
              <h3 className="category-title">Тенис</h3>
              <span className="text-sm">Разгледай Екипировка</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Препоръчани Продукти</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Featured products will be rendered here */}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Защо Да Изберете Нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Fast Delivery */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Бърза Доставка</h3>
              <p className="text-body">Бърза и надеждна доставка до вашия адрес</p>
            </div>

            {/* Quality Guarantee */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Гарантирано Качество</h3>
              <p className="text-body">Всички продукти са качествено проверени</p>
            </div>

            {/* Easy Returns */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Лесно Връщане</h3>
              <p className="text-body">30-дневна политика за връщане на всички продукти</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 