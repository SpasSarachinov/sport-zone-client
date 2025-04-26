import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import ProductCard from "../components/products/ProductCard";
import FilterSidebar from "../components/products/FilterSidebar";
import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Product } from "../types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FilterState {
  category: string | null;
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  pageSize: number;
  pageNumber: number;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    search: "",
    minPrice: null,
    maxPrice: null,
    rating: null,
    pageSize: 10,
    pageNumber: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const fetchTimeoutRef = useRef<number>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://sportzone-api.onrender.com/api/Categories"
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.items && Array.isArray(data.items)) {
          setCategories(data.items);
        } else {
          console.error("Unexpected categories response format:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");

    console.log("Initializing filters from URL:", {
      category,
      search,
      minPrice,
      maxPrice,
      rating,
    });

    setFilters((prev) => ({
      ...prev,
      category: category || null,
      search: search || "",
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      rating: rating ? Number(rating) : null,
    }));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let url = "https://sportzone-api.onrender.com/api/Products";
        const params = new URLSearchParams();

        if (filters.search.trim() !== "") {
          params.append("Title", filters.search.trim());
        }
        if (filters.category) {
          params.append("CategoryId", filters.category);
        }
        if (filters.minPrice !== null) {
          params.append("MinPrice", filters.minPrice.toString());
        }
        if (filters.maxPrice !== null) {
          params.append("MaxPrice", filters.maxPrice.toString());
        }
        if (filters.rating !== null) {
          params.append("MinRating", filters.rating.toString());
        }
        if (filters.pageSize) {
          params.append("PageSize", filters.pageSize.toString());
        }
        if (filters.pageNumber) {
          params.append("PageNumber", filters.pageNumber.toString());
        }

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        console.log("Fetching products with URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Products response:", data);

        if (data.items && Array.isArray(data.items)) {
          setProducts(data.items);
          setTotalCount(data.totalCount || 0);
        } else {
          console.error("Unexpected API response format:", data);
          setProducts([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(fetchProducts, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [filters]);

  const handleApplyFilters = (newFilters: Partial<FilterState>) => {
    console.log("Applying new filters:", newFilters);
    const updatedFilters = { ...filters, ...newFilters };
    console.log("Updated filters:", updatedFilters);

    setFilters(updatedFilters);

    const newParams = new URLSearchParams();
    if (updatedFilters.category) {
      newParams.set("category", updatedFilters.category);
    }
    if (updatedFilters.search) {
      newParams.set("search", updatedFilters.search);
    }
    if (updatedFilters.minPrice !== null) {
      newParams.set("minPrice", updatedFilters.minPrice.toString());
    }
    if (updatedFilters.maxPrice !== null) {
      newParams.set("maxPrice", updatedFilters.maxPrice.toString());
    }
    if (updatedFilters.rating !== null) {
      newParams.set("rating", updatedFilters.rating.toString());
    }

    console.log("Setting new URL params:", newParams.toString());
    setSearchParams(newParams);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setFilters((prev) => ({ ...prev, pageSize: newPageSize }));
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("pageSize", newPageSize.toString());
      return newParams;
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: newPage }));
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name || null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">
              {getCategoryName(filters.category)
                ? `${getCategoryName(filters.category)} Продукти`
                : "Всички продукти"}
            </h1>
            <p className="text-black mt-2">
              Показване на {products.length} от {totalCount} продукта
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Продукти на страница:
              </label>
              <select
                id="pageSize"
                value={filters.pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            {user?.role === "admin" && (
              <div className="flex space-x-4">
                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Нов продукт
                </Link>
                <Link
                  to="/admin/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Управление на продуктите
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar
            categories={categories}
            selectedCategory={filters.category}
            searchQuery={filters.search}
            onApplyFilters={handleApplyFilters}
          />

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dark-600 text-lg">
                  Няма намерени продукти, отговарящи на вашите критерии.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={filters.pageNumber === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.pageNumber - 1)}
                    disabled={filters.pageNumber === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    &lsaquo;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= filters.pageNumber - 2 &&
                          page <= filters.pageNumber + 2)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            filters.pageNumber === page
                              ? "bg-primary-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => handlePageChange(filters.pageNumber + 1)}
                    disabled={filters.pageNumber === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={filters.pageNumber === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
