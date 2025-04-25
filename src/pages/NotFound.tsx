import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">Страницата не беше намерена</h2>
        <p className="mt-4 text-lg text-gray-600">
          Съжаляваме, но страницата, която търсите, не съществува или е преместена.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 hover:text-white transition-colors"
          >
            Върнете се към началната страница
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 