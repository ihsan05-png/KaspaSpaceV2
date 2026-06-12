import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Kembali ke Home
                </Link>
            </div>
        </div>
    );
}
