import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/userSlice';
import { StarIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Product {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  primaryImageUrl: string;
  secondaryImages: Array<{
    id: string | null;
    uri: string;
  }>;
  categoryId: string;
  quantity: number;
  rating: number;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  discount?: number;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
  productId: string;
}

// Add these interfaces for the API response
interface ReviewResponse {
  items: ReviewItem[];
  totalCount: number;
}

interface ReviewItem {
  id: string;
  content: string;
  rating: number;
  createdOn: string;
  userId: string;
  userNames: string;
}

// Add this function to decode JWT token and get user ID
const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Add this constant for Quill modules configuration
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const quillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet'
];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdOn');
  const [sortDescending, setSortDescending] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);

  // In your component, get the current user's ID from the token
  const currentUserId = token ? getUserIdFromToken(token) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://sportzone-api.onrender.com/api/Products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      const queryParams = new URLSearchParams({
        ProductId: product.id,
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        SortBy: sortBy,
        SortDescending: sortDescending.toString()
      });

      const response = await fetch(
        `https://sportzone-api.onrender.com/api/Reviews?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.items);
      // Calculate total pages
      setTotalPages(Math.ceil(data.totalCount / pageSize));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Възникна грешка при зареждането на отзивите');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product, pageNumber, pageSize, sortBy, sortDescending]);

  const handleAddToCart = async () => {
    if (!product || !token) return;
    
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Orders/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      toast.success('Продуктът беше добавен в количката', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      toast.error('Възникна грешка при добавянето на продукта в количката', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const isInWishlist = product ? wishlist.includes(product.id) : false;

  const handleWishlistToggle = () => {
    if (!product) return;
    fetch(`https://sportzone-api.onrender.com/api/Wishlist/add-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: product.id })
    });
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.info('Продуктът беше премахнат от списъка с желания', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      dispatch(addToWishlist(product.id));
      toast.success('Продуктът беше добавен в списъка с желания', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !product) return;

    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          content: newReviewComment,
          rating: newReviewRating
        })
        
      });
      console.log(product.id,
        newReviewComment,
        newReviewRating);
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Reset the form
      setNewReviewRating(0);
      setNewReviewComment('');
      
      // Fetch updated reviews using the existing function
      await fetchReviews();
      
      toast.success('Благодарим за вашия отзив!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error('Възникна грешка при публикуването на отзива', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const DeleteConfirmationToast = () => (
      <div className="p-4">
        <p className="text-gray-700 mb-4">Сигурни ли сте, че искате да изтриете този отзив?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              toast.dismiss();
              deleteReview(reviewId);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Да, изтрий
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Отказ
          </button>
        </div>
      </div>
    );

    const deleteReview = async (id: string) => {
      try {
        const response = await fetch(`https://sportzone-api.onrender.com/api/Reviews/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: token
          })
        });

        if (!response.ok) {
          throw new Error('Failed to delete review');
        }

        toast.success('Отзивът беше изтрит успешно');
        fetchReviews(); // Refresh the reviews list
      } catch (error) {
        toast.error('Възникна грешка при изтриването на отзива');
      }
    };

    toast(<DeleteConfirmationToast />, {
      position: "bottom-right",
      autoClose: false,
      closeOnClick: false,
      draggable: true,
      closeButton: false,
      className: "w-80"
    });
  };

  const handleEditReview = async (reviewId: string) => {
    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Reviews/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: reviewId,
          content: editContent,
          rating: editRating,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      toast.success('Отзивът беше обновен успешно');
      setEditingReviewId(null);
      fetchReviews(); // Refresh the reviews list
    } catch (error) {
      toast.error('Възникна грешка при обновяването на отзива');
    }
  };

  const startEditing = (review: ReviewItem) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
    setEditRating(review.rating);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg">Зареждане...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg text-red-600">{error || 'Продуктът не е намерен'}</div>
      </div>
    );
  }

  const discountedPrice = product.regularPrice * (1 - (product.discount || 0) / 100);

  const calculateAverageRating = (reviews: ReviewItem[]): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };
  const styles = `
    .ql-editor {
      min-height: 120px;
      height: 120px; /* Fixed height */
      max-height: 120px;
      overflow-y: auto;
    }
    
    .ql-container {
      font-size: 16px;
    }

    .ql-toolbar {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }

    .ql-container {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
      margin-bottom: 0; /* Remove bottom margin */
    }

    /* Add specific height to Quill wrapper */
    .quill {
      height: 180px; /* Total height including toolbar */
      margin-bottom: 20px; /* Add space between editor and button */
    }
  `;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={selectedImage === 0 
                  ? product.primaryImageUrl 
                  : product.secondaryImages[selectedImage - 1].uri}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setSelectedImage(prev => {
                  const totalImages = product.secondaryImages.length + 1;
                  return (prev - 1 + totalImages) % totalImages;
                })}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md transition-colors group border-2 border-black"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setSelectedImage(prev => {
                  const totalImages = product.secondaryImages.length + 1;
                  return (prev + 1) % totalImages;
                })}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md transition-colors group border-2 border-black"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Secondary Images Gallery */}
            {product.secondaryImages && product.secondaryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {/* Primary Image Thumbnail */}
                <div 
                  className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity ${
                    selectedImage === 0 ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedImage(0)}
                >
                  <img
                    src={product.primaryImageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                
                {/* Secondary Images Thumbnails */}
                {product.secondaryImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity ${
                      selectedImage === index + 1 ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedImage(index + 1)}
                  >
                    <img
                      src={image.uri}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Rating Display */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating ? `${product.rating.toFixed(1)} от 5` : 'Все още няма рейтинг'}
                {reviews.length > 0 && ` (${reviews.length} ${reviews.length === 1 ? 'отзив' : 'отзива'})`}
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {product.discount ? (
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {discountedPrice.toFixed(2)} лв.
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.regularPrice.toFixed(2)} лв.
                  </span>
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-sm">
                    -{product.discount}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {product.regularPrice.toFixed(2)} лв.
                </span>
              )}
            </div>

            {/* Stock Status and Quantity */}
            <div className="space-y-3 border-t border-b py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Статус:</span>
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                    product.quantity > 10 
                      ? 'bg-green-500' 
                      : product.quantity > 5 
                        ? 'bg-yellow-500' 
                        : product.quantity > 0 
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    product.quantity > 10 
                      ? 'text-green-700' 
                      : product.quantity > 5 
                        ? 'text-yellow-700' 
                        : product.quantity > 0 
                          ? 'text-red-700'
                          : 'text-gray-600'
                  }`}>
                    {product.quantity > 0 ? 'В наличност' : 'Изчерпан'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Количество в склада:</span>
                <span className={`text-sm font-medium ${
                  product.quantity > 10 
                    ? 'text-green-700' 
                    : product.quantity > 5 
                      ? 'text-yellow-700' 
                      : 'text-red-700'
                }`}>
                  {product.quantity} бр.
                </span>
              </div>
            </div>

            <div 
              className="text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Quantity Selector - Only show if product is in stock */}
            {product.quantity > 0 && (
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Избери количество:
                </label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="string"
                    id="quantity"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-x py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  (Максимум: {product.quantity} бр.)
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 px-6 py-3 rounded-md transition-colors ${
                  product.quantity > 0 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={product.quantity === 0}
              >
                {product.quantity > 0 ? 'Добави в количка' : 'Изчерпан'}
              </button>
              {token && (
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 border rounded-md bg-gray-100 hover:bg-primary-100 transition-colors"
                  title={isInWishlist ? "Премахни от списъка с желания" : "Добави в списъка с желания"}
                >
                  {isInWishlist ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Отзиви на клиенти</h2>
          
          {/* Add Review Form */}
          {token ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <h3 className="text-lg font-semibold mb-4">Добави отзив</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Рейтинг
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110 bg-transparent p-0"
                      >
                        <StarIcon
                          className={`w-8 h-8 ${
                            star <= newReviewRating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {newReviewRating ? `${newReviewRating} ${newReviewRating === 1 ? 'звезда' : 'звезди'}` : 'Изберете рейтинг'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Коментар
                  </label>
                  <div className="relative border rounded-md">
                    <ReactQuill
                      value={newReviewComment}
                      onChange={setNewReviewComment}
                      modules={quillModules}
                      formats={quillFormats}
                      theme="snow"
                      placeholder="Споделете вашето мнение за продукта..."
                    />
                  </div>
                </div>
                <div className="mt-8"> {/* Increased top margin */}
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    disabled={!newReviewRating || !newReviewComment.trim()}
                  >
                    Публикувай отзив
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <p className="text-gray-600">
                Моля <Link to="/login" className="text-primary-600 hover:underline">влезте в профила си</Link>{' '}
                за да публикувате отзив.
              </p>
            </div>
          )}

          {/* Reviews List Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Отзиви от клиенти</h2>
              <div className="flex items-center space-x-4">
                {/* Sorting Controls */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 text-sm"
                >
                  <option value="createdOn">По дата</option>
                  <option value="rating">По рейтинг</option>
                </select>
                <button
                  onClick={() => setSortDescending(!sortDescending)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  {sortDescending ? '↓ Низходящо' : '↑ Възходящо'}
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <>
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      {editingReviewId === review.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleEditReview(review.id);
                        }} 
                        className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Рейтинг
                            </label>
                            <div className="flex space-x-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className="focus:outline-none"
                                >
                                  <StarIcon
                                    className={`w-6 h-6 ${
                                      star <= editRating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Коментар
                            </label>
                            <div className="relative border rounded-md">
                              <ReactQuill
                                value={editContent}
                                onChange={setEditContent}
                                modules={quillModules}
                                formats={quillFormats}
                                className="quill"
                                theme="snow"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              type="submit"
                              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                            >
                              Запази
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReviewId(null)}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              Отказ
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {review.userNames}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdOn).toLocaleDateString('bg-BG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            {/* Only show edit/delete buttons if the current user is the review creator */}
                            {currentUserId && review.userId === currentUserId && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditing(review)}
                                  className="text-white hover:text-white p-1"
                                  title="Редактирай"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-white hover:text-white p-1"
                                  title="Изтрий"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <div 
                              className="text-gray-700 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: review.content }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPageNumber(1)}
                        disabled={pageNumber === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ««
                      </button>
                      <button
                        onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                        disabled={pageNumber === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        «
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setPageNumber(idx + 1)}
                          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                            pageNumber === idx + 1
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                        disabled={pageNumber === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        »
                      </button>
                      <button
                        onClick={() => setPageNumber(totalPages)}
                        disabled={pageNumber === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        »»
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">Все още няма отзиви за този продукт.</p>
                {token && (
                  <p className="text-gray-600 mt-2">
                    Бъдете първият, който ще сподели мнение за този продукт!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 