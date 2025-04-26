import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../store/slices/cartSlice";
import { ShoppingCartIcon, StarIcon } from "@heroicons/react/24/solid";
import { RootState } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  id: string;
  title: string;
  description: string;
  mainImageUrl: string;
  regularPrice: number;
  quantity: number;
  categoryId: string;
  rating?: number;
  discountPercentage?: number;
  discountedPrice?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(
        `https://sportzone-api.onrender.com/api/Orders`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      dispatch(
        addItem({
          id: product.id,
          title: product.title,
          regularPrice: product.regularPrice,
          quantity: 1,
          imageUrl: product.mainImageUrl || "",
          mainImageUrl: product.mainImageUrl,
          discountPercentage: product.discountPercentage,
          discountedPrice: product.discountedPrice,
        })
      );

      toast.success("Продуктът беше добавен в количката", {
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
      console.error("Error adding product to cart:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Възникна грешка при добавянето на продукта",
        {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  const displayPrice = (price: number | undefined) => {
    if (price === undefined) return "0.00";
    return price.toFixed(2) + " лв.";
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-[410px]">
        {/* Product Image - Fixed height */}
        <div className="h-48 w-full overflow-hidden bg-gray-200">
          <img
            src={product.mainImageUrl || "/placeholder-image.jpg"}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          />
        </div>

        {/* Product Info - Using flex column for layout */}
        <div className="h-[calc(410px-192px)] flex flex-col">
          <div className="p-4 flex flex-col h-full">
            {/* Title - Fixed height with ellipsis */}
            <div className="h-12">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {product.title}
              </h3>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow justify-between mt-2">
              <div className="space-y-2">
                {/* Rating */}
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    ({product.rating?.toFixed(1) || "0.0"})
                  </span>
                </div>

                {/* Price and Availability */}
                <div className="flex flex-col space-y-1">
                  {product.discountPercentage ? (
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold text-primary-600">
                        {product.discountedPrice?.toFixed(2)} лв.
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        {product.regularPrice.toFixed(2)} лв.
                      </p>
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-xs">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-gray-900">
                      {product.regularPrice.toFixed(2)} лв.
                    </p>
                  )}
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`text-sm ${
                        product.quantity > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.quantity > 0 ? "В наличност" : "Няма в наличност"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full h-12 flex hover:text-gray-900 items-center justify-center rounded-md ${
                  product.quantity === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
                disabled={product.quantity === 0}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {product.quantity === 0 ? "Няма в наличност" : "Добави в количка"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
